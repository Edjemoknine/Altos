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
import {
  useAgentWidgetKeys,
  useCreateAgentWidgetKey,
  useDeleteAgentWidgetKey,
} from "@/services/widget/useAgentWidgetKeys";

type ApiKeyTabProps = {
  agentId: string;
};

function formatDate(value: string | null) {
  if (!value) return "Never";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ApiKeyTab({ agentId }: ApiKeyTabProps) {
  const { createdKey, setCreatedKey } = useAgentApiKey();

  const [keyName, setKeyName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [notice, setNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");

  const {
    data: keys = [],
    isLoading,
    isError,
    error,
  } = useAgentWidgetKeys(agentId);

  const createMutation = useCreateAgentWidgetKey(agentId);
  const deleteMutation = useDeleteAgentWidgetKey(agentId);

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyNotice("Copied to clipboard.");
    } catch {
      setCopyNotice(
        "Clipboard access was denied. Select and copy the text manually.",
      );
    }
  }

  async function handleCreateKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = keyName.trim();

    if (!name) return;

    setNotice("");
    setCopyNotice("");

    try {
      const result = await createMutation.mutateAsync(name);

      setCreatedKey({
        id: result.id,
        name: result.name,
        key: result.key,
      });

      setShowKey(true);
      setKeyName("");
      setNotice("Widget key created successfully.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to create widget key.",
      );
    }
  }

  async function handleDeleteKey(keyId: string, keyLabel: string) {
    const confirmed = window.confirm(
      `Delete "${keyLabel}"? Websites using this key will no longer be able to authenticate.`,
    );

    if (!confirmed) return;

    setNotice("");
    setCopyNotice("");

    try {
      await deleteMutation.mutateAsync(keyId);

      if (createdKey?.id === keyId) {
        setCreatedKey(null);
        setShowKey(false);
      }

      setNotice("Widget key deleted successfully.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to delete widget key.",
      );
    }
  }

  return (
    <Panel className="max-w-3xl overflow-hidden">
      <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
          <KeyRound className="size-4" />
        </span>

        <h2 className="mt-3 text-sm font-semibold text-[#27342b]">
          Widget API keys
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#879087]">
          Create named keys to authenticate your agent's embedded support
          widget. Each key can be revoked independently.
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {/* Create key */}
        <form onSubmit={handleCreateKey} className="space-y-3">
          <Field
            id="widget-key-name"
            label="Key name"
            hint="Use a name that identifies where this key will be installed."
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="widget-key-name"
                className={inputClassName}
                placeholder="e.g. Production Website"
                maxLength={100}
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
              />

              <PrimaryButton
                type="submit"
                disabled={!keyName.trim() || createMutation.isPending}
              >
                <Plus className="size-3.5" />
                {createMutation.isPending ? "Creating..." : "Create key"}
              </PrimaryButton>
            </div>
          </Field>
        </form>

        {/* Newly created key: raw value is available only once */}
        {createdKey && (
          <div className="space-y-3 rounded-xl border border-[#dfe8d8] bg-[#f8fbf6] p-4">
            <div>
              <p className="text-xs font-semibold text-[#405a36]">
                Your new key is ready
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#74836e]">
                Copy and save this key now. You won't be able to reveal it again
                after leaving or refreshing this page.
              </p>
            </div>

            <Field id="created-widget-key" label={createdKey.name}>
              <div className="flex gap-2">
                <Input
                  id="created-widget-key"
                  readOnly
                  className={`${inputClassName} min-w-0 font-mono text-xs`}
                  value={
                    showKey
                      ? createdKey.key
                      : `${createdKey.key.slice(0, 12)}${"•".repeat(24)}`
                  }
                />

                <SecondaryButton
                  type="button"
                  onClick={() => setShowKey((value) => !value)}
                >
                  {showKey ? "Hide" : "Reveal"}
                </SecondaryButton>

                <SecondaryButton
                  type="button"
                  aria-label="Copy widget key"
                  onClick={() => copyText(createdKey.key)}
                >
                  <Copy className="size-3.5" />
                </SecondaryButton>
              </div>
            </Field>

            {copyNotice && (
              <p aria-live="polite" className="text-xs text-[#63804b]">
                {copyNotice}
              </p>
            )}
          </div>
        )}

        {/* Existing keys */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#354338]">
              Existing keys
            </h3>

            <span className="text-[11px] text-[#879087]">
              {keys.length} {keys.length === 1 ? "key" : "keys"}
            </span>
          </div>

          {isLoading ? (
            <p className="rounded-xl bg-[#fbfcfa] px-4 py-6 text-center text-xs text-[#879087]">
              Loading widget keys...
            </p>
          ) : isError ? (
            <p className="rounded-xl border border-[#f0d8d2] bg-[#fff8f6] px-4 py-4 text-xs text-[#9a6257]">
              {error instanceof Error
                ? error.message
                : "Unable to load widget keys."}
            </p>
          ) : keys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dfe5da] bg-[#fbfcfa] px-5 py-8 text-center">
              <KeyRound
                aria-hidden="true"
                className="mx-auto size-6 text-[#879881]"
              />

              <p className="mt-3 text-xs font-semibold text-[#49574b]">
                No widget keys yet
              </p>

              <p className="mt-1 text-[11px] text-[#929b90]">
                Create your first key to connect your website.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eff1ec] rounded-xl border border-[#e8ece5]">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#354338]">
                      {key.name}
                    </p>

                    <p className="mt-1 text-[11px] text-[#879087]">
                      Created {formatDate(key.createdAt)}
                    </p>

                    <p className="mt-1 text-[11px] text-[#879087]">
                      Last used: {formatDate(key.lastUsedAt)}
                    </p>
                  </div>

                  <SecondaryButton
                    type="button"
                    disabled={deleteMutation.isPending}
                    className="self-start text-[#9a6257] hover:border-[#e7cfc9] hover:bg-[#fff8f6] sm:self-auto"
                    onClick={() => handleDeleteKey(key.id, key.name)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </SecondaryButton>
                </div>
              ))}
            </div>
          )}
        </div>

        {notice && (
          <p aria-live="polite" className="text-xs text-[#63804b]">
            {notice}
          </p>
        )}
      </div>
    </Panel>
  );
}
