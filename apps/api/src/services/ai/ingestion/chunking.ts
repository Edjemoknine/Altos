import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
  separators: ["\n\n", "\n", ". ", " ", ""],
});

export type ChunkMetadata = {
  organizationId: string;
  agentId: string;
  sourceId: string;
  documentId: string;
  title: string;
};

export async function splitDocument(
  content: string,
  metadata: ChunkMetadata,
): Promise<Document[]> {
  if (!content.trim()) {
    throw new Error("Cannot chunk an empty document");
  }

  const chunks = await splitter.createDocuments([content], [metadata]);

  return chunks.map(
    (chunk, index) =>
      new Document({
        pageContent: chunk.pageContent,
        metadata: {
          ...chunk.metadata,
          chunkIndex: index,
        },
      }),
  );
}
