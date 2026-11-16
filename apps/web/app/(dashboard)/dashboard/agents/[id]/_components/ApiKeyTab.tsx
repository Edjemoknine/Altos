"use client";

import { useState } from "react";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import {
  Field,
  inputClassName,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from "../../../../_components/dashboard-ui";
import { useAgentApiKey } from "./AgentApiKeyContext";

export function ApiKeyTab() {
  const { apiKey, setApiKey } = useAgentApiKey();
  const [showKey, setShowKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyNotice("API key copied to clipboard.");
      window.setTimeout(() => setCopyNotice(""), 2500);
    } catch {
      setCopyNotice(
        "Clipboard access was denied. Select and copy the text manually.",
      );
    }
  }

  function generateKey() {
    const bytes = new Uint8Array(18);
    window.crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    setApiKey(`ai_key_${suffix}`);
    setShowKey(false);
    setKeyNotice(
      "A demo key has been generated. Connect your backend before using it in production.",
    );
  }

  function deleteKey() {
    if (
      !window.confirm(
        "Delete this API key? Any integrations using it will stop working.",
      )
    ) {
      return;
    }
    setApiKey("");
    setKeyNotice("The demo API key was deleted.");
  }

  return (
    <Panel className="max-w-3xl overflow-hidden">
      <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
          <KeyRound className="size-4" />
        </span>
        <h2 className="mt-3 text-sm font-semibold text-[#27342b]">
          Agent API key
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#879087]">
          Use a private key to connect your applications with this agent. Keep
          it secret.
        </p>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {apiKey ? (
          <>
            <Field
              id="generated-key"
              label="Generated key"
              hint="This demo key is generated in your browser and is not connected to a live API."
            >
              <div className="flex gap-2">
                <Input
                  className={`${inputClassName} font-mono text-xs`}
                  id="generated-key"
                  readOnly
                  value={
                    showKey ? apiKey : `${apiKey.slice(0, 11)}${"•".repeat(20)}`
                  }
                />
                <SecondaryButton
                  onClick={() => setShowKey((visible) => !visible)}
                  type="button"
                >
                  {showKey ? "Hide" : "Reveal"}
                </SecondaryButton>
                <SecondaryButton
                  aria-label="Copy API key"
                  onClick={() => copyText(apiKey)}
                  type="button"
                >
                  <Copy className="size-3.5" />
                </SecondaryButton>
              </div>
            </Field>
            <SecondaryButton
              className="text-[#9a6257] hover:border-[#e7cfc9] hover:bg-[#fff8f6]"
              onClick={deleteKey}
              type="button"
            >
              <Trash2 className="size-3.5" /> Delete key
            </SecondaryButton>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[#dfe5da] bg-[#fbfcfa] px-5 py-8 text-center">
            <KeyRound
              aria-hidden="true"
              className="mx-auto size-6 text-[#879881]"
            />
            <p className="mt-3 text-xs font-semibold text-[#49574b]">
              No API key yet
            </p>
            <p className="mt-1 text-[11px] text-[#929b90]">
              Generate a key to use this agent in your app.
            </p>
            <PrimaryButton className="mt-4" onClick={generateKey} type="button">
              <Plus className="size-3.5" /> Generate API key
            </PrimaryButton>
          </div>
        )}
        {keyNotice && (
          <p aria-live="polite" className="text-xs text-[#63804b]">
            {keyNotice}
          </p>
        )}
        {copyNotice && (
          <p aria-live="polite" className="text-xs text-[#63804b]">
            {copyNotice}
          </p>
        )}
      </div>
    </Panel>
  );
}
