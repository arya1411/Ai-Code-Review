import { Pinecone } from "@pinecone-database/pinecone"
import { env } from "./env"

export const pinecone = env.PINECONE_DB_API_KEY
    ? new Pinecone({ apiKey: env.PINECONE_DB_API_KEY })
    : null

export const pineconeIndex = pinecone?.index(env.PINECONE_INDEX) ?? null
