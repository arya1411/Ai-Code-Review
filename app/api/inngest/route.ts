import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo, recoverCancelledIndex } from "@/inngest/functions";
import { reviewPullRequest } from "@/inngest/functions/review-pull-request";
import { env } from "@/lib/env";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    ...(env.REPOSITORY_INDEXING_ENABLED === "1" ? [indexRepo, recoverCancelledIndex] : []),
    reviewPullRequest,
  ]
});
