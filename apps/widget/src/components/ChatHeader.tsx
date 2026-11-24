import { Bot } from "lucide-react";

import { Button } from "@repo/ui/components/button";

import type { WidgetConfig } from "../types/widget";

export function AgentLogo({
  agentConfig,
  className,
}: {
  agentConfig: WidgetConfig | null;
  className: string;
}) {
  if (agentConfig?.logoUrl) {
    return (
      <img
        alt=""
        className={`${className} rounded-full object-cover`}
        src={agentConfig.logoUrl}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${className} flex items-center justify-center rounded-full bg-[#f1f5ed] text-[#64804b]`}
    >
      <Bot className="size-5" />
    </span>
  );
}

export function ChatHeader({
  agentConfig,
  onClose,
}: {
  agentConfig: WidgetConfig | null;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#eff1ec] px-5 py-4">
      <div className="flex items-center gap-3">
        <AgentLogo
          agentConfig={agentConfig}
          className="size-9 shrink-0 rounded-xl"
        />
        <div>
          <h2 className="text-sm font-semibold text-[#27342b]">
            {agentConfig?.name ?? "Customer Support"}
          </h2>
          <p className="mt-1 text-xs text-[#879087]">We&apos;re here to help.</p>
        </div>
      </div>

      <Button
        aria-label="Close chat"
        className="size-9 rounded-xl text-[#63775b] hover:bg-[#f1f5ed] hover:text-[#27342b]"
        onClick={onClose}
        size="icon"
        type="button"
        variant="ghost"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ×
        </span>
      </Button>
    </div>
  );
}