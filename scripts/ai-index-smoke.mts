import "dotenv/config"

import prismaImport from "../lib/db"
import { indexCodeBase, retrieveContextWithSources } from "../module/ai/lib/rag"

type PrismaClientInstance = typeof import("../lib/db").default
const prismaModule = prismaImport as unknown as { default?: PrismaClientInstance }
const prisma = prismaModule.default ?? (prismaImport as unknown as PrismaClientInstance)

const smokeRepoKey = `smoke:${Date.now()}`

async function run() {
  const sampleFiles = [
    {
      path: "src/auth/session.ts",
      content: "export function validateSession(token: string) { return token.length > 20 }",
    },
    {
      path: "src/billing/invoice.ts",
      content: "export function calculateInvoice(items: number[]) { return items.reduce((sum, item) => sum + item, 0) }",
    },
    {
      path: "src/ui/theme.ts",
      content: "export const primaryColor = '#6d5dfc'",
    },
  ]

  const indexed = await indexCodeBase(smokeRepoKey, sampleFiles)
  const results = await retrieveContextWithSources(
    "Where is user session authentication validated?",
    smokeRepoKey,
    2,
  )

  if (results.length === 0) {
    throw new Error("PostgreSQL vector retrieval returned no results")
  }

  console.log(JSON.stringify({
    sampledFiles: sampleFiles.length,
    indexedChunks: indexed.indexedChunks,
    retrievedPaths: results.map((result) => result.path),
  }, null, 2))
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.repositoryCodeChunk.deleteMany({ where: { repoKey: smokeRepoKey } })
    await prisma.$disconnect()
  })
