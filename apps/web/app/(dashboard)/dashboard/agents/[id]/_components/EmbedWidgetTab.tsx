"use client";

import { useState } from "react";
import { Copy, MessageSquareText } from "lucide-react";
import { Panel, PrimaryButton } from "../../../../_components/dashboard-ui";
import { useAgentApiKey } from "./AgentApiKeyContext";

const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL;

type EmbedWidgetTabProps = {
  publicId: string;
};

export function EmbedWidgetTab({ publicId }: EmbedWidgetTabProps) {
  const { createdKey } = useAgentApiKey();
  const [copyNotice, setCopyNotice] = useState("");

  const widgetSnippet = createdKey
    ? `<script
  src="${WIDGET_URL}/loader.js"
  data-agent-id="${publicId}"
  data-api-key="${createdKey.key}"
  defer
></script>`
    : "";

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(widgetSnippet);
      setCopyNotice("Widget snippet copied to clipboard.");
      window.setTimeout(() => setCopyNotice(""), 2500);
    } catch {
      setCopyNotice(
        "Clipboard access was denied. Select and copy the text manually.",
      );
    }
  }

  return (
    <Panel className="max-w-3xl overflow-hidden">
      <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
          <MessageSquareText className="size-4" />
        </span>

        <h2 className="mt-3 text-sm font-semibold text-[#27342b]">
          Embed your support widget
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#879087]">
          Add this script before the closing{" "}
          <code className="rounded bg-[#f4f5f2] px-1">&lt;/body&gt;</code> tag
          on your website.
        </p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {!createdKey && (
          <div className="rounded-xl border border-[#efe5cf] bg-[#fcf8ed] px-4 py-3 text-xs leading-5 text-[#8f774a]">
            Generate a widget API key first. The raw key is only shown once. If
            you have lost it, create a new key.
          </div>
        )}

        {createdKey && (
          <>
            <div className="overflow-x-auto rounded-xl bg-[#16221a] p-4">
              <pre className="whitespace-pre font-mono text-xs leading-6 text-[#d4e8bd]">
                {widgetSnippet}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton onClick={copySnippet} type="button">
                <Copy className="size-3.5" /> Copy code snippet
              </PrimaryButton>

              {copyNotice && (
                <p aria-live="polite" className="text-xs text-[#63804b]">
                  {copyNotice}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
