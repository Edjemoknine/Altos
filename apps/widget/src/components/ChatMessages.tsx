import { Bubble, BubbleContent } from "@repo/ui/components/bubble";
import { Message, MessageContent } from "@repo/ui/components/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@repo/ui/components/message-scroller";

import type { WidgetUIMessage } from "../types/widget";
import MessageSources from "./MessageSources";

export function ChatMessages({
  error,
  isRestoring,
  isStreaming,
  isSubmitted,
  messages,
}: {
  error?: string;
  isRestoring: boolean;
  isStreaming: boolean;
  isSubmitted: boolean;
  messages: WidgetUIMessage[];
}) {
  return (
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
                            align={message.role === "user" ? "end" : "start"}
                            className="max-w-full"
                            key={partIndex}
                            variant={
                              message.role === "user" ? "default" : "outline"
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
                        part.data.length > 0 &&
                        !(
                          isStreaming &&
                          message.role === "assistant" &&
                          message.id === messages[messages.length - 1]?.id
                        )
                      ) {
                        return (
                          <MessageSources key={partIndex} sources={part.data} />
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

            {isSubmitted && (
              <p className="text-xs text-[#879087]">Thinking...</p>
            )}

            {error && <p className="text-xs text-[#b65e50]">{error}</p>}
          </MessageScrollerContent>
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
