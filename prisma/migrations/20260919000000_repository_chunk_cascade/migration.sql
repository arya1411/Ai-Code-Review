-- Add the owning repository so chunks are removed by database cascades.
ALTER TABLE "repository_code_chunk" ADD COLUMN "repositoryId" TEXT;

-- Backfill existing rows from the user-scoped repository key.
UPDATE "repository_code_chunk" AS chunk
SET "repositoryId" = repository."id"
FROM "repository" AS repository
WHERE chunk."repoKey" = repository."userId" || ':' || repository."owner" || '/' || repository."name";

-- Rows that cannot be associated with a live repository must not survive indefinitely.
DELETE FROM "repository_code_chunk" WHERE "repositoryId" IS NULL;

ALTER TABLE "repository_code_chunk" ALTER COLUMN "repositoryId" SET NOT NULL;

CREATE INDEX "repository_code_chunk_repositoryId_idx" ON "repository_code_chunk"("repositoryId");

ALTER TABLE "repository_code_chunk"
ADD CONSTRAINT "repository_code_chunk_repositoryId_fkey"
FOREIGN KEY ("repositoryId") REFERENCES "repository"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
