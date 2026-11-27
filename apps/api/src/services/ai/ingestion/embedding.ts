import OpenAI from "openai";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const EMBEDDING_BATCH_SIZE = 64;

const openai = new OpenAI();

type EmbeddingBatchUsage = {
  inputTokens: number;
  totalTokens: number;
  chunkCount: number;
  batchNumber: number;
  totalBatches: number;
};

type EmbedChunksOptions = {
  onBatchUsage?: (usage: EmbeddingBatchUsage) => Promise<void>;
};

export async function embedChunks(
  contents: string[],
  options: EmbedChunksOptions = {},
): Promise<number[][]> {
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

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Record actual API usage for this batch.
    await options.onBatchUsage?.({
      inputTokens: response.usage.prompt_tokens,
      totalTokens: response.usage.total_tokens,
      chunkCount: batch.length,
      batchNumber,
      totalBatches,
    });

    const batchVectors = response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);

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
