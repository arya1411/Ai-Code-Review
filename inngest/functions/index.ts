import { inngest } from '../client';
import prisma from '@/lib/db';
import { getRepoFileContent } from '@/module/github/lib/github';

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [{ event: "repository.connected" }],
  },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No Github Access Token Found");
      }

      return await getRepoFileContent(account.accessToken, owner, repo);
    });

    await step.run("index-codebase", async () => {
      // Indexing logic will go here
    });
  }
);