import { embeddings } from "../models/embeddings.ts";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const EMBEDDING_BATCH_SIZE = 64;

export async function embedChunks(contents: string[]): Promise<number[][]> {
  if (contents.length === 0) {
    return [];
  }

  const vectors: number[][] = [];
  const totalBatches = Math.ceil(contents.length / EMBEDDING_BATCH_SIZE);

  for (let i = 0; i < contents.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = contents.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchNumber = Math.floor(i / EMBEDDING_BATCH_SIZE) + 1;
    const startedAt = Date.now();

    console.log("Requesting embedding batch", {
      batch: batchNumber,
      totalBatches,
      chunkCount: batch.length,
    });

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

    console.log("Received embedding batch", {
      batch: batchNumber,
      totalBatches,
      elapsedMs: Date.now() - startedAt,
    });
  }

  return vectors;
}
