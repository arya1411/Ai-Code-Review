import test from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { parseServerEnv } from "../lib/env"
import { isDefaultBranchPush, verifyGitHubWebhookSignature } from "../lib/github-webhook"
import { cosineSimilarity, createCodeChunks, selectRelevantCodeChunks } from "../module/ai/lib/rag"
import { isIndexableRepositoryFile, isProbablyBinaryContent } from "../module/github/lib/repository-files"
import { parseReviewModelOutput } from "../module/ai/lib/review-output"
import { formatGitHubReviewComment } from "../module/ai/lib/github-review-comment"

const validEnvironment = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:3000",
  GITHUB_CLIENT_ID: "github-id",
  GITHUB_CLIENT_SECRET: "github-secret",
  GITHUB_WEBHOOK_SECRET: "webhook-secret",
  GOOGLE_GENERATIVE_AI_API_KEY: "google-key",
  PINECONE_DB_API_KEY: "pinecone-key",
  NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
} satisfies Record<string, string | undefined>

test("environment validation reports missing required configuration", () => {
  assert.throws(
    () => parseServerEnv({}),
    /Invalid server environment: DATABASE_URL/,
  )
  assert.equal(parseServerEnv(validEnvironment).PINECONE_INDEX, "codesentinal-vector-embeddings")
  assert.equal(parseServerEnv(validEnvironment).EMBEDDING_DIMENSIONS, 768)
})

test("GitHub webhook signatures are verified with SHA-256", () => {
  const body = JSON.stringify({ action: "opened" })
  const secret = "test-webhook-secret"
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`

  assert.equal(verifyGitHubWebhookSignature(body, signature, secret), true)
  assert.equal(verifyGitHubWebhookSignature(`${body}x`, signature, secret), false)
  assert.equal(verifyGitHubWebhookSignature(body, "sha256=invalid", secret), false)
})

test("only non-deleted default-branch pushes trigger indexing", () => {
  assert.equal(isDefaultBranchPush("refs/heads/main", "main", false), true)
  assert.equal(isDefaultBranchPush("refs/heads/feature", "main", false), false)
  assert.equal(isDefaultBranchPush("refs/heads/main", "main", true), false)
  assert.equal(isDefaultBranchPush(undefined, "main", false), false)
})

test("code files are split into overlapping, source-labelled chunks", () => {
  const content = "x".repeat(7_000)
  const chunks = createCodeChunks([{ path: "src/index.ts", content }])

  assert.equal(chunks.length, 2)
  assert.equal(chunks[0].path, "src/index.ts")
  assert.match(chunks[0].content, /^File: src\/index\.ts\nChunk: 1/)
  assert.match(chunks[1].content, /^File: src\/index\.ts\nChunk: 2/)
})

test("cosine similarity ranks aligned embeddings above unrelated ones", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1)
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0)
  assert.ok(cosineSimilarity([1, 1], [1, 0]) > 0.7)
  assert.equal(cosineSimilarity([], []), 0)
})

test("direct repository fallback ranks relevant files and excludes sensitive files", () => {
  const context = selectRelevantCodeChunks("authentication session", [
    { path: "src/auth.ts", content: "export function validateSession() { return true }" },
    { path: "src/colors.ts", content: "export const blue = '#00f'" },
  ], 1)

  assert.equal(context[0].path, "src/auth.ts")
  assert.equal(isIndexableRepositoryFile({ path: ".env", type: "blob", size: 20 }), false)
  assert.equal(isIndexableRepositoryFile({ path: "certs/private.key", type: "blob", size: 20 }), false)
  assert.equal(isIndexableRepositoryFile({ path: ".env.example", type: "blob", size: 20 }), false)
  assert.equal(isIndexableRepositoryFile({ path: ".aws/credentials", type: "blob", size: 20 }), false)
  assert.equal(isIndexableRepositoryFile({ path: "terraform/prod.tfvars", type: "blob", size: 20 }), false)
  assert.equal(isProbablyBinaryContent(Buffer.from([0, 1, 2, 3])), true)
  assert.equal(isProbablyBinaryContent(Buffer.from("export const safe = true")), false)
})

test("review output parser accepts fenced JSON and rejects invalid scores", () => {
  const output = parseReviewModelOutput(`\`\`\`json
    {"riskScore":42,"riskLevel":"MEDIUM","summary":"Auth behavior changed","reasons":["Sensitive path"],"findings":[]}
  \`\`\``)

  assert.equal(output.riskScore, 42)
  assert.equal(output.riskLevel, "MEDIUM")
  assert.throws(() => parseReviewModelOutput(
    '{"riskScore":101,"riskLevel":"HIGH","summary":"Bad","reasons":[],"findings":[]}',
  ))
})

test("GitHub review comments include risk, findings, and an idempotency marker", () => {
  const comment = formatGitHubReviewComment("owner/repo#42", {
    riskScore: 78,
    riskLevel: "HIGH",
    summary: "Authentication behavior changed.",
    reasons: ["Touches an authorization boundary"],
    findings: [{
      severity: "HIGH",
      category: "security",
      filePath: "src/auth.ts",
      line: 42,
      message: "The authorization check can be bypassed.",
      suggestion: "Reject requests without a verified session.",
    }],
  })

  assert.match(comment, /codesentinel-review:owner\/repo#42/)
  assert.match(comment, /Risk: HIGH · 78\/100/)
  assert.match(comment, /src\/auth\.ts:42/)
  assert.match(comment, /authorization check can be bypassed/)
})
