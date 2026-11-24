"use client";

import { Bot } from "lucide-react";

import { Bubble, BubbleContent } from "@repo/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@repo/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@repo/ui/components/message-scroller";

import type { TestChatMessage } from "./test-agent-chat.types";

export function TestAgentMessages({
  messages,
}: {
  messages: TestChatMessage[];
}) {
  return (
    <MessageScrollerProvider>
      <MessageScroller className="h-90 min-h-62.5 max-h-90 bg-[#fbfcfa]">
        <MessageScrollerViewport
          aria-live="polite"
          className="px-5 py-5 sm:px-6"
        >
          <MessageScrollerContent className="gap-4">
            {messages.map((message, index) => (
              <MessageScrollerItem
                key={message.id}
                scrollAnchor={index === messages.length - 1}
              >
                <Message
                  align={message.role === "user" ? "end" : "start"}
                  className="items-end gap-2.5"
                >
                  {message.role === "assistant" && (
                    <MessageAvatar className="size-7 rounded-lg bg-[#eaf1e1] text-[#66834e]">
                      <Bot className="size-3.5" />
                    </MessageAvatar>
                  )}

                  <MessageContent className="max-w-[82%] gap-0">
                    <Bubble
                      align={message.role === "user" ? "end" : "start"}
                      variant={message.role === "user" ? "default" : "outline"}
                      className="max-w-full"
                    >
                      <BubbleContent
                        className={`whitespace-pre-wrap text-xs leading-5 ${
                          message.role === "user"
                            ? "rounded-br-sm"
                            : "rounded-bl-sm border-[#ebeee8] text-[#536052]"
                        }`}
                      >
                        {message.text || (
                          <span className="animate-pulse">Thinking...</span>
                        )}
                      </BubbleContent>
                    </Bubble>

                    {message.sources && message.sources.length > 0 && (
                      <div
                        aria-label="Sources for this response"
                        className="mt-1 flex flex-wrap items-center gap-1.5"
                      >
                        <span className="text-[10px] text-[#879087]">
                          Sources
                        </span>
                        {message.sources.map((source) =>
                          source.url ? (
                            <a
                              className="max-w-45 truncate rounded-full border border-[#e5eae0] bg-white px-2 py-0.5 text-[10px] leading-4 text-[#63775b] hover:bg-[#f1f5ed]"
                              href={source.url}
                              key={source.documentId}
                              rel="noreferrer"
                              target="_blank"
                              title={source.snippet}
                            >
                              {source.title}
                            </a>
                          ) : (
                            <span
                              className="max-w-45 truncate rounded-full border border-[#e5eae0] bg-white px-2 py-0.5 text-[10px] leading-4 text-[#63775b]"
                              key={source.documentId}
                              title={source.snippet}
                            >
                              {source.title}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>

        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
