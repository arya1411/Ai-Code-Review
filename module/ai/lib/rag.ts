import { embed, embedMany } from "ai";
import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";
import prisma from "@/lib/db";
import { pineconeIndex } from "@/lib/pinecone";
import { env } from "@/lib/env";

const CHUNK_SIZE = 6_000;
const CHUNK_OVERLAP = 500;
const MAX_FILE_CHARACTERS = 36_000;
let pineconeEnabled = pineconeIndex !== null;

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

async function listVectorIds(prefix: string): Promise<string[]> {
    if (!pineconeIndex || !pineconeEnabled) return [];

    const ids: string[] = [];
    let paginationToken: string | undefined;

    do {
        const page = await pineconeIndex.listPaginated({
            prefix,
            limit: 100,
            paginationToken,
        });
        ids.push(...(page.vectors ?? []).flatMap((vector) => vector.id ? [vector.id] : []));
        paginationToken = page.pagination?.next;
    } while (paginationToken);

    return ids;
}

export async function deleteCodeBaseIndex(repoId: string) {
    const deleted = await prisma.repositoryCodeChunk.deleteMany({
        where: { repoKey: repoId },
    });

    if (pineconeIndex && pineconeEnabled) {
        try {
            const ids = [
                ...(await listVectorIds(`${repoId}:file:`)),
                ...(await listVectorIds(`${repoId}-`)),
            ];

            for (let i = 0; i < ids.length; i += 100) {
                await pineconeIndex.deleteMany({ ids: ids.slice(i, i + 100) });
            }
        } catch (error) {
            pineconeEnabled = false;
            console.warn("Pinecone cleanup failed; PostgreSQL chunks were removed", error);
        }
    }

    return deleted.count;
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
    const { embeddings } = await embedMany({
        model: google.embedding("gemini-embedding-001"),
        values,
        maxParallelCalls: 3,
        maxRetries: 3,
        providerOptions: {
            google: {
                outputDimensionality: env.EMBEDDING_DIMENSIONS,
                taskType,
            } satisfies GoogleEmbeddingModelOptions,
        },
    });

    return embeddings;
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

    await prisma.$transaction([
        prisma.repositoryCodeChunk.deleteMany({ where: { repoKey } }),
        prisma.repositoryCodeChunk.createMany({
            data: records.map((record) => ({
                id: record.id,
                repositoryId,
                repoKey,
                path: record.metadata.path,
                chunkIndex: record.metadata.chunkIndex,
                content: record.metadata.content,
                embedding: record.values,
            })),
        }),
    ]);

    let removedPineconeChunks = 0;
    if (pineconeIndex && pineconeEnabled) {
        try {
            const currentIds = new Set([
                ...(await listVectorIds(`${repoKey}:file:`)),
                ...(await listVectorIds(`${repoKey}-`)),
            ]);
            const batchSize = 100;
            for (let i = 0; i < records.length; i += batchSize) {
                await pineconeIndex.upsert({ records: records.slice(i, i + batchSize) });
            }

            const staleIds = [...currentIds].filter((id) => !nextIds.has(id));
            removedPineconeChunks = staleIds.length;
            for (let i = 0; i < staleIds.length; i += 100) {
                await pineconeIndex.deleteMany({ ids: staleIds.slice(i, i + 100) });
            }
        } catch (error) {
            pineconeEnabled = false;
            console.warn("Pinecone indexing failed; PostgreSQL index is ready", error);
        }
    }

    return {
        indexedChunks: records.length,
        removedChunks: Math.max(removedPostgresChunks, removedPineconeChunks),
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

function parseStoredEmbedding(value: unknown): number[] | null {
    if (!Array.isArray(value) || !value.every((item) => typeof item === "number")) {
        return null;
    }
    return value;
}

export async function retrieveContextWithSources(
    query: string,
    repoId: string,
    topK: number = 6,
): Promise<RetrievedCodeContext[]> {
    const chunks = await prisma.repositoryCodeChunk.findMany({
        where: { repoKey: repoId },
        select: { path: true, content: true, embedding: true },
    });

    if (chunks.length > 0) {
        const embedding = await generateEmbedding(query, "RETRIEVAL_QUERY");
        return chunks
            .flatMap((chunk) => {
                const storedEmbedding = parseStoredEmbedding(chunk.embedding);
                return storedEmbedding
                    ? [{
                        path: chunk.path,
                        content: chunk.content,
                        score: cosineSimilarity(embedding, storedEmbedding),
                    }]
                    : [];
            })
            .sort((left, right) => right.score - left.score)
            .slice(0, topK);
    }

    if (pineconeIndex && pineconeEnabled) {
        try {
            const embedding = await generateEmbedding(query, "RETRIEVAL_QUERY");
            const result = await pineconeIndex.query({
                vector: embedding,
                filter: { repoId },
                topK,
                includeMetadata: true,
            });

            const matches = result.matches.flatMap((match) => {
                const path = match.metadata?.path;
                const content = match.metadata?.content;

                if (typeof path !== "string" || typeof content !== "string") {
                    return [];
                }

                return [{ path, content, score: match.score }];
            });

            if (matches.length > 0) return matches;
        } catch (error) {
            pineconeEnabled = false;
            console.warn("Pinecone retrieval failed; no legacy vector context is available", error);
        }
    }

    return [];
}

export const retruceContext = retrieveContext;
