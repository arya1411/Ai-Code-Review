import { z } from "zod"
import type { RetrievedCodeContext } from "./rag"

export const repositoryChatInput = z.object({
  repositoryId: z.string().min(1).max(200),
  question: z.string().trim().min(1, "Enter a question about the repository.").max(2_000, "Keep questions under 2,000 characters."),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(4_000),
  })).max(8),
})

// Leave room for the question, system instructions, and answer on the pilot's
// shared Groq quota. Only cite chunks that actually fit in the prompt.
export function buildRepositoryChatContext(context: RetrievedCodeContext[]) {
  let remaining = 12_000
  const sources: RetrievedCodeContext[] = []
  const blocks: string[] = []
  for (const item of context) {
    const label = `[SOURCE ${sources.length + 1}: ${item.path}]\n`
    if (remaining <= label.length) break
    const content = item.content.slice(0, remaining - label.length)
    if (!content) continue
    sources.push({ ...item, content })
    const block = label + content
    blocks.push(block)
    remaining -= block.length + 7
  }
  return { text: blocks.join("\n\n---\n\n"), sources }
}

export function buildRepositoryChatHistory(history: { role: string; content: string }[]) {
  return history.slice(-8)
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n").slice(-4_000)
}
