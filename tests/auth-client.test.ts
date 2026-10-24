import test from "node:test"
import assert from "node:assert/strict"

test("browser login uses the live site even when the public auth URL is localhost", async () => {
  const origin = "https://ai-code-review-seven-vert.vercel.app"
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
  const previousFetch = globalThis.fetch
  const previousUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  let requestedUrl = ""

  try {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "http://localhost:3000"
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { origin } },
    })
    globalThis.fetch = async (input) => {
      requestedUrl = input instanceof Request ? input.url : String(input)
      return Response.json({ redirect: false })
    }

    const { signIn } = await import("../lib/auth-client")
    await signIn.social({ provider: "github" })

    assert.equal(requestedUrl, `${origin}/api/auth/sign-in/social`)
  } finally {
    globalThis.fetch = previousFetch
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow)
    else Reflect.deleteProperty(globalThis, "window")
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    else process.env.NEXT_PUBLIC_BETTER_AUTH_URL = previousUrl
  }
})
