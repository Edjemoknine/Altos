"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { createOrganizationClient } from "@/auth/auth-orgs";
import { Field, inputClassName, PrimaryButton, SecondaryButton } from "./dashboard-ui";

export function CreateOrganizationDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  function closeDialog() {
    if (isCreating) return;
    setError("");
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const slug = String(form.get("slug") ?? "")
      .trim()
      .toLowerCase();

    if (!name || !slug) {
      setError("Enter an organization name and URL slug.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      await createOrganizationClient({ name, slug });
      onCreated?.();
      onClose();
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : "Unable to create the organization. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && closeDialog()}
    >
      <DialogContent className="max-h-[92vh] max-w-[500px] gap-0 overflow-y-auto rounded-2xl border border-[#e7eae3] bg-[#fdfefc] p-0 text-[#17221b] shadow-2xl">
        <DialogHeader className="border-b border-[#eff1ec] px-6 py-5 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#778675]">
            Workspace
          </p>
          <DialogTitle className="mt-1 font-heading text-xl font-semibold text-[#202c23]">
            Create an organization
          </DialogTitle>
          <DialogDescription className="text-xs text-[#849084]">
            Create a separate workspace for your team and its agents.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 p-6" onSubmit={submit}>
          <Field id="organization-name" label="Organization name">
            <Input
              autoFocus
              className={inputClassName}
              id="organization-name"
              maxLength={100}
              name="name"
              placeholder="e.g. Acme Corporation"
              required
            />
          </Field>
          <Field
            id="organization-slug"
            label="Organization URL slug"
            hint="Use lowercase letters, numbers, and hyphens."
          >
            <Input
              className={inputClassName}
              id="organization-slug"
              maxLength={100}
              name="slug"
              pattern="[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*"
              placeholder="acme-corporation"
              required
            />
          </Field>
          {error && (
            <p aria-live="assertive" className="text-xs text-[#b75d47]" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-[#eff1ec] pt-4">
            <SecondaryButton
              disabled={isCreating}
              onClick={closeDialog}
              type="button"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton disabled={isCreating} type="submit">
              {isCreating ? "Creating..." : "Create organization"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
