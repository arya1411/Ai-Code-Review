const ignoredExtensions = [
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".zip", ".tar", ".gz",
  ".mp4", ".mp3", ".wav", ".pdf", ".woff", ".woff2", ".ttf", ".eot",
  ".exe", ".bin", ".lock", "-lock.json", ".map", ".pem", ".key", ".p12", ".pfx",
]
const ignoredDirectories = ["node_modules", ".git", ".next", "dist", "build", "coverage", ".turbo"]
const MAX_REPOSITORY_FILE_BYTES = 200_000

export function isIndexableRepositoryFile(item: { path?: string; type?: string; size?: number }) {
  if (item.type !== "blob" || !item.path) return false

  const path = item.path.toLowerCase()
  const segments = path.split("/")
  const basename = segments.at(-1) ?? ""
  const containsIgnoredDirectory = ignoredDirectories.some((directory) => segments.includes(directory))
  const containsIgnoredExtension = ignoredExtensions.some((extension) => path.endsWith(extension))
  const containsSensitiveEnvironmentFile = basename === ".env" || (basename.startsWith(".env.") && basename !== ".env.example")
  const isTooLarge = typeof item.size === "number" && item.size > MAX_REPOSITORY_FILE_BYTES

  return !containsIgnoredDirectory && !containsIgnoredExtension && !containsSensitiveEnvironmentFile && !isTooLarge
}
