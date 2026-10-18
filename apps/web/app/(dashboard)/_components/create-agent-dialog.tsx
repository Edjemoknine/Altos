"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Agent, AgentTone } from "./mock-data";
import { Field, PrimaryButton, SecondaryButton, inputClassName, textareaClassName } from "./dashboard-ui";

export function CreateAgentDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (agent: Agent) => void;
}) {
  const [notice, setNotice] = useState("");

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const website = String(form.get("website") ?? "").trim();
    if (!name || !website) {
      setNotice("Add an agent name and website to continue.");
      return;
    }

    const tone = String(form.get("tone") ?? "Friendly") as AgentTone;
    onCreate({
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name,
      description: String(form.get("description") ?? "").trim(),
      website: website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      tone,
      createdAt: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date()),
      status: "Training",
    });
    setNotice("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101b15]/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="create-agent-title"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-[#e7eae3] bg-[#fdfefc] shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-[#eff1ec] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#778675]">
              New assistant
            </p>
            <h2 id="create-agent-title" className="mt-1 font-heading text-xl font-semibold text-[#202c23]">
              Create an agent
            </h2>
            <p className="mt-1 text-xs text-[#849084]">
              Set the basics. You can fine-tune everything later.
            </p>
          </div>
          <button
            aria-label="Close dialog"
            className="flex size-8 items-center justify-center rounded-lg text-[#7e887e] transition hover:bg-[#f0f3ed] hover:text-[#26342a]"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <form className="space-y-4 p-6" onSubmit={submit}>
          <Field id="agent-name" label="Agent name">
            <input autoFocus className={inputClassName} id="agent-name" name="name" placeholder="e.g. Support Assistant" required />
          </Field>
          <Field id="agent-description" label="Description">
            <input className={inputClassName} id="agent-description" name="description" placeholder="What will this agent help with?" />
          </Field>
          <Field id="agent-website" label="Target website URL" hint="We’ll use this as the starting point for your knowledge base.">
            <input className={inputClassName} id="agent-website" name="website" placeholder="https://yourcompany.com" required type="url" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="agent-tone" label="Tone">
              <select className={inputClassName} defaultValue="Friendly" id="agent-tone" name="tone">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Casual</option>
                <option>Empathic</option>
              </select>
            </Field>
            <Field id="agent-prompt" label="Base system prompt">
              <textarea className={`${textareaClassName} min-h-[42px] resize-y`} id="agent-prompt" name="prompt" placeholder="You are a helpful support agent..." rows={2} />
            </Field>
          </div>
          {notice && <p aria-live="polite" className="text-xs text-[#b75d47]">{notice}</p>}
          <div className="flex justify-end gap-2 border-t border-[#eff1ec] pt-4">
            <SecondaryButton onClick={onClose} type="button">Cancel</SecondaryButton>
            <PrimaryButton type="submit">Create agent <span aria-hidden="true">→</span></PrimaryButton>
          </div>
        </form>
      </section>
    </div>
  );
}
