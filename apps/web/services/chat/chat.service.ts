export type ChatSource = {
  documentId: string;
  chunkId: string;
  sourceId: string;
  title: string;
  url: string | null;
  snippet: string;
};

export type ChatStreamEvent =
  | { type: "conversation"; conversationId: string }
  | { type: "sources"; sources: ChatSource[] }
  | { type: "token"; token: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

export type SendChatMessageInput = {
  agentId: string;
  visitorId: string;
  conversationId?: string;
  message: string;
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type RestoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: ChatSource[];
  createdAt: string;
};

export type RestoreConversationResult = {
  conversation: {
    id: string;
    title: string;
    status: "active";
    createdAt: string;
    updatedAt: string;
  } | null;
  messages: RestoredChatMessage[];
};

type RestoreConversationInput = {
  agentId: string;
  visitorId: string;
};

function parseSSEBlock(block: string): ChatStreamEvent | null {
  let eventName = "";
  const dataLines: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!dataLines.length) return null;

  const payload = JSON.parse(dataLines.join("\n")) as ChatStreamEvent;

  return {
    ...payload,
    type: eventName || payload.type,
  } as ChatStreamEvent;
}

export async function sendChatMessage({
  agentId,
  visitorId,
  conversationId,
  message,
  signal,
  onEvent,
}: SendChatMessageInput): Promise<void> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(
    `${API_URL}/api/agent-preview/${encodeURIComponent(agentId)}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        visitorId,
        conversationId: conversationId ?? null,
        message,
      }),
      signal,
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? "Unable to send your message");
  }

  if (!response.body) {
    throw new Error("Your browser does not support response streaming");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        if (!block.trim()) continue;

        const event = parseSSEBlock(block);
        if (!event) continue;

        if (event.type === "error") {
          throw new Error(event.message);
        }

        onEvent(event);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      const event = parseSSEBlock(buffer);

      if (event?.type === "error") {
        throw new Error(event.message);
      }

      if (event) onEvent(event);
    }
  } finally {
    reader.releaseLock();
  }
}

export async function restoreChatConversation({
  agentId,
  visitorId,
}: RestoreConversationInput): Promise<RestoreConversationResult> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(
    `${API_URL}/api/agent-preview/${encodeURIComponent(agentId)}/conversations/restore`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ visitorId }),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    console.error("Restore conversation failed:", {
      status: response.status,
      statusText: response.statusText,
      response: result,
    });

    throw new Error(
      result?.message ??
        `Unable to restore conversation (HTTP ${response.status})`,
    );
  }

  return result.data as RestoreConversationResult;
}
