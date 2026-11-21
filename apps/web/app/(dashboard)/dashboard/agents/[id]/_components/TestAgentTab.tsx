"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AudioLines, Bot, Mic, Volume2 } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";

import {
  inputClassName,
  Panel,
  PrimaryButton,
} from "../../../../_components/dashboard-ui";

import { testAgentMessageSchema } from "@/schemas/agents";
import type { ChatMessage, TestAgentFormValues } from "@/types/agents";

import { useSendChatMessage } from "@/services/chat/useChat";
import type { ChatSource, ChatStreamEvent } from "@/services/chat/chat.service";

type TestAgentTabProps = {
  agentName: string;
  publicId: string;
};

export function TestAgentTab({ agentName, publicId }: TestAgentTabProps) {
  const [isRecording, setIsRecording] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: `Hi! I’m ${agentName}. What can I help you with?`,
    },
  ]);

  const [conversationId, setConversationId] = useState<string | undefined>();

  const [sources, setSources] = useState<ChatSource[]>([]);

  const visitorIdRef = useRef<string | null>(null);

  const sendMessageMutation = useSendChatMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TestAgentFormValues>({
    resolver: zodResolver(testAgentMessageSchema),
    defaultValues: { message: "" },
    mode: "onChange",
  });

  // Reset the test conversation when switching agents.
  useEffect(() => {
    visitorIdRef.current = null;
    setConversationId(undefined);
    setSources([]);
    setIsRecording(false);

    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: `Hi! I’m ${agentName}. What can I help you with?`,
      },
    ]);

    reset({ message: "" });
  }, [publicId, agentName, reset]);

  function getVisitorId(): string {
    if (!visitorIdRef.current) {
      const storageKey = `test-agent-visitor-${publicId}`;

      let visitorId = sessionStorage.getItem(storageKey);

      if (!visitorId) {
        visitorId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, visitorId);
      }

      visitorIdRef.current = visitorId;
    }

    return visitorIdRef.current;
  }

  async function sendMessage({ message }: TestAgentFormValues) {
    const text = message.trim();

    if (!text || sendMessageMutation.isPending) return;

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

    setSources([]);
    reset();

    function handleChatEvent(event: ChatStreamEvent) {
      switch (event.type) {
        case "conversation":
          setConversationId(event.conversationId);
          break;

        case "sources":
          setSources(event.sources);
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
          break;

        case "error":
          break;
      }
    }

    try {
      await sendMessageMutation.mutateAsync({
        publicId,
        visitorId: getVisitorId(),
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

  function toggleRecording() {
    setIsRecording((recording) => {
      if (recording) {
        setMessages((current) => [
          ...current,
          {
            id: Date.now(),
            role: "assistant",
            text: "Voice test captured in this preview. Connect a speech service to process audio.",
          },
        ]);
      }

      return !recording;
    });
  }

  return (
    <Panel className="max-w-3xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
            <Bot className="size-4" />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-[#27342b]">
              Test {agentName}
            </h2>

            <p className="mt-1 text-xs text-[#879087]">
              Preview text and voice interactions.
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#6f8958]">
          <span className="size-1.5 rounded-full bg-[#8ab45e]" />
          Preview
        </span>
      </div>

      <div
        aria-live="polite"
        className="flex max-h-[360px] min-h-[250px] flex-col gap-4 overflow-y-auto bg-[#fbfcfa] px-5 py-5 sm:px-6"
      >
        {messages.map((message) => (
          <div
            className={`flex items-end gap-2.5 ${
              message.role === "user" ? "justify-end" : ""
            }`}
            key={message.id}
          >
            {message.role === "assistant" && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#eaf1e1] text-[#66834e]">
                <Bot className="size-3.5" />
              </span>
            )}

            <p
              className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                message.role === "user"
                  ? "rounded-br-sm bg-[#17221b] text-white"
                  : "rounded-bl-sm border border-[#ebeee8] bg-white text-[#536052]"
              }`}
            >
              {message.text || (
                <span className="animate-pulse">Thinking...</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="border-t border-[#eff1ec] bg-[#fbfcfa] px-5 py-3 sm:px-6">
          <p className="mb-2 text-[11px] font-semibold text-[#536052]">
            Retrieved sources
          </p>

          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <span
                key={source.chunkId}
                className="max-w-full truncate rounded-lg border border-[#e5eae0] bg-white px-2.5 py-1.5 text-[10px] text-[#63775b]"
                title={source.title}
              >
                {source.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {isRecording && (
        <p
          aria-live="polite"
          className="flex items-center gap-2 border-t border-[#f0e3e0] bg-[#fff8f6] px-5 py-2.5 text-[11px] text-[#a75e50] sm:px-6"
        >
          <span className="size-2 animate-pulse rounded-full bg-[#d76e5c]" />
          Listening… click the microphone again to finish your voice test.
        </p>
      )}

      <div className="border-t border-[#eff1ec] p-4 sm:p-5">
        <form
          className="flex gap-2"
          noValidate
          onSubmit={handleSubmit(sendMessage)}
        >
          <Input
            aria-label="Message your agent"
            className={`${inputClassName} flex-1`}
            placeholder="Ask your agent a question…"
            disabled={sendMessageMutation.isPending}
            {...register("message")}
          />

          <Button
            aria-label={isRecording ? "Stop voice test" : "Start voice test"}
            className={`size-10 shrink-0 rounded-xl border transition ${
              isRecording
                ? "border-[#f0d4cd] bg-[#fff3f0] text-[#b65e50]"
                : "border-[#e2e7de] bg-white text-[#63775b] hover:bg-[#f5f8f1]"
            }`}
            onClick={toggleRecording}
            size="icon"
            type="button"
            variant="outline"
          >
            {isRecording ? (
              <AudioLines className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </Button>

          <PrimaryButton
            aria-label="Send message"
            className="size-10 px-0"
            disabled={!isValid || sendMessageMutation.isPending}
            type="submit"
          >
            <span aria-hidden="true">↑</span>
          </PrimaryButton>
        </form>

        <div className="mt-3 flex items-center justify-between text-[10px] text-[#a0a89e]">
          <span className="flex items-center gap-1">
            <Volume2 className="size-3" />
            Text + voice test preview
          </span>

          <span>
            {sendMessageMutation.isPending
              ? "Agent is responding..."
              : "Powered by your agent's knowledge base"}
          </span>
        </div>
      </div>
    </Panel>
  );
}
