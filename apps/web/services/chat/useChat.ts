"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  restoreChatConversation,
  sendChatMessage,
  type RestoreConversationResult,
  type SendChatMessageInput,
} from "@/services/chat/chat.service";

type MutationInput = SendChatMessageInput;

export function useSendChatMessage() {
  return useMutation<void, Error, MutationInput>({
    mutationFn: sendChatMessage,
  });
}

export function useRestoreChatConversation(
  agentId: string,
  visitorId: string | null,
) {
  return useQuery<RestoreConversationResult, Error>({
    queryKey: ["agent-preview", "restore", agentId, visitorId],
    queryFn: () => {
      if (!visitorId) {
        throw new Error("Visitor ID is not available");
      }

      return restoreChatConversation({ agentId, visitorId });
    },
    enabled: Boolean(agentId && visitorId),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0,
  });
}
