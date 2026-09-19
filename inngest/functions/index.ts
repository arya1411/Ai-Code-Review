import { inngest } from '../client';
import prisma from '@/lib/db';
import { getRepoSnapshot } from '@/module/github/lib/github';
import { indexCodeBase } from '@/module/ai/lib/rag';
import { REPOSITORY_INDEX_TIMEOUT_ERROR } from '@/module/repository/lib/index-status';

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    concurrency: {
      limit: 1,
      key: 'event.data.userId + ":" + event.data.owner + "/" + event.data.repo',
    },
    timeouts: {
      finish: "30m",
    },
    triggers: [
      { event: "repository.connected" },
      { event: "repository.sync" },
    ],
  },
  async ({ event, step }) => {
    const { owner, repo, userId, commitSha } = event.data;

    const repository = await step.run("mark-indexing", async () => {
      const connectedRepository = await prisma.repository.findFirst({
        where: { userId, owner, name: repo },
        select: { id: true },
      });

      if (!connectedRepository) {
        throw new Error("Connected repository not found");
      }

      return prisma.repository.update({
        where: { id: connectedRepository.id },
        data: { indexStatus: "INDEXING", indexError: null },
        select: { id: true },
      });
    });

    try {
      const indexResult = await step.run("fetch-and-index", async () => {
        const account = await prisma.account.findFirst({
          where: {
            userId: userId,
            providerId: "github",
          },
        });

        if (!account?.accessToken) {
          throw new Error("No Github Access Token Found");
        }

        const snapshot = await getRepoSnapshot(account.accessToken, owner, repo, commitSha);

        if (snapshot.files.length === 0) {
          throw new Error("No indexable files were found in the repository");
        }

        const result = await indexCodeBase(
          repository.id,
          `${userId}:${owner}/${repo}`,
          snapshot.files,
        );
        return {
          fileCount: snapshot.files.length,
          commitSha: snapshot.commitSha,
          ...result,
        };
      });

      await step.run("mark-ready", async () => {
        await prisma.repository.update({
          where: { id: repository.id },
          data: {
            indexStatus: "READY",
            indexedAt: new Date(),
            indexedCommitSha: indexResult.commitSha,
            indexError: null,
          },
        });
      });

      return { success: true, ...indexResult };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Repository indexing failed";

      await step.run("mark-failed", async () => {
        await prisma.repository.update({
          where: { id: repository.id },
          data: { indexStatus: "FAILED", indexError: message.slice(0, 500) },
        });
      });

      throw error;
    }
  }
);

export const recoverCancelledIndex = inngest.createFunction(
  {
    id: "recover-cancelled-index",
    triggers: [{ event: "inngest/function.cancelled" }],
  },
  async ({ event, step }) => {
    const functionId = event.data.function_id;
    if (functionId !== "index-repo" && !functionId.endsWith("-index-repo")) {
      return { ignored: true };
    }

    const originalEvent = event.data.event as {
      data?: { owner?: unknown; repo?: unknown; userId?: unknown };
    };
    const { owner, repo, userId } = originalEvent.data ?? {};

    if (typeof owner !== "string" || typeof repo !== "string" || typeof userId !== "string") {
      return { ignored: true };
    }

    const cancelledAt = new Date(event.ts);
    const result = await step.run("mark-cancelled-index-failed", () =>
      prisma.repository.updateMany({
        where: {
          userId,
          owner,
          name: repo,
          indexStatus: "INDEXING",
          updatedAt: { lte: cancelledAt },
        },
        data: {
          indexStatus: "FAILED",
          indexError: REPOSITORY_INDEX_TIMEOUT_ERROR,
        },
      }),
    );

    return { recovered: result.count };
  },
);
