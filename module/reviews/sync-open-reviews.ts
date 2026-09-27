import { Octokit } from "octokit"
import prisma from "@/lib/db"
import { inngest } from "@/inngest/client"

type ConnectedRepository = {
  id: string
  owner: string
  name: string
}

/**
 * Backfill review jobs for pull requests that were already open when a
 * repository was connected. GitHub webhooks only report changes that happen
 * after the hook is installed, so they cannot discover those PRs on their own.
 */
export async function syncOpenPullRequestReviews(input: {
  userId: string
  accessToken: string
}) {
  const repositories = await prisma.repository.findMany({
    where: { userId: input.userId },
    select: { id: true, owner: true, name: true },
  })

  if (repositories.length === 0) return

  const octokit = new Octokit({ auth: input.accessToken })

  const results = await Promise.allSettled(
    repositories.map((repository) => syncRepositoryPullRequests({
      octokit,
      repository,
      userId: input.userId,
    })),
  )

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Could not sync open pull requests for ${repositories[index].owner}/${repositories[index].name}:`,
        result.reason,
      )
    }
  })
}

async function syncRepositoryPullRequests(input: {
  octokit: Octokit
  repository: ConnectedRepository
  userId: string
}) {
  const { data: pullRequests } = await input.octokit.rest.pulls.list({
    owner: input.repository.owner,
    repo: input.repository.name,
    state: "open",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  })

  const reviewablePullRequests = pullRequests.filter((pullRequest) => !pullRequest.draft)
  if (reviewablePullRequests.length === 0) return

  const existingReviews = await prisma.review.findMany({
    where: {
      repositoryId: input.repository.id,
      OR: reviewablePullRequests.map((pullRequest) => ({
        githubPullRequestId: BigInt(pullRequest.id),
        headSha: pullRequest.head.sha,
      })),
    },
    select: { githubPullRequestId: true, headSha: true },
  })
  const existingKeys = new Set(
    existingReviews.map((review) => `${review.githubPullRequestId}:${review.headSha}`),
  )

  for (const pullRequest of reviewablePullRequests) {
    const reviewKey = `${pullRequest.id}:${pullRequest.head.sha}`
    if (existingKeys.has(reviewKey)) continue

    const review = await prisma.review.upsert({
      where: {
        repositoryId_githubPullRequestId_headSha: {
          repositoryId: input.repository.id,
          githubPullRequestId: BigInt(pullRequest.id),
          headSha: pullRequest.head.sha,
        },
      },
      create: {
        repositoryId: input.repository.id,
        githubPullRequestId: BigInt(pullRequest.id),
        pullRequestNumber: pullRequest.number,
        title: pullRequest.title,
        author: pullRequest.user?.login,
        url: pullRequest.html_url,
        headSha: pullRequest.head.sha,
        baseSha: pullRequest.base.sha,
      },
      update: {},
      select: { id: true },
    })

    try {
      await inngest.send({
        id: `open-pr-sync:${input.repository.id}:${pullRequest.id}:${pullRequest.head.sha}`,
        name: "pull-request.review.requested",
        data: {
          reviewId: review.id,
          userId: input.userId,
          owner: input.repository.owner,
          repo: input.repository.name,
          pullRequestNumber: pullRequest.number,
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not queue pull request review"
      await prisma.review.update({
        where: { id: review.id },
        data: { status: "FAILED", error: message.slice(0, 1_000) },
      })
      throw error
    }
  }
}
