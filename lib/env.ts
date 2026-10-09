import { z } from "zod"

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a URL"),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GITHUB_WEBHOOK_SECRET: z.string().min(1, "GITHUB_WEBHOOK_SECRET is required"),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, "GOOGLE_GENERATIVE_AI_API_KEY is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  EMBEDDING_DIMENSIONS: z.coerce.number().refine(
    (value) => value === 768,
    "EMBEDDING_DIMENSIONS must be 768 for the PostgreSQL vector column",
  ).default(768),
  APP_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_BASE_URL: z.string().url().optional(),
  INNGEST_DEV: z.enum(["0", "1"]).optional(),
}).superRefine((values, context) => {
  if (!values.APP_BASE_URL && !values.NEXT_PUBLIC_APP_BASE_URL) {
    context.addIssue({
      code: "custom",
      path: ["APP_BASE_URL"],
      message: "APP_BASE_URL or NEXT_PUBLIC_APP_BASE_URL is required",
    })
  }
})

export function parseServerEnv(input: Record<string, string | undefined>) {
  const result = serverEnvSchema.safeParse(input)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")
    throw new Error(`Invalid server environment: ${details}`)
  }

  return result.data
}

export const env = parseServerEnv(process.env)
