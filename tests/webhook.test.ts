import test, { mock } from "node:test"
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { NextRequest } from "next/server"
import { POST } from "../app/api/webhooks/github/route"
import prisma from "../lib/db"
import { env } from "../lib/env"
import { inngest } from "../inngest/client"

function signedRequest(body: string) {
  return new NextRequest("http://localhost/api/webhooks/github", {
    method: "POST",
    headers: {
      "x-github-event": "pull_request",
      "x-github-delivery": "test-delivery",
      "x-hub-signature-256": `sha256=${createHmac("sha256", env.GITHUB_WEBHOOK_SECRET).update(body).digest("hex")}`,
    },
    body,
  })
}

test("signed malformed webhook bodies return 400", async () => {
  for (const body of ["{invalid", "null", JSON.stringify({ repository: { id: 1.5 } })]) {
    assert.equal((await POST(signedRequest(body))).status, 400)
  }
})

test("redelivered pull requests preserve completed and analyzing reviews", async () => {
  const payload = JSON.stringify({
    action: "opened",
    repository: { id: 123, name: "repo", owner: { login: "owner" } },
    pull_request: {
      id: 456, number: 1, title: "Fix bug", html_url: "https://github.com/owner/repo/pull/1",
      head: { sha: "a".repeat(40) },
    },
  })
  const originalFindMany = prisma.repository.findMany
  const originalUpsert = prisma.review.upsert
  try {
    prisma.repository.findMany = (async () => [{ id: "repository", userId: "user" }]) as unknown as typeof originalFindMany
    const send = mock.method(inngest, "send", async () => ({ ids: [] }))
    for (const status of ["COMPLETED", "ANALYZING"]) {
      const upsert = mock.fn(async (args: { update: { status?: string; error?: string } }) => {
        assert.equal(args.update.status, undefined, "redelivery must not reset review status")
        assert.equal(args.update.error, undefined, "redelivery must preserve failure details")
        return { id: "review", status }
      })
      prisma.review.upsert = upsert as unknown as typeof originalUpsert
      assert.equal((await POST(signedRequest(payload))).status, 202)
      assert.equal(upsert.mock.callCount(), 1)
    }
    assert.equal(send.mock.callCount(), 0)
    for (const status of ["QUEUED", "FAILED"]) {
      prisma.review.upsert = (async () => ({ id: "review", status })) as unknown as typeof originalUpsert
      assert.equal((await POST(signedRequest(payload))).status, 202)
    }
    assert.equal(send.mock.callCount(), 2, "pending and failed reviews can still be dispatched")
  } finally {
    prisma.repository.findMany = originalFindMany
    prisma.review.upsert = originalUpsert
    mock.restoreAll()
  }
})
