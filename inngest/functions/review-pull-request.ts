import { inngest } from "../client"
import prisma from "@/lib/db"
import { analyzePullRequest } from "@/module/ai/review"

export const reviewPullRequest = inngest.createFunction(
  {
    id: "review-pull-request",
    triggers: [{ event: "pull-request.review.requested" }],
  },
  async ({ event, step }) => {
    const { reviewId, userId, owner, repo, pullRequestNumber } = event.data

    await step.run("mark-analyzing", () =>
      prisma.review.update({
        where: { id: reviewId },
        data: { status: "ANALYZING", error: null },
      }),
    )

    try {
      return await step.run("analyze-pull-request", () =>
        analyzePullRequest({ reviewId, userId, owner, repo, pullRequestNumber }),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pull request review failed"

      await step.run("mark-review-failed", () =>
        prisma.review.update({
          where: { id: reviewId },
          data: { status: "FAILED", error: message.slice(0, 1_000) },
        }),
      )

      throw error
    }
  },
)
