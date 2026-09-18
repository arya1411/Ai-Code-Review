import { createHmac, timingSafeEqual } from "crypto"

export function verifyGitHubWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
) {
  if (!signature?.startsWith("sha256=")) return false

  const digest = signature.slice("sha256=".length)
  if (!/^[a-f0-9]{64}$/i.test(digest)) return false

  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "hex")
  const received = Buffer.from(digest, "hex")

  return received.length === expected.length && timingSafeEqual(received, expected)
}
