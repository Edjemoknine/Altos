import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "../models/embeddings.ts";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
});

export async function splitDocuments(documents: any[]) {
  return splitter.splitDocuments(documents);
}

export async function embedChunks(contents: string[]) {
  return embeddings.embedDocuments(contents);
}
