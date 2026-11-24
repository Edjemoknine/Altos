import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@repo/ui/components/button";
import { Bubble, BubbleContent } from "@repo/ui/components/bubble";
import { Card } from "@repo/ui/components/card";
import { Message, MessageContent } from "@repo/ui/components/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@repo/ui/components/message-scroller";
import { Input } from "@repo/ui/components/input";
import type { PublicChatSource, WidgetUIMessage } from "./types/widget";

const params = new URLSearchParams(window.location.search);

const apiKey = params.get("apiKey") ?? "";
const publicId = params.get("agentId") ?? "";
const customerOrigin = params.get("customerOrigin") ?? "";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function SourceChip({ source }: { source: PublicChatSource }) {
  const className =
    "max-w-45 truncate rounded-full border border-[#e5eae0] bg-white px-2 py-0.5 text-[10px] leading-4 text-[#63775b] hover:bg-[#f1f5ed]";

  if (source.url) {
    return (
      <a
        className={className}
        href={source.url}
        rel="noreferrer"
        target="_blank"
        title={source.snippet}
      >
        {source.title}
      </a>
    );
  }

  return (
    <span className={className} title={source.snippet}>
      {source.title}
    </span>
  );
}

function MessageSources({ sources }: { sources: PublicChatSource[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleSources = expanded ? sources : sources.slice(0, 1);

  return (
    <div
      aria-label="Sources for this response"
      className="mt-1 flex flex-wrap items-center gap-1.5"
    >
      <span className="text-[10px] text-[#879087]">Sources</span>
      {visibleSources.map((source) => (
        <SourceChip key={source.documentId} source={source} />
      ))}
      {sources.length > 1 && (
        <Button
          variant={"default"}
          aria-expanded={expanded}
          className="cursor-pointer rounded-full h-6 border px-2  text-[10px] leading-4 text-[#63775b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8aaa55]"
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          type="button"
        >
          {expanded ? "Show less" : `+${sources.length - 1} more`}
        </Button>
      )}
    </div>
  );
}

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

  return (
    <div className="relative h-screen w-full overflow-hidden p-1">
      <Card
        aria-hidden={!open}
        className={`absolute inset-0 flex h-full w-full flex-col gap-0 rounded-2xl bg-white py-0 text-[#17221b] shadow-[0_8px_28px_rgba(23,34,27,0.12)] ring-1 ring-[#e7eae3] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-[0.98] opacity-0"
        }`}
        data-state={open ? "open" : "closed"}
        inert={!open}
      >
        {/*chat header*/}
        <div className="flex items-center justify-between border-b border-[#eff1ec] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-lg text-[#64804b]">
              <span aria-hidden="true">✦</span>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#27342b]">Support</h2>
              <p className="mt-1 text-xs text-[#879087]">
                We&apos;re here to help.
              </p>
            </div>
          </div>

          <Button
            aria-label="Close chat"
            className="size-9 rounded-xl text-[#63775b] hover:bg-[#f1f5ed] hover:text-[#27342b]"
            onClick={() => setOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </Button>
        </div>
        {/*         Messages      */}
        <MessageScrollerProvider>
          <MessageScroller className="min-h-0 flex-1 bg-[#fbfcfa]">
            <MessageScrollerViewport aria-live="polite" className="px-5 py-5">
              <MessageScrollerContent className="gap-4">
                {isRestoring && (
                  <p className="text-xs text-[#879087]">
                    Restoring conversation...
                  </p>
                )}

                {messages.map((message, messageIndex) => (
                  <MessageScrollerItem
                    key={message.id}
                    scrollAnchor={messageIndex === messages.length - 1}
                  >
                    <Message
                      align={message.role === "user" ? "end" : "start"}
                      className="items-end gap-2.5"
                    >
                      <MessageContent className="max-w-[82%] gap-0">
                        {message.parts.map((part, partIndex) => {
                          if (part.type === "text") {
                            return (
                              <Bubble
                                align={
                                  message.role === "user" ? "end" : "start"
                                }
                                className="max-w-full"
                                key={partIndex}
                                variant={
                                  message.role === "user"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                <BubbleContent
                                  className={`whitespace-pre-wrap text-xs leading-5 ${
                                    message.role === "user"
                                      ? "rounded-br-sm"
                                      : "rounded-bl-sm border-[#ebeee8] text-[#536052]"
                                  }`}
                                >
                                  {part.text || (
                                    <span className="animate-pulse">
                                      Thinking...
                                    </span>
                                  )}
                                </BubbleContent>
                              </Bubble>
                            );
                          }

                          if (
                            part.type === "data-sources" &&
                            part.data.length > 0
                          ) {
                            return (
                              <MessageSources
                                key={partIndex}
                                sources={part.data}
                              />
                            );
                          }

                          return null;
                        })}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}

                {!isRestoring && messages.length === 0 && (
                  <p className="py-8 text-center text-xs text-[#879087]">
                    Send a message to get started.
                  </p>
                )}

                {status === "submitted" && (
                  <p className="text-xs text-[#879087]">Thinking...</p>
                )}

                {error && (
                  <p className="text-xs text-[#b65e50]">{error.message}</p>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
        {/*         Input         */}
        <form
          className="flex gap-2 border-t border-[#eff1ec] p-4"
          onSubmit={handleSubmit}
        >
          <Input
            aria-label="Type a message"
            className="h-10 flex-1 rounded-xl border-[#e2e7de] bg-white px-3.5 text-sm text-[#28352b] placeholder:text-[#a0a99f] focus-visible:border-[#90ac68] focus-visible:ring-[#c5ef70]/20"
            disabled={isLoading}
            maxLength={4000}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask us a question..."
            value={input}
          />
          <Button
            aria-label="Send message"
            className="size-10 rounded-xl bg-[#17221b] px-0 text-white hover:bg-[#304536]"
            disabled={!input.trim() || isLoading}
            type="submit"
          >
            <span aria-hidden="true">↑</span>
          </Button>
        </form>
      </Card>

      {open !== true && (
        <Button
          aria-hidden={open}
          aria-label="Open chat"
          className={`absolute bottom-1 right-1 size-14 rounded-full bg-[#17221b] text-lg text-white shadow-[0_4px_14px_rgba(23,34,27,0.22)] transition-[opacity,transform] duration-200 hover:bg-[#304536] motion-reduce:transition-none ${
            open
              ? "pointer-events-none scale-75 opacity-0"
              : "scale-100 opacity-100"
          }`}
          disabled={open}
          onClick={() => setOpen(true)}
          size="icon"
          tabIndex={open ? -1 : 0}
          type="button"
          variant="default"
        >
          <span aria-hidden="true">✦</span>
        </Button>
      )}
    </div>
  );
}
