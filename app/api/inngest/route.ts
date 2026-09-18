import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "@/inngest/functions";
import { reviewPullRequest } from "@/inngest/functions/review-pull-request";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexRepo,
    reviewPullRequest,
  ]
});
