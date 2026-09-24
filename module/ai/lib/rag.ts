import { embed, embedMany } from "ai";
import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";
import prisma from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { env } from "@/lib/env";

const CHUNK_SIZE = 6_000;
const CHUNK_OVERLAP = 500;
const MAX_FILE_CHARACTERS = 36_000;
const VECTOR_INSERT_BATCH_SIZE = 100;
// Keep each request comfortably below the current 30K embedding-token/minute
// quota. Code is commonly around 3 characters/token, so 60K characters leaves
// headroom for tokenizer variance and other embedding requests.
const EMBEDDING_BATCH_MAX_CHARACTERS = 60_000;
const EMBEDDING_BATCH_MAX_ITEMS = 100;
const EMBEDDING_BATCH_INTERVAL_MS = 60_500;
const EMBEDDING_RATE_LIMIT_RETRIES = 3;

export interface CodeChunk {
    path: string;
    chunkIndex: number;
    content: string;
}

export function createCodeChunks(
    files: { path: string; content: string }[],
): CodeChunk[] {
    return files.flatMap((file) => {
        const content = file.content.slice(0, MAX_FILE_CHARACTERS);
        if (!content) return [];

        const chunks: CodeChunk[] = [];
        for (let start = 0, chunkIndex = 0; start < content.length; chunkIndex += 1) {
            const body = content.slice(start, start + CHUNK_SIZE);
            chunks.push({
                path: file.path,
                chunkIndex,
                content: `File: ${file.path}\nChunk: ${chunkIndex + 1}\n\n${body}`,
            });

            if (start + CHUNK_SIZE >= content.length) break;
            start += CHUNK_SIZE - CHUNK_OVERLAP;
        }

        return chunks;
    });
}

export function selectRelevantCodeChunks(
    query: string,
    files: { path: string; content: string }[],
    topK: number = 6,
): RetrievedCodeContext[] {
    const terms = [...new Set(query.toLowerCase().match(/[a-z0-9_/-]{3,}/g) ?? [])];
    const chunks = createCodeChunks(files);

    return chunks
        .map((chunk) => {
            const path = chunk.path.toLowerCase();
            const content = chunk.content.toLowerCase();
            const score = terms.reduce((total, term) => {
                const pathBoost = path.includes(term) ? 8 : 0;
                const occurrences = content.split(term).length - 1;
                return total + pathBoost + Math.min(occurrences, 12);
            }, 0);

            return { path: chunk.path, content: chunk.content, score };
        })
        .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
        .slice(0, topK);
}

export async function deleteCodeBaseIndex(repoId: string) {
    const deleted = await prisma.repositoryCodeChunk.deleteMany({
        where: { repoKey: repoId },
    });

    return deleted.count;
}

function toVectorLiteral(values: number[]) {
    if (
        values.length !== env.EMBEDDING_DIMENSIONS
        || values.some((value) => !Number.isFinite(value))
    ) {
        throw new Error(`Expected a ${env.EMBEDDING_DIMENSIONS}-dimension finite embedding`);
    }

    return `[${values.join(",")}]`;
}

export async function generateEmbedding(
    text: string,
    taskType: GoogleEmbeddingModelOptions["taskType"] = "SEMANTIC_SIMILARITY",
) {
    const { embedding } = await embed({
        model: google.embedding("gemini-embedding-001"),
        value: text,
        providerOptions: {
            google: {
                outputDimensionality: env.EMBEDDING_DIMENSIONS,
                taskType,
            } satisfies GoogleEmbeddingModelOptions,
        },
    });

    return embedding;
}

async function generateEmbeddings(
    values: string[],
    taskType: GoogleEmbeddingModelOptions["taskType"],
) {
    const batches = createEmbeddingBatches(values);
    const embeddings: number[][] = [];
    let previousBatchStartedAt = 0;

    for (const batch of batches) {
        if (previousBatchStartedAt > 0) {
            const elapsed = Date.now() - previousBatchStartedAt;
            await wait(Math.max(0, EMBEDDING_BATCH_INTERVAL_MS - elapsed));
        }

        let rateLimitAttempts = 0;
        while (true) {
            previousBatchStartedAt = Date.now();
            try {
                const result = await embedMany({
                    model: google.embedding("gemini-embedding-001"),
                    values: batch,
                    maxParallelCalls: 1,
                    maxRetries: 3,
                    providerOptions: {
                        google: {
                            outputDimensionality: env.EMBEDDING_DIMENSIONS,
                            taskType,
                        } satisfies GoogleEmbeddingModelOptions,
                    },
                });
                embeddings.push(...result.embeddings);
                break;
            } catch (error) {
                if (!isRateLimitError(error) || rateLimitAttempts >= EMBEDDING_RATE_LIMIT_RETRIES) {
                    throw error;
                }
                rateLimitAttempts += 1;
                await wait(EMBEDDING_BATCH_INTERVAL_MS);
            }
        }
    }

    return embeddings;
}

function wait(milliseconds: number) {
    return milliseconds > 0
        ? new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
        : Promise.resolve();
}

function isRateLimitError(error: unknown) {
    if (typeof error !== "object" || error === null) return false;

    const candidate = error as { statusCode?: unknown; status?: unknown; message?: unknown };
    return candidate.statusCode === 429
        || candidate.status === 429
        || (typeof candidate.message === "string" && /429|rate.?limit|resource exhausted/i.test(candidate.message));
}

export function createEmbeddingBatches(
    values: string[],
    maxCharacters: number = EMBEDDING_BATCH_MAX_CHARACTERS,
    maxItems: number = EMBEDDING_BATCH_MAX_ITEMS,
) {
    if (!Number.isInteger(maxCharacters) || maxCharacters <= 0) {
        throw new Error("Embedding batch character limit must be a positive integer");
    }
    if (!Number.isInteger(maxItems) || maxItems <= 0) {
        throw new Error("Embedding batch item limit must be a positive integer");
    }

    const batches: string[][] = [];
    let batch: string[] = [];
    let batchCharacters = 0;

    for (const value of values) {
        const exceedsCharacters = batch.length > 0 && batchCharacters + value.length > maxCharacters;
        const exceedsItems = batch.length >= maxItems;
        if (exceedsCharacters || exceedsItems) {
            batches.push(batch);
            batch = [];
            batchCharacters = 0;
        }

        batch.push(value);
        batchCharacters += value.length;
    }

    if (batch.length > 0) batches.push(batch);
    return batches;
}

export async function indexCodeBase(
    repositoryId: string,
    repoKey: string,
    files: { path: string; content: string }[],
) {
    const chunks = createCodeChunks(files);
    if (chunks.length === 0) {
        throw new Error("No non-empty source files were available for indexing");
    }

    const embeddings = await generateEmbeddings(
        chunks.map((chunk) => chunk.content),
        "RETRIEVAL_DOCUMENT",
    );
    if (embeddings.length !== chunks.length) {
        throw new Error("Embedding provider returned an incomplete batch");
    }

    const records: Array<{
        id: string;
        values: number[];
        metadata: { repoId: string; path: string; chunkIndex: number; content: string };
    }> = chunks.map((chunk, index) => {
        const pathId = Buffer.from(chunk.path).toString("base64url");
        const id = `${repoKey}:file:${pathId}:${chunk.chunkIndex}`;
        return {
            id,
            values: embeddings[index],
            metadata: {
                repoId: repoKey,
                path: chunk.path,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
            },
        };
    });

    const previousChunks = await prisma.repositoryCodeChunk.findMany({
        where: { repoKey },
        select: { id: true },
    });
    const nextIds = new Set(records.map((record) => record.id));
    const removedPostgresChunks = previousChunks.filter((chunk) => !nextIds.has(chunk.id)).length;

    await prisma.$transaction(async (transaction) => {
        await transaction.repositoryCodeChunk.deleteMany({ where: { repoKey } });

        for (let offset = 0; offset < records.length; offset += VECTOR_INSERT_BATCH_SIZE) {
            const batch = records.slice(offset, offset + VECTOR_INSERT_BATCH_SIZE);
            const values = batch.map((record) => Prisma.sql`(
                ${record.id},
                ${repositoryId},
                ${repoKey},
                ${record.metadata.path},
                ${record.metadata.chunkIndex},
                ${record.metadata.content},
                CAST(${toVectorLiteral(record.values)} AS vector(768)),
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )`);

            await transaction.$executeRaw(Prisma.sql`
                INSERT INTO "repository_code_chunk" (
                    "id", "repositoryId", "repoKey", "path", "chunkIndex",
                    "content", "embedding", "createdAt", "updatedAt"
                )
                VALUES ${Prisma.join(values)}
            `);
        }
    });

    return {
        indexedChunks: records.length,
        removedChunks: removedPostgresChunks,
    };
}

export async function retrieveContext(query: string, repoId: string, topK: number = 5) {
    const context = await retrieveContextWithSources(query, repoId, topK);
    return context.map((item) => item.content);
}

export interface RetrievedCodeContext {
    path: string;
    content: string;
    score?: number;
}

export function cosineSimilarity(left: number[], right: number[]) {
    if (left.length === 0 || left.length !== right.length) return 0;

    let dotProduct = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;
    for (let index = 0; index < left.length; index += 1) {
        dotProduct += left[index] * right[index];
        leftMagnitude += left[index] ** 2;
        rightMagnitude += right[index] ** 2;
    }

    const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

export async function retrieveContextWithSources(
    query: string,
    repoId: string,
    topK: number = 6,
): Promise<RetrievedCodeContext[]> {
    const indexedChunk = await prisma.repositoryCodeChunk.findFirst({
        where: { repoKey: repoId },
        select: { id: true },
    });
    if (!indexedChunk) return [];

    const embedding = await generateEmbedding(query, "RETRIEVAL_QUERY");
    const vector = toVectorLiteral(embedding);
    const resultLimit = Math.max(1, Math.min(Math.trunc(topK), 50));

    return prisma.$queryRaw<RetrievedCodeContext[]>(Prisma.sql`
        SELECT
            "path",
            "content",
            1 - ("embedding" <=> CAST(${vector} AS vector(768))) AS "score"
        FROM "repository_code_chunk"
        WHERE "repoKey" = ${repoId}
        ORDER BY "embedding" <=> CAST(${vector} AS vector(768))
        LIMIT ${resultLimit}
    `);
}

export const retruceContext = retrieveContext;
