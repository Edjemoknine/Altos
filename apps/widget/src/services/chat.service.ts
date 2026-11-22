import { getApiUrl, getErrorMessage, getHeaders } from "../helpers";
import type {
  ApiResponse,
  ChatStreamEvent,
  RestoreConversationResult,
  SendChatMessageInput,
  WidgetCredentials,
} from "../types/widget";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

/**
 * Restores the visitor's latest active conversation.
 */
export async function restoreConversation(
  credentials: WidgetCredentials,
  visitorId: string,
): Promise<RestoreConversationResult> {
  const response = await fetch(
    `${getApiUrl(API_URL)}/api/chat/${encodeURIComponent(credentials.publicId)}/conversations/restore`,
    {
      method: "POST",
      headers: getHeaders(credentials),
      body: JSON.stringify({ visitorId }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result =
    (await response.json()) as ApiResponse<RestoreConversationResult>;

  if (!result.success) {
    throw new Error(result.message ?? "Unable to restore conversation");
  }

  return result.data;
}

/**
 * Parses the SSE response and forwards events to the caller.
 */
async function consumeChatStream(
  response: Response,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) {
    throw new Error("The server returned an empty response stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  function processEvent(rawEvent: string) {
    let eventName = "";
    const dataLines: string[] = [];

    for (const line of rawEvent.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (!dataLines.length) return;

    const data = dataLines.join("\n");

    let parsed: ChatStreamEvent;

    try {
      parsed = JSON.parse(data) as ChatStreamEvent;
    } catch {
      throw new Error("Received an invalid chat stream event");
    }

    // The backend sends the event type both in the SSE event
    // name and in the JSON payload.
    if (eventName && parsed.type !== eventName) {
      throw new Error("Unexpected chat stream event");
    }

    onEvent(parsed);

    if (parsed.type === "error") {
      throw new Error(parsed.message);
    }
  }

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }

      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";

      for (const event of events) {
        processEvent(event);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      processEvent(buffer);
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Sends a visitor message and consumes the streamed AI response.
 */
export async function sendChatMessage(
  credentials: WidgetCredentials,
  visitorId: string,
  input: SendChatMessageInput,
): Promise<void> {
  const response = await fetch(
    `${getApiUrl(API_URL)}/api/chat/${encodeURIComponent(credentials.publicId)}/messages`,
    {
      method: "POST",
      headers: {
        ...getHeaders(credentials),
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        visitorId,
        conversationId: input.conversationId,
        message: input.message,
      }),
      signal: input.signal,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  await consumeChatStream(response, input.onEvent, input.signal);
}
