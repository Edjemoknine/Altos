import { embeddings } from "../models/embeddings.ts";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const EMBEDDING_BATCH_SIZE = 64;

export async function embedQuery(query: string): Promise<number[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Query cannot be empty");
  }

  const vector = await embeddings.embedQuery(normalizedQuery);

  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Invalid query embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, received ${vector.length}`,
    );
  }

  return vector;
}
