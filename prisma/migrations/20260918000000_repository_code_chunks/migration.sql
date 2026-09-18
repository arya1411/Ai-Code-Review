-- CreateTable
CREATE TABLE "repository_code_chunk" (
    "id" TEXT NOT NULL,
    "repoKey" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_code_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repository_code_chunk_repoKey_idx" ON "repository_code_chunk"("repoKey");
