"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  restoreChatConversation,
  sendChatMessage,
  type RestoreConversationResult,
  type SendChatMessageInput,
} from "@/services/chat/chat.service";

type MutationInput = Omit<SendChatMessageInput, "onEvent"> & {
  onEvent: SendChatMessageInput["onEvent"];
};

export function useSendChatMessage() {
  return useMutation<void, Error, MutationInput>({
    mutationFn: (input) => sendChatMessage(input),
  });
}

export function useRestoreChatConversation(
  publicId: string,
  visitorId: string | null,
) {
  return useQuery<RestoreConversationResult, Error>({
    queryKey: ["public-chat", "restore", publicId, visitorId],
    queryFn: () => {
      if (!visitorId) {
        throw new Error("Visitor ID is not available");
      }

      return restoreChatConversation({ publicId, visitorId });
    },
    enabled: Boolean(publicId && visitorId),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 0,
  });
}
