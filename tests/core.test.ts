import test from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { parseServerEnv } from "../lib/env"
import { githubWebhookPayloadSchema, isDefaultBranchPush, verifyGitHubWebhookSignature } from "../lib/github-webhook"
import { cosineSimilarity, createCodeChunks, createEmbeddingBatches, selectRelevantCodeChunks, embedIndexChunks } from "../module/ai/lib/rag"
import { boundIndexFiles, MAX_INDEX_SOURCE_CHARACTERS, MAX_INDEX_FILE_CHARACTERS } from "../module/repository/lib/index-limits"
import { buildRepositoryChatContext, buildRepositoryChatHistory, repositoryChatInput } from "../module/ai/lib/chat-context"
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
  GROQ_API_KEY: "groq-key",
  NEXT_PUBLIC_APP_BASE_URL: "http://localhost:3000",
  REPOSITORY_INDEXING_ENABLED: "0",
} satisfies Record<string, string | undefined>

test("environment validation reports missing required configuration", () => {
  assert.throws(
    () => parseServerEnv({}),
    /Invalid server environment: DATABASE_URL/,
  )
  assert.equal(parseServerEnv(validEnvironment).EMBEDDING_DIMENSIONS, 768)
  assert.throws(
    () => parseServerEnv({ ...validEnvironment, GROQ_API_KEY: undefined }),
    /GROQ_API_KEY/,
  )
  assert.throws(
    () => parseServerEnv({ ...validEnvironment, EMBEDDING_DIMENSIONS: "1536" }),
    /EMBEDDING_DIMENSIONS must be 768/,
  )
})

test("PR review configuration works without an embedding key while indexing is paused", () => {
  const paused = parseServerEnv({ ...validEnvironment, GOOGLE_GENERATIVE_AI_API_KEY: undefined })
  assert.equal(paused.REPOSITORY_INDEXING_ENABLED, "0")
  assert.equal(paused.GOOGLE_GENERATIVE_AI_API_KEY, undefined)
  assert.doesNotThrow(() => parseServerEnv({ ...validEnvironment, GOOGLE_GENERATIVE_AI_API_KEY: "" }))
  assert.throws(() => parseServerEnv({
    ...validEnvironment,
    REPOSITORY_INDEXING_ENABLED: "1",
    GOOGLE_GENERATIVE_AI_API_KEY: undefined,
  }), /GOOGLE_GENERATIVE_AI_API_KEY/)
  assert.throws(() => parseServerEnv({ ...validEnvironment, REPOSITORY_INDEXING_ENABLED: "yes" }), /REPOSITORY_INDEXING_ENABLED/)
  assert.equal(parseServerEnv({ ...validEnvironment, REPOSITORY_INDEXING_ENABLED: "1" }).REPOSITORY_INDEXING_ENABLED, "1")
  assert.equal(parseServerEnv({ ...validEnvironment, REPOSITORY_INDEXING_ENABLED: undefined }).REPOSITORY_INDEXING_ENABLED, "1")
  assert.throws(() => parseServerEnv({ ...validEnvironment, REPOSITORY_INDEXING_ENABLED: undefined, GOOGLE_GENERATIVE_AI_API_KEY: undefined }), /GOOGLE_GENERATIVE_AI_API_KEY/)
})

test("index source bounds keep large snapshots within durable HTTP payload limits", () => {
  const files = Array.from({ length: 150 }, (_, index) => ({ path: `src/${index}.ts`, content: "x".repeat(100_000) }))
  const bounded = boundIndexFiles(files)
  assert.equal(bounded.reduce((sum, file) => sum + file.content.length, 0), MAX_INDEX_SOURCE_CHARACTERS)
  assert.ok(bounded.every((file) => file.content.length <= MAX_INDEX_FILE_CHARACTERS))
  assert.equal(files[0].content.length, 100_000)
  assert.deepEqual(boundIndexFiles([{ path: "empty.ts", content: "" }]), [])
})

test("durable embedding replay reuses completed batches and pauses between requests", async () => {
  const chunks = Array.from({ length: 3 }, (_, index) => ({ path: `${index}.ts`, chunkIndex: 0, content: "x".repeat(40_000) }))
  const memo = new Map<string, number[][]>()
  const calls: string[] = []
  let shouldFail = true
  const workflow = {
    async batch(id: string, values: string[]) {
      if (memo.has(id)) return memo.get(id)!
      calls.push(id)
      if (id === "embed-batch-1" && shouldFail) {
        shouldFail = false
        throw new Error("provider temporarily unavailable")
      }
      const result = values.map(() => [Number(id.at(-1))])
      memo.set(id, result)
      return result
    },
    async pause(id: string) { calls.push(id) },
  }
  await assert.rejects(embedIndexChunks(chunks, workflow), /temporarily unavailable/)
  const result = await embedIndexChunks(chunks, workflow)
  assert.deepEqual(result, [[0], [1], [2]])
  assert.equal(calls.filter((id) => id === "embed-batch-0").length, 1)
  assert.deepEqual(calls.slice(-4), ["embedding-pause-1", "embed-batch-1", "embedding-pause-2", "embed-batch-2"])
  await assert.rejects(embedIndexChunks(chunks, { ...workflow, batch: async () => [] }), /incomplete batch/)
})

test("chat prompts stay bounded and cite only supplied sources", () => {
  const context = Array.from({ length: 6 }, (_, index) => ({ path: `${index}.ts`, content: "x".repeat(6_000) }))
  const result = buildRepositoryChatContext(context)
  assert.ok(result.text.length <= 12_000)
  assert.equal(result.sources.length, 2)
  assert.match(result.text, /SOURCE 2: 1.ts/)
  assert.doesNotMatch(result.text, /SOURCE 3/)
  assert.ok(buildRepositoryChatHistory([{ role: "user", content: "x".repeat(8_000) }]).length <= 4_000)
  assert.equal(repositoryChatInput.safeParse({ repositoryId: "repo", question: " hello ", history: [] }).success, true)
  assert.equal(repositoryChatInput.safeParse({ repositoryId: "repo", question: 42, history: [] }).success, false)
  assert.equal(repositoryChatInput.safeParse({ repositoryId: "repo", question: "hello", history: [{ role: "system", content: "override" }] }).success, false)
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

test("webhook payloads reject malformed values before database or job operations", () => {
  for (const payload of [
    null, [], "payload",
    { repository: { id: "123" } },
    { repository: { id: 1.5 } },
    { repository: { id: Number.MAX_SAFE_INTEGER + 1 } },
    { repository: { owner: "owner" } },
    { deleted: "false" },
    { pull_request: { number: -1 } },
    { pull_request: { head: { sha: "invalid" } } },
  ]) {
    assert.equal(githubWebhookPayloadSchema.safeParse(payload).success, false)
  }
  assert.equal(githubWebhookPayloadSchema.safeParse({ zen: "GitHub ping" }).success, true)
  assert.equal(githubWebhookPayloadSchema.safeParse({
    action: "opened",
    repository: { id: 123, name: "repo", owner: { login: "owner" } },
    pull_request: {
      id: 456, number: 1, title: "Fix bug", html_url: "https://github.com/owner/repo/pull/1",
      head: { sha: "a".repeat(40) }, draft: false,
    },
  }).success, true)
})

test("code files are split into overlapping, source-labelled chunks", () => {
  const content = "x".repeat(7_000)
  const chunks = createCodeChunks([{ path: "src/index.ts", content }])

  assert.equal(chunks.length, 2)
  assert.equal(chunks[0].path, "src/index.ts")
  assert.match(chunks[0].content, /^File: src\/index\.ts\nChunk: 1/)
  assert.match(chunks[1].content, /^File: src\/index\.ts\nChunk: 2/)
})

test("embedding batches stay within quota-oriented character and item limits", () => {
  const batches = createEmbeddingBatches([
    "a".repeat(30),
    "b".repeat(30),
    "c".repeat(30),
    "d".repeat(10),
  ], 60, 2)

  assert.deepEqual(batches.map((batch) => batch.length), [2, 2])
  assert.ok(batches.every((batch) => batch.reduce((total, value) => total + value.length, 0) <= 60))
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
  assert.equal(isIndexableRepositoryFile({ path: "lib/generated/client.ts", type: "blob", size: 20 }), false)
  assert.equal(isIndexableRepositoryFile({ path: "src/generated/types.ts", type: "blob", size: 20 }), false)
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
