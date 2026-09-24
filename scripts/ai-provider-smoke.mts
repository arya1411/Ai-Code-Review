import "dotenv/config"

import { google, type GoogleEmbeddingModelOptions, type GoogleLanguageModelOptions } from "@ai-sdk/google"
import { embed, generateText, Output } from "ai"
import { z } from "zod"

const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const embeddingDimensions = Number(process.env.EMBEDDING_DIMENSIONS ?? 768)

if (!googleApiKey) {
  throw new Error("A Google Generative AI API key is required")
}

const results: Record<string, unknown> = {}
const errors: string[] = []

try {
  const embeddingResult = await embed({
    model: google.embedding("gemini-embedding-001"),
    value: "codeSentinel provider connectivity check",
    providerOptions: {
      google: {
        outputDimensionality: embeddingDimensions,
        taskType: "SEMANTIC_SIMILARITY",
      } satisfies GoogleEmbeddingModelOptions,
    },
  })
  results.googleEmbeddingDimensions = embeddingResult.embedding.length
} catch (error) {
  errors.push(`Google embedding: ${error instanceof Error ? error.message : "unknown error"}`)
}

try {
  const structuredResult = await generateText({
    model: google("gemini-3.6-flash"),
    providerOptions: {
      google: {
        thinkingConfig: { thinkingLevel: "minimal" },
      } satisfies GoogleLanguageModelOptions,
    },
    output: Output.object({
      schema: z.object({ status: z.literal("ok") }),
      name: "provider_health",
    }),
    prompt: "Return the requested status object.",
    maxOutputTokens: 300,
    temperature: 0,
  })
  results.googleStructuredGeneration = structuredResult.output.status
} catch (error) {
  errors.push(`Google generation: ${error instanceof Error ? error.message : "unknown error"}`)
}

console.log(JSON.stringify({ results, errors }, null, 2))
if (errors.length > 0) process.exitCode = 1
