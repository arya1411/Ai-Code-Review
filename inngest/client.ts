import {Inngest} from "inngest"
import { env } from "@/lib/env"

export const inngest = new Inngest({
  id: "code_review",
  isDev: env.INNGEST_DEV === "1",
});
