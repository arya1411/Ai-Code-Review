import "dotenv/config";

import { Octokit } from "octokit";
import prismaImport from "../lib/db";

type PrismaClientInstance = typeof import("../lib/db").default;
const prismaModule = prismaImport as unknown as { default?: PrismaClientInstance };
const prisma = prismaModule.default ?? (prismaImport as unknown as PrismaClientInstance);

const baseUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_BASE_URL;
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

if (!baseUrl) {
  throw new Error("APP_BASE_URL or NEXT_PUBLIC_APP_BASE_URL must be configured");
}

if (!webhookSecret) {
  throw new Error("GITHUB_WEBHOOK_SECRET must be configured");
}

const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/webhooks/github`;

async function reconcileWebhooks() {
  const connections = await prisma.repository.findMany({
    include: {
      user: {
        select: {
          accounts: {
            where: { providerId: "github" },
            select: { accessToken: true },
          },
        },
      },
    },
  });

  const repositories = new Map<string, typeof connections>();
  for (const connection of connections) {
    const key = connection.githubId.toString();
    const existing = repositories.get(key) ?? [];
    existing.push(connection);
    repositories.set(key, existing);
  }

  let repaired = 0;
  let created = 0;
  let failed = 0;

  for (const repositoryConnections of repositories.values()) {
    const repository = repositoryConnections[0];
    let completed = false;

    for (const connection of repositoryConnections) {
      const token = connection.user.accounts[0]?.accessToken;
      if (!token) continue;

      try {
        const octokit = new Octokit({ auth: token });
        const { data: hooks } = await octokit.rest.repos.listWebhooks({
          owner: repository.owner,
          repo: repository.name,
        });
        const existingHook = hooks.find((hook) => hook.config.url === webhookUrl);

        if (existingHook) {
          await octokit.rest.repos.updateWebhook({
            owner: repository.owner,
            repo: repository.name,
            hook_id: existingHook.id,
            active: true,
            events: ["pull_request", "push"],
            config: {
              url: webhookUrl,
              content_type: "json",
              secret: webhookSecret,
            },
          });
          repaired += 1;
          console.log(`Repaired ${repository.fullName}`);
        } else {
          await octokit.rest.repos.createWebhook({
            owner: repository.owner,
            repo: repository.name,
            active: true,
            events: ["pull_request", "push"],
            config: {
              url: webhookUrl,
              content_type: "json",
              secret: webhookSecret,
            },
          });
          created += 1;
          console.log(`Created ${repository.fullName}`);
        }

        completed = true;
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Could not reconcile ${repository.fullName}: ${message}`);
      }
    }

    if (!completed) failed += 1;
  }

  console.log(`Webhook reconciliation complete: ${repaired} repaired, ${created} created, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

reconcileWebhooks()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
