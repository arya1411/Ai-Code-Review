import test from "node:test"
import assert from "node:assert/strict"
import { validateDeploymentEnv } from "../lib/deployment-env"

const production = {
  DATABASE_URL: "postgresql://user:pass@localhost/app",
  BETTER_AUTH_SECRET: "a".repeat(32),
  GITHUB_WEBHOOK_SECRET: "b".repeat(32),
  BETTER_AUTH_URL: "https://app.codesentinel.com",
  NEXT_PUBLIC_BETTER_AUTH_URL: "https://app.codesentinel.com",
  APP_BASE_URL: "https://app.codesentinel.com",
  BETTER_AUTH_TRUSTED_ORIGINS: "https://app.codesentinel.com",
  GITHUB_CLIENT_ID: "github-id",
  GITHUB_CLIENT_SECRET: "github-secret",
  GOOGLE_GENERATIVE_AI_API_KEY: "google-key",
  GROQ_API_KEY: "groq-key",
  REPOSITORY_INDEXING_ENABLED: "1",
  INNGEST_DEV: "0",
  INNGEST_EVENT_KEY: "event-key",
  INNGEST_SIGNING_KEY: "signing-key",
}

test("deployment configuration accepts matching production origins", () => {
  assert.doesNotThrow(() => validateDeploymentEnv(production))
  assert.doesNotThrow(() => validateDeploymentEnv({ ...production, REPOSITORY_INDEXING_ENABLED: "0", GOOGLE_GENERATIVE_AI_API_KEY: undefined }))
  assert.throws(() => validateDeploymentEnv({ ...production, GOOGLE_GENERATIVE_AI_API_KEY: undefined }), /GOOGLE_GENERATIVE_AI_API_KEY/)
})

test("deployment configuration rejects development settings and missing event keys", () => {
  assert.throws(() => validateDeploymentEnv({
    ...production,
    NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000",
    INNGEST_DEV: "1",
    INNGEST_SIGNING_KEY: "",
    BETTER_AUTH_SECRET: "short",
  }), (error: Error) => {
    for (const key of ["NEXT_PUBLIC_BETTER_AUTH_URL", "INNGEST_DEV", "INNGEST_SIGNING_KEY", "BETTER_AUTH_SECRET"]) {
      assert.match(error.message, new RegExp(key))
    }
    return true
  })
})

test("deployment configuration rejects paths and mismatched public origins", () => {
  assert.throws(() => validateDeploymentEnv({ ...production, BETTER_AUTH_URL: "https://other.codesentinel.com" }), /BETTER_AUTH_URL/)
  assert.throws(() => validateDeploymentEnv({ ...production, APP_BASE_URL: "https://app.codesentinel.com/subpath" }), /APP_BASE_URL/)
  assert.throws(() => validateDeploymentEnv({ ...production, BETTER_AUTH_TRUSTED_ORIGINS: "" }), /BETTER_AUTH_TRUSTED_ORIGINS/)
})
