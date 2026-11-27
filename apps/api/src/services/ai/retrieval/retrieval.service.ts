import { and, asc, cosineDistance, eq } from "drizzle-orm";
import { embedQuery } from "./emdebQuery.ts";
import { documentChunks, documents, sources } from "../../../db/schema.ts";
import { db } from "../../../db/index.ts";
import { randomUUID } from "node:crypto";
import { recordUsage } from "../../usage/usage.service.ts";
import { EMBEDDING_MODEL } from "./emdebQuery.ts";
const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 10;

export type RetrievedChunk = {
  chunkId: string;
  documentId: string;
  sourceId: string;
  content: string;
  title: string;
  url: string | null;
  sourceName: string;
  similarity: number;
};

type RetrieveChunksInput = {
  organizationId: string;
  agentId: string;
  query: string;
  source: "widget" | "playground";
  topK?: number;
};

export async function retrieveRelevantChunks({
  organizationId,
  agentId,
  query,
  source,
  topK = DEFAULT_TOP_K,
}: RetrieveChunksInput): Promise<RetrievedChunk[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Query cannot be empty");
  }

  const limit = Math.min(Math.max(1, Math.floor(topK)), MAX_TOP_K);

  // 1. Generate query embedding.
  const embeddingResult = await embedQuery(normalizedQuery);
  const queryEmbedding = embeddingResult.vector;

  // 2. Record query embedding usage.
  const requestId = randomUUID();

  try {
    await recordUsage({
      organizationId,
      agentId,
      source,
      operation: "embedding",
      status: "success",
      provider: "openai",
      model: EMBEDDING_MODEL,
      inputTokens: embeddingResult.inputTokens,
      outputTokens: null,
      totalTokens: embeddingResult.inputTokens,
      measurement: "measured",
      costMicros: null,
      requestId,
      idempotencyKey: `query-embedding:${requestId}`,
      metadata: {
        embeddingType: "query",
        dimensions: queryEmbedding.length,
      },
    });
  } catch (error) {
    console.error("Failed to record query embedding usage:", error);
  }

  // 2. Calculate cosine distance.
  const distance = cosineDistance(documentChunks.embedding, queryEmbedding);

  // 3. Retrieve the most relevant chunks.
  const results = await db
    .select({
      chunkId: documentChunks.id,
      documentId: documents.id,
      sourceId: sources.id,
      content: documentChunks.content,
      title: documents.title,
      url: documents.url,
      sourceName: sources.name,
      distance,
    })
    .from(documentChunks)
    .innerJoin(documents, eq(documentChunks.documentId, documents.id))
    .innerJoin(sources, eq(documents.sourceId, sources.id))
    .where(
      and(
        eq(documentChunks.organizationId, organizationId),
        eq(documentChunks.agentId, agentId),
        eq(documents.organizationId, organizationId),
        eq(documents.agentId, agentId),
        eq(sources.organizationId, organizationId),
        eq(sources.agentId, agentId),
        eq(sources.status, "completed"),
      ),
    )
    .orderBy(asc(distance))
    .limit(limit);

  // 4. Convert cosine distance into similarity.
  return results.map((result) => ({
    chunkId: result.chunkId,
    documentId: result.documentId,
    sourceId: result.sourceId,
    content: result.content,
    title: result.title,
    url: result.url,
    sourceName: result.sourceName,
    similarity: 1 - Number(result.distance),
  }));
}
