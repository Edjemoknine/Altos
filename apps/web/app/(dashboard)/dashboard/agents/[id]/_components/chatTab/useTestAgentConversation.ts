"use client";

import { useEffect, useState } from "react";

import {
  useRestoreChatConversation,
  useSendChatMessage,
} from "@/services/chat/useChat";
import type { ChatStreamEvent } from "@/services/chat/chat.service";

import { uniqueSourcesByDocument } from "./test-agent-chat.types";
import type { TestChatMessage } from "./test-agent-chat.types";

type UseTestAgentConversationProps = {
  agentId: string;
  agentName: string;
};

export function useTestAgentConversation({
  agentName,
  agentId,
}: UseTestAgentConversationProps) {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [messages, setMessages] = useState<TestChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: `Hi! I’m ${agentName}. What can I help you with?`,
    },
  ]);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const restoreQuery = useRestoreChatConversation(agentId, visitorId);
  const sendMessageMutation = useSendChatMessage();

  useEffect(() => {
    const storageKey = `test-agent-visitor-${agentId}`;
    let storedVisitorId = sessionStorage.getItem(storageKey);

    if (!storedVisitorId) {
      storedVisitorId = crypto.randomUUID();
      sessionStorage.setItem(storageKey, storedVisitorId);
    }

    setVisitorId(storedVisitorId);
    setConversationId(undefined);
    setIsRestoring(true);
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: `Hi! I’m ${agentName}. What can I help you with?`,
      },
    ]);
  }, [agentId, agentName]);

  useEffect(() => {
    if (!visitorId || !restoreQuery.isFetched) return;

    if (restoreQuery.isError) {
      console.error("Failed to restore conversation:", restoreQuery.error);
      setIsRestoring(false);
      return;
    }

    const result = restoreQuery.data;

    if (result?.conversation) {
      setConversationId(result.conversation.id);
      setMessages(
        result.messages.map((message, index) => ({
          id: index + 1,
          role: message.role,
          text: message.content,
          sources: uniqueSourcesByDocument(message.sources ?? []),
        })),
      );
    }

    setIsRestoring(false);
  }, [
    agentName,
    visitorId,
    restoreQuery.data,
    restoreQuery.isFetched,
    restoreQuery.isError,
    restoreQuery.error,
  ]);

  async function sendMessage(message: string) {
    const text = message.trim();

    if (!text || !visitorId || sendMessageMutation.isPending) return;

    const userMessageId = Date.now();
    const assistantMessageId = userMessageId + 1;

    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        text,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        text: "",
      },
    ]);

    function handleChatEvent(event: ChatStreamEvent) {
      switch (event.type) {
        case "conversation":
          setConversationId(event.conversationId);
          break;

        case "sources":
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMessageId
                ? { ...item, sources: uniqueSourcesByDocument(event.sources) }
                : item,
            ),
          );
          break;

        case "token":
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMessageId
                ? { ...item, text: item.text + event.token }
                : item,
            ),
          );
          break;

        case "done":
        case "error":
          break;
      }
    }

    try {
      await sendMessageMutation.mutateAsync({
        agentId,
        visitorId,
        conversationId,
        message: text,
        onEvent: handleChatEvent,
      });
    } catch (error) {
      console.error("Failed to send chat message:", error);

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                text: "Sorry, something went wrong. Please try again.",
              }
            : item,
        ),
      );
    }
  }

  function addVoicePreview() {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "assistant",
        text: "Voice test captured in this preview. Connect a speech service to process audio.",
      },
    ]);
  }

  return {
    addVoicePreview,
    canSendMessage: Boolean(visitorId) && !isRestoring,
    isRestoring,
    isSending: sendMessageMutation.isPending,
    messages,
    sendMessage,
  };
}
