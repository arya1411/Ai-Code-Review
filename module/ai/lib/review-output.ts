import { z } from "zod"

export const reviewOutputSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  summary: z.string().min(1).max(2_000),
  reasons: z.array(z.string().min(1).max(300)).max(6),
  findings: z.array(z.object({
    severity: z.enum(["INFO", "LOW", "MEDIUM", "HIGH"]),
    category: z.string().min(1).max(80),
    filePath: z.string().min(1).max(500),
    line: z.number().int().positive().nullable(),
    message: z.string().min(1).max(1_000),
    suggestion: z.string().max(1_500).nullable(),
  })).max(20),
})

export function parseReviewModelOutput(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")

  return reviewOutputSchema.parse(JSON.parse(cleaned))
}
