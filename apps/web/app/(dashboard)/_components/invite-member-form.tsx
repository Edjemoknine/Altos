"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@repo/ui/components/input";
import { inviteOrganizationMember } from "@/services/organization.service";
import { Field, inputClassName, PrimaryButton } from "./dashboard-ui";

export function InviteMemberForm({
  organizationId,
  onInvited,
}: {
  organizationId: string;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const inviteEmail = email.trim();
    if (!inviteEmail) return;

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      await inviteOrganizationMember(inviteEmail, organizationId);
      setMessage("Invitation created successfully.");
      setEmail("");
      onInvited();
    } catch (inviteError) {
      setError(true);
      setMessage(
        inviteError instanceof Error
          ? inviteError.message
          : "Failed to invite member.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={handleInvite}
    >
      <div className="min-w-0 flex-1">
        <Field id="invite-email" label="Invite a teammate">
          <Input
            autoComplete="email"
            className={inputClassName}
            id="invite-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter member email"
            required
            type="email"
            value={email}
          />
        </Field>
      </div>
      <PrimaryButton disabled={loading || !email.trim()} type="submit">
        {loading ? "Sending..." : "Invite member"}
      </PrimaryButton>
      {message && (
        <p
          aria-live={error ? "assertive" : "polite"}
          className={`basis-full text-xs ${error ? "text-[#a95140]" : "text-[#5f7e49]"}`}
          role={error ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </form>
  );
}
