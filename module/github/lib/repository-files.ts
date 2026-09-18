const ignoredExtensions = [
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".zip", ".tar", ".gz",
  ".mp4", ".mp3", ".wav", ".pdf", ".woff", ".woff2", ".ttf", ".eot",
  ".exe", ".bin", ".lock", "-lock.json", ".map", ".pem", ".key", ".p12", ".pfx",
  ".tfvars", ".tfvars.json", ".keystore", ".jks",
]
const ignoredDirectories = [
  "node_modules", ".git", ".next", "dist", "build", "coverage", ".turbo",
  ".aws", ".ssh", ".gnupg", ".kube",
]
const sensitiveBasenames = new Set([
  ".npmrc", ".pypirc", ".netrc", "credentials", "credentials.json",
  "service-account.json", "service_account.json", "secrets.json", "secrets.yml",
  "secrets.yaml", "kubeconfig", "id_rsa", "id_ed25519",
])
const MAX_REPOSITORY_FILE_BYTES = 200_000

export function isIndexableRepositoryFile(item: { path?: string; type?: string; size?: number }) {
  if (item.type !== "blob" || !item.path) return false

  const path = item.path.toLowerCase()
  const segments = path.split("/")
  const basename = segments.at(-1) ?? ""
  const containsIgnoredDirectory = ignoredDirectories.some((directory) => segments.includes(directory))
  const containsIgnoredExtension = ignoredExtensions.some((extension) => path.endsWith(extension))
  const containsSensitiveEnvironmentFile = basename === ".env" || basename.startsWith(".env.")
  const containsSensitiveFilename = sensitiveBasenames.has(basename)
  const isTooLarge = typeof item.size === "number" && item.size > MAX_REPOSITORY_FILE_BYTES

  return !containsIgnoredDirectory && !containsIgnoredExtension && !containsSensitiveEnvironmentFile && !containsSensitiveFilename && !isTooLarge
}

export function isProbablyBinaryContent(content: Buffer) {
  if (content.includes(0)) return true
  if (content.length === 0) return false

  const replacementCharacters = content.toString("utf8").split("\uFFFD").length - 1
  return replacementCharacters / content.length > 0.01
}
