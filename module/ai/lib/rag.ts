import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { pineconeIndex } from "@/lib/pinecone";

export async function generateEmbedding(text: string) {
    const { embedding } = await embed({
        model: google.textEmbeddingModel("text-embedding-004"),
        value: text,
    });

    return embedding;
}

export async function indexCodeBase(repoId: string, files: { path: string; content: string }[]) {
    const vector = [];

    for (const file of files) {
        const content = `File : ${file.path}\n\n${file.content}`;
        const truncatedContent = content.slice(0, 8000);

        try {
            const embedding = await generateEmbedding(truncatedContent);

            vector.push({
                id: `${repoId}-${file.path.replace(/\//g, "_")}`,
                values: embedding,
                metadata: {
                    repoId,
                    path: file.path,
                    content: truncatedContent,
                },
            });
        } catch (error) {
            console.error("failed to embedded the content", error);
        }
    }

    if (vector.length > 0) {
        const batchSize = 100;

        for (let i = 0; i < vector.length; i += batchSize) {
            const batch = vector.slice(i, i + batchSize);

            await pineconeIndex.upsert({ records: batch });
        }
    }

    console.log("Indexing Completed");
}

export async function retrieveContext(query: string, repoId: string, topK: number = 5) {
    const embedding = await generateEmbedding(query);

    const result = await pineconeIndex.query({
        vector: embedding,
        filter: { repoId },
        topK,
        includeMetadata: true,
    });

    return result.matches.map((match) => match.metadata?.content as string).filter(Boolean);
}

// Keep alias for backward compatibility if referenced
export const retruceContext = retrieveContext;