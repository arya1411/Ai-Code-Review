-- Use PostgreSQL-native vector search instead of transferring every embedding
-- to the application process for similarity scoring.
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "repository_code_chunk"
ALTER COLUMN "embedding" TYPE vector(768)
USING ("embedding"::text::vector(768));
