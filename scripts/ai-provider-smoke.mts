import "dotenv/config"

import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import { embed, generateText, Output } from "ai"
import { reviewOutputSchema } from "../module/ai/lib/review-output"

const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
const groqApiKey = process.env.GROQ_API_KEY
const embeddingDimensions = Number(process.env.EMBEDDING_DIMENSIONS ?? 768)

if (!googleApiKey) {
  throw new Error("A Google Generative AI API key is required")
}
if (!groqApiKey) {
  throw new Error("A Groq API key is required")
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
    model: groq("openai/gpt-oss-120b"),
    output: Output.object({
      schema: reviewOutputSchema,
      name: "pull_request_review_health",
    }),
    prompt: "Return a valid low-risk pull request review with a risk score of 0, a short summary, no reasons, and no findings.",
    maxOutputTokens: 600,
    temperature: 0,
  })
  results.groqStructuredReview = {
    riskLevel: structuredResult.output.riskLevel,
    riskScore: structuredResult.output.riskScore,
    findings: structuredResult.output.findings.length,
  }
} catch (error) {
  errors.push(`Groq structured review: ${error instanceof Error ? error.message : "unknown error"}`)
}

try {
  const answerResult = await generateText({
    model: groq("openai/gpt-oss-120b"),
    system: "Answer with only the requested word.",
    prompt: "Reply with ok.",
    maxOutputTokens: 256,
    temperature: 0,
  })
  results.groqAnswerGeneration = answerResult.text.trim()
} catch (error) {
  errors.push(`Groq answer generation: ${error instanceof Error ? error.message : "unknown error"}`)
}

console.log(JSON.stringify({ results, errors }, null, 2))
if (errors.length > 0) process.exitCode = 1
