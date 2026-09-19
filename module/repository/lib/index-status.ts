import prisma from "@/lib/db"

export const REPOSITORY_INDEX_TIMEOUT_MS = 30 * 60 * 1_000
export const REPOSITORY_INDEX_TIMEOUT_ERROR =
  "Repository indexing exceeded the 30-minute time limit. Please retry."

export async function expireStaleRepositoryIndexes(userId?: string) {
  const cutoff = new Date(Date.now() - REPOSITORY_INDEX_TIMEOUT_MS)

  return prisma.repository.updateMany({
    where: {
      indexStatus: "INDEXING",
      updatedAt: { lt: cutoff },
      ...(userId ? { userId } : {}),
    },
    data: {
      indexStatus: "FAILED",
      indexError: REPOSITORY_INDEX_TIMEOUT_ERROR,
    },
  })
}
