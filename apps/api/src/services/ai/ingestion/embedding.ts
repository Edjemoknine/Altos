import { embeddings } from "../models/embeddings.ts";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const EMBEDDING_BATCH_SIZE = 64;

export async function embedChunks(contents: string[]): Promise<number[][]> {
  if (contents.length === 0) {
    return [];
  }

  const vectors: number[][] = [];

  for (let i = 0; i < contents.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = contents.slice(i, i + EMBEDDING_BATCH_SIZE);

    const batchVectors = await embeddings.embedDocuments(batch);

    if (batchVectors.length !== batch.length) {
      throw new Error("Embedding count does not match chunk count");
    }

    for (const vector of batchVectors) {
      if (vector.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, received ${vector.length}`,
        );
      }
    }

    vectors.push(...batchVectors);
  }

  return vectors;
}
