// Bound durable step state and the HTTP payload replayed by Inngest. A pilot
// indexes a sample of large repositories rather than exceeding host limits.
export const MAX_INDEX_SOURCE_CHARACTERS = 240_000
export const MAX_INDEX_FILE_CHARACTERS = 36_000

export function boundIndexFiles(files: { path: string; content: string }[]) {
  let remaining = MAX_INDEX_SOURCE_CHARACTERS
  const result: { path: string; content: string }[] = []
  for (const file of files) {
    if (remaining <= 0) break
    const content = file.content.slice(0, Math.min(remaining, MAX_INDEX_FILE_CHARACTERS))
    if (!content) continue
    result.push({ path: file.path, content })
    remaining -= content.length
  }
  return result
}
