"use client";

import { Bot } from "lucide-react";

import { TestAgentComposer } from "./TestAgentComposer";
import { TestAgentMessages } from "./TestAgentMessages";
import { useTestAgentConversation } from "./useTestAgentConversation";
import { Panel } from "@/app/(dashboard)/_components/dashboard-ui";

type TestAgentTabProps = {
  agentName: string;
  publicId: string;
};

export function TestAgentTab({ agentName, publicId }: TestAgentTabProps) {
  const {
    addVoicePreview,
    canSendMessage,
    isRestoring,
    isSending,
    messages,
    sendMessage,
  } = useTestAgentConversation({ agentName, publicId });

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

      <TestAgentMessages messages={messages} />

      <TestAgentComposer
        key={publicId}
        canSendMessage={canSendMessage}
        isRestoring={isRestoring}
        isSending={isSending}
        onSendMessage={sendMessage}
        onVoicePreview={addVoicePreview}
      />
    </Panel>
  );
}
