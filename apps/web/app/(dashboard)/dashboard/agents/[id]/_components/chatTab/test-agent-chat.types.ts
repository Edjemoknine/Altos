import type { ChatSource } from "@/services/chat/chat.service";
import type { ChatMessage } from "@/types/agents";

export type TestChatMessage = ChatMessage & {
  sources?: ChatSource[];
};

export function uniqueSourcesByDocument(sources: ChatSource[]) {
  const seenDocumentIds = new Set<string>();

  return sources.filter((source) => {
    if (seenDocumentIds.has(source.documentId)) return false;

    seenDocumentIds.add(source.documentId);
    return true;
  });
}
