import { inngest } from '../client';
import prisma from '@/lib/db';
import { getRepoSnapshot } from '@/module/github/lib/github';
import { indexCodeBase } from '@/module/ai/lib/rag';

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    concurrency: {
      limit: 1,
      key: 'event.data.userId + ":" + event.data.owner + "/" + event.data.repo',
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
