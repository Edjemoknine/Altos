import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@repo/ui/components/button";
import type { PublicChatSource, WidgetUIMessage } from "./types/widget";

const params = new URLSearchParams(window.location.search);

const apiKey = params.get("apiKey") ?? "";
const publicId = params.get("agentId") ?? "";
const customerOrigin = params.get("customerOrigin") ?? "";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function getVisitorId() {
  const storageKey = `ai-widget:visitor:${publicId}`;

  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const visitorId = useMemo(() => getVisitorId(), []);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isRestoring, setIsRestoring] = useState(true);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/api/chat/${encodeURIComponent(publicId)}/messages`,

        headers: {
          "X-Widget-Key": apiKey,
          "X-Widget-Origin": customerOrigin,
        },

        prepareSendMessagesRequest: ({ messages }) => {
          const lastMessage = messages[messages.length - 1];

          const message =
            lastMessage?.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("")
              .trim() ?? "";

          return {
            body: {
              visitorId,
              conversationId,
              message,
            },
          };
        },
      }),
    [visitorId, conversationId],
  );
  const { messages, sendMessage, setMessages, status, error } =
    useChat<WidgetUIMessage>({
      transport,

      onData: (data) => {
        if (data.type === "data-conversation") {
          setConversationId(data.data.conversationId);
        }
      },
    });

  const isLoading =
    isRestoring || status === "submitted" || status === "streaming";

  useEffect(() => {
    const controller = new AbortController();

    async function restoreConversation() {
      try {
        const response = await fetch(
          `${API_URL}/api/chat/${encodeURIComponent(publicId)}/conversations/restore`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Widget-Key": apiKey,
              "X-Widget-Origin": customerOrigin,
            },
            body: JSON.stringify({ visitorId }),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to restore conversation");
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid conversation restoration response");
        }

        const { conversation, messages: restoredMessages } = result.data;

        if (controller.signal.aborted) return;

        if (conversation) {
          setConversationId(conversation.id);
        }

        const uiMessages: WidgetUIMessage[] = restoredMessages.map(
          (message: {
            id: string;
            role: "user" | "assistant";
            content: string;
            sources: PublicChatSource[] | null;
          }) => ({
            id: message.id,
            role: message.role,
            parts: [
              {
                type: "text" as const,
                text: message.content,
              },
              ...(message.role === "assistant" &&
              Array.isArray(message.sources) &&
              message.sources.length > 0
                ? [
                    {
                      type: "data-sources" as const,
                      data: message.sources,
                    },
                  ]
                : []),
            ],
          }),
        );

        setMessages(uiMessages);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Conversation restoration failed:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsRestoring(false);
        }
      }
    }

    restoreConversation();

    return () => controller.abort();
  }, [visitorId, setMessages]);

  // Tell the loader script to resize the iframe.
  useEffect(() => {
    window.parent.postMessage({ type: "ai-widget:toggle", open }, "*");
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || isLoading) return;

    sendMessage({ text: message });
    setInput("");
  }

  if (!open) {
    return (
      <div className="p-1">
        <Button
          variant="destructive"
          size="icon"
          className="size-14 rounded-full"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          💬
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <span className="font-semibold">Support</span>

        <Button variant="destructive" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3 text-sm">
        {isRestoring && (
          <p className="text-xs text-muted-foreground">
            Restoring conversation...
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary p-3 text-primary-foreground"
                : "mr-auto max-w-[90%] space-y-3"
            }
          >
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <p key={index} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                );
              }

              if (part.type === "data-sources") {
                return (
                  <div key={index} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Sources
                    </p>

                    {part.data.map((source) => (
                      <div
                        key={source.chunkId}
                        className="rounded-md border p-2"
                      >
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline"
                          >
                            {source.title}
                          </a>
                        ) : (
                          <p className="font-medium">{source.title}</p>
                        )}

                        <p className="mt-1 text-xs text-muted-foreground">
                          {source.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}

        {status === "submitted" && (
          <p className="text-xs text-muted-foreground">Thinking...</p>
        )}

        {error && <p className="text-xs text-destructive">{error.message}</p>}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message..."
          maxLength={4000}
          disabled={isLoading}
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none"
        />

        <Button type="submit" disabled={!input.trim() || isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
}
