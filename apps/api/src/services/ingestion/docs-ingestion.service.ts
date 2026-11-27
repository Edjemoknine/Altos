import { and, eq, gte, sql } from "drizzle-orm";

import { splitDocument } from "../ai/ingestion/chunking.ts";
import { embedChunks, EMBEDDING_MODEL } from "../ai/ingestion/embedding.ts";
import { db } from "../../db/index.ts";
import { documentChunks, documents } from "../../db/schema.ts";
import { randomUUID } from "node:crypto";
import { recordUsage } from "../usage/usage.service.ts";
const INSERT_BATCH_SIZE = 50;

type IngestDocumentInput = {
  documentId: string;
  organizationId: string;
  agentId: string;
  sourceId: string;
};

export async function ingestDocument({
  documentId,
  organizationId,
  agentId,
  sourceId,
}: IngestDocumentInput) {
  // 1. Retrieve the extracted document.
  console.log("Loading document content", { documentId });
  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        eq(documents.organizationId, organizationId),
        eq(documents.agentId, agentId),
        eq(documents.sourceId, sourceId),
      ),
    )
    .limit(1);

  if (!document) {
    throw new Error("Extracted document not found");
  }
  console.log("Loaded document content", {
    characterCount: document.content.length,
  });

  // 2. Split document into chunks.
  const chunkingStartedAt = Date.now();
  console.log("Splitting extracted document", {
    characterCount: document.content.length,
  });
  const chunks = await splitDocument(document.content, {
    organizationId,
    agentId,
    sourceId,
    documentId,
    title: document.title,
  });

  if (chunks.length === 0) {
    throw new Error("Document produced no chunks");
  }

  console.log("Generated document chunks", {
    chunkCount: chunks.length,
    elapsedMs: Date.now() - chunkingStartedAt,
  });

  // 3. Generate embeddings.
  const embeddingStartedAt = Date.now();

  console.log("Starting document embeddings", {
    chunkCount: chunks.length,
  });

  const vectors = await embedChunks(
    chunks.map((chunk) => chunk.pageContent),
    {
      onBatchUsage: async (usage) => {
        try {
          await recordUsage({
            organizationId,
            agentId,
            source: "system",
            operation: "embedding",
            status: "success",
            provider: "openai",
            model: EMBEDDING_MODEL,
            inputTokens: usage.inputTokens,
            outputTokens: null,
            totalTokens: usage.totalTokens,
            measurement: "measured",
            requestId: randomUUID(),
            idempotencyKey: `document-embedding:${documentId}:${randomUUID()}`,
            metadata: {
              embeddingType: "document",
              documentId,
              sourceId,
              chunksProcessed: usage.chunkCount,
              batchNumber: usage.batchNumber,
              totalBatches: usage.totalBatches,
            },
          });
        } catch (error) {
          console.error("Failed to record document embedding usage:", error);
        }
      },
    },
  );

  console.log("Generated document embeddings", {
    embeddingCount: vectors.length,
    elapsedMs: Date.now() - embeddingStartedAt,
  });
  if (vectors.length !== chunks.length) {
    throw new Error("Chunk and embedding counts do not match");
  }

  // 4. Persist chunks in batches.
  for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + INSERT_BATCH_SIZE);

    const batchVectors = vectors.slice(i, i + INSERT_BATCH_SIZE);

    const values = batchChunks.map((chunk, index) => ({
      organizationId,
      agentId,
      documentId,
      chunkIndex: i + index,
      content: chunk.pageContent,
      embedding: batchVectors[index]!,
      embeddingModel: EMBEDDING_MODEL,
      metadata: chunk.metadata,
    }));

    await db
      .insert(documentChunks)
      .values(values)
      .onConflictDoUpdate({
        target: [documentChunks.documentId, documentChunks.chunkIndex],
        set: {
          content: sql`excluded.content`,
          embedding: sql`excluded.embedding`,
          embeddingModel: sql`excluded.embedding_model`,
          metadata: sql`excluded.metadata`,
        },
      });
  }

  // Delete old chunks that are no longer part of this document.
  await db
    .delete(documentChunks)
    .where(
      and(
        eq(documentChunks.documentId, documentId),
        gte(documentChunks.chunkIndex, chunks.length),
      ),
    );

  return {
    documentId,
    totalChunks: chunks.length,
    totalEmbeddings: vectors.length,
  };
}
