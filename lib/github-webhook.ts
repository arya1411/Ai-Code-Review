import { createHmac, timingSafeEqual } from "crypto"
import { z } from "zod"

// A signed request is still untrusted input. Validate types before converting
// IDs to BigInt or using payload fields in database and background jobs.
export const githubWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  ref: z.string().optional(),
  after: z.string().optional(),
  deleted: z.boolean().optional(),
  repository: z.object({
    id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    name: z.string().optional(),
    owner: z.object({ login: z.string().optional() }).optional(),
    default_branch: z.string().optional(),
  }).optional(),
  pull_request: z.object({
    id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    number: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    title: z.string().optional(),
    html_url: z.string().url().optional(),
    draft: z.boolean().optional(),
    user: z.object({ login: z.string().optional() }).nullish(),
    head: z.object({ sha: z.string().regex(/^[a-f0-9]{40}$/i).optional() }).optional(),
    base: z.object({ sha: z.string().regex(/^[a-f0-9]{40}$/i).optional() }).optional(),
  }).optional(),
})

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

export function isDefaultBranchPush(
  ref: string | undefined,
  defaultBranch: string | undefined,
  deleted: boolean | undefined,
) {
  if (deleted || !ref || !defaultBranch) return false
  return ref === `refs/heads/${defaultBranch}`
}
