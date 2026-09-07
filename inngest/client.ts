import {Inngest} from "inngest"

export const inngest = new Inngest({
  id: "code_review",
  isDev: process.env.INNGEST_DEV === "1",
});
