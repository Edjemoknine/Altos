"use client";

import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { NativeSelect, NativeSelectOption } from "@repo/ui/components/native-select";
import { Textarea } from "@repo/ui/components/textarea";
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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-[560px] gap-0 overflow-y-auto rounded-2xl border border-[#e7eae3] bg-[#fdfefc] p-0 text-[#17221b] shadow-2xl">
        <DialogHeader className="border-b border-[#eff1ec] px-6 py-5 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#778675]">
            New assistant
          </p>
          <DialogTitle className="mt-1 font-heading text-xl font-semibold text-[#202c23]">
            Create an agent
          </DialogTitle>
          <DialogDescription className="text-xs text-[#849084]">
            Set the basics. You can fine-tune everything later.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 p-6" onSubmit={submit}>
          <Field id="agent-name" label="Agent name">
            <Input autoFocus className={inputClassName} id="agent-name" name="name" placeholder="e.g. Support Assistant" required />
          </Field>
          <Field id="agent-description" label="Description">
            <Input className={inputClassName} id="agent-description" name="description" placeholder="What will this agent help with?" />
          </Field>
          <Field id="agent-website" label="Target website URL" hint="We’ll use this as the starting point for your knowledge base.">
            <Input className={inputClassName} id="agent-website" name="website" placeholder="https://yourcompany.com" required type="url" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="agent-tone" label="Tone">
              <NativeSelect className="w-full" defaultValue="Friendly" id="agent-tone" name="tone">
                <NativeSelectOption>Professional</NativeSelectOption>
                <NativeSelectOption>Friendly</NativeSelectOption>
                <NativeSelectOption>Casual</NativeSelectOption>
                <NativeSelectOption>Empathic</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field id="agent-prompt" label="Base system prompt">
              <Textarea className={`${textareaClassName} min-h-[42px] resize-y`} id="agent-prompt" name="prompt" placeholder="You are a helpful support agent..." rows={2} />
            </Field>
          </div>
          {notice && <p aria-live="polite" className="text-xs text-[#b75d47]">{notice}</p>}
          <div className="flex justify-end gap-2 border-t border-[#eff1ec] pt-4">
            <SecondaryButton onClick={onClose} type="button">Cancel</SecondaryButton>
            <PrimaryButton type="submit">Create agent <span aria-hidden="true">→</span></PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
