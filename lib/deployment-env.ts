import { parseServerEnv } from "./env"

/** Explicit release check; local production builds may still use development URLs. */
export function validateDeploymentEnv(input: Record<string, string | undefined>) {
  const env = parseServerEnv(input)
  const issues: string[] = []
  const appUrl = env.APP_BASE_URL ?? env.NEXT_PUBLIC_APP_BASE_URL!
  const origin = new URL(appUrl).origin

  for (const [key, value] of Object.entries({
    APP_BASE_URL: appUrl,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: input.NEXT_PUBLIC_BETTER_AUTH_URL,
    ...(env.NEXT_PUBLIC_APP_BASE_URL ? { NEXT_PUBLIC_APP_BASE_URL: env.NEXT_PUBLIC_APP_BASE_URL } : {}),
  })) {
    try {
      const url = new URL(value ?? "")
      if (url.protocol !== "https:" || url.origin !== origin || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
        issues.push(`${key} must use the same public HTTPS origin without a path`)
      }
      if (/^(localhost|127\.|\[::1\])/.test(url.hostname) || /\.(example|test|localhost)$/.test(url.hostname)) {
        issues.push(`${key} must use a real production hostname`)
      }
    } catch {
      issues.push(`${key} must be a public HTTPS URL`)
    }
  }

  const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((value) => value.trim()) ?? []
  if (!trustedOrigins.includes(origin)) issues.push("BETTER_AUTH_TRUSTED_ORIGINS must include the application origin")
  for (const key of ["BETTER_AUTH_SECRET", "GITHUB_WEBHOOK_SECRET"] as const) {
    if (env[key].length < 32 || /replace-with|your-secret/i.test(env[key])) issues.push(`${key} must be a random secret of at least 32 characters`)
  }
  if (env.INNGEST_DEV !== "0") issues.push("INNGEST_DEV must be 0 in production")
  for (const key of ["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"]) {
    if (!input[key]?.trim()) issues.push(`${key} is required in production`)
  }
  if (issues.length) throw new Error(`Deployment configuration is not ready:\n- ${issues.join("\n- ")}`)
}
