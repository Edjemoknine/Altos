import OpenAI from "openai";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const openai = new OpenAI();

export type EmbeddingResult = {
  vector: number[];
  inputTokens: number;
};

export async function embedQuery(query: string): Promise<EmbeddingResult> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Query cannot be empty");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalizedQuery,
  });

  const vector = response.data[0]?.embedding;

  if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Invalid query embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, received ${vector?.length ?? 0}`,
    );
  }

  return {
    vector,
    inputTokens: response.usage.prompt_tokens,
  };
}
