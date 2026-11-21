"use client";

import { useMutation } from "@tanstack/react-query";
import {
  sendChatMessage,
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
