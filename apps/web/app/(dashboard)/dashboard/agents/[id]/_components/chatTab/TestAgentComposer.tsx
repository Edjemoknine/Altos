"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AudioLines, Mic, Volume2 } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";

import { testAgentMessageSchema } from "@/schemas/agents";
import type { TestAgentFormValues } from "@/types/agents";
import {
  inputClassName,
  PrimaryButton,
} from "@/app/(dashboard)/_components/dashboard-ui";

type TestAgentComposerProps = {
  canSendMessage: boolean;
  isRestoring: boolean;
  isSending: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onVoicePreview: () => void;
};

export function TestAgentComposer({
  canSendMessage,
  isRestoring,
  isSending,
  onSendMessage,
  onVoicePreview,
}: TestAgentComposerProps) {
  const [isRecording, setIsRecording] = useState(false);

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

  function submitMessage({ message }: TestAgentFormValues) {
    reset();
    void onSendMessage(message);
  }

  function toggleRecording() {
    if (isRecording) onVoicePreview();
    setIsRecording((recording) => !recording);
  }

  return (
    <>
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
          onSubmit={handleSubmit(submitMessage)}
        >
          <Input
            aria-label="Message your agent"
            className={`${inputClassName} flex-1`}
            placeholder="Ask your agent a question…"
            disabled={!canSendMessage || isSending}
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
            disabled={!isValid || !canSendMessage || isSending}
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
            {isRestoring
              ? "Restoring conversation..."
              : isSending
                ? "Agent is responding..."
                : "Powered by your agent's knowledge base"}
          </span>
        </div>
      </div>
    </>
  );
}
