"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Input } from "@repo/ui/components/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@repo/ui/components/native-select";
import { Textarea } from "@repo/ui/components/textarea";

import { authClient } from "@/auth/auth-client";
import { useCreateAgent } from "@/services/agent.service";
import { createAgentSchema } from "@/schemas/agents";
import type { CreateAgentFormValues } from "@/types/agents";

import {
  Field,
  inputClassName,
  PageHeading,
  Panel,
  PrimaryButton,
  textareaClassName,
} from "../../../_components/dashboard-ui";

export default function NewAgentPage() {
  const router = useRouter();
  const { data: activeOrganization, isPending: isOrganizationPending } =
    authClient.useActiveOrganization();
  const createAgentMutation = useCreateAgent(activeOrganization?.id);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentFormValues>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      tone: "friendly",
      prompt: "",
    },
  });

  async function submit(values: CreateAgentFormValues) {
    clearErrors("root");
    if (!activeOrganization?.id) {
      setError("root", {
        message: "Please select an organization before creating an agent.",
      });
      return;
    }

    try {
      const parsedUrl = new URL(values.website);
      const normalizedWebsite =
        parsedUrl.origin + parsedUrl.pathname.replace(/\/$/, "");

      const agent = await createAgentMutation.mutateAsync({
        name: values.name,
        description: values.description,
        instructions: values.prompt,
        settings: {
          website: normalizedWebsite,
          tone: values.tone,
        },
      });

      router.push(`/dashboard/agents/${agent.id}`);
      router.refresh();
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating your agent.",
      });
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Workspace"
        title="Create an agent"
        description="Set up a new AI agent for your customers. You can fine-tune its behavior later."
        action={
          <Link
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047] transition hover:border-[#cbd7c1] hover:bg-[#fafbf8]"
            href="/dashboard/agents"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to agents
          </Link>
        }
      />

      <Panel className="mx-auto max-w-3xl overflow-hidden">
        <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-[#27342b]">
            Agent details
          </h2>

          <p className="mt-1 text-xs leading-5 text-[#879087]">
            Start with a name, website, and the personality for your agent.
          </p>

          {activeOrganization && (
            <p className="mt-2 text-xs text-[#718071]">
              Creating agent for:{" "}
              <span className="font-semibold text-[#455047]">
                {activeOrganization.name}
              </span>
            </p>
          )}
        </div>

        <form
          className="space-y-5 p-5 sm:p-6"
          noValidate
          onSubmit={handleSubmit(submit)}
        >
          <Field id="agent-name" label="Agent name">
            <Input
              autoFocus
              className={inputClassName}
              id="agent-name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "agent-name-error" : undefined}
              placeholder="e.g. Support Assistant"
              disabled={isSubmitting}
              {...register("name")}
            />
          </Field>
          {errors.name && (
            <p className="-mt-4 text-xs text-[#b75d47]" id="agent-name-error">
              {errors.name.message}
            </p>
          )}

          <Field id="agent-description" label="Description">
            <Input
              className={inputClassName}
              id="agent-description"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "agent-description-error" : undefined
              }
              placeholder="What will this agent help with?"
              disabled={isSubmitting}
              {...register("description")}
            />
          </Field>
          {errors.description && (
            <p
              className="-mt-4 text-xs text-[#b75d47]"
              id="agent-description-error"
            >
              {errors.description.message}
            </p>
          )}

          <Field
            id="agent-website"
            label="Target website URL"
            hint="We'll use this as the starting point for your knowledge base."
          >
            <Input
              className={inputClassName}
              id="agent-website"
              aria-invalid={Boolean(errors.website)}
              aria-describedby={
                errors.website ? "agent-website-error" : undefined
              }
              placeholder="https://yourcompany.com"
              type="url"
              disabled={isSubmitting}
              {...register("website")}
            />
          </Field>
          {errors.website && (
            <p
              className="-mt-4 text-xs text-[#b75d47]"
              id="agent-website-error"
            >
              {errors.website.message}
            </p>
          )}

          <Field id="agent-tone" label="Tone">
            <NativeSelect
              className="w-full"
              id="agent-tone"
              disabled={isSubmitting}
              {...register("tone")}
            >
              <NativeSelectOption value="professional">
                Professional
              </NativeSelectOption>
              <NativeSelectOption value="friendly">Friendly</NativeSelectOption>
              <NativeSelectOption value="casual">Casual</NativeSelectOption>
              <NativeSelectOption value="formal">formal</NativeSelectOption>
            </NativeSelect>
          </Field>

          <Field
            id="agent-prompt"
            label="Base system prompt"
            hint="Define the agent's responsibilities, behavior, and response guidelines."
          >
            <Textarea
              className={`${textareaClassName} min-h-36 resize-y`}
              id="agent-prompt"
              aria-invalid={Boolean(errors.prompt)}
              aria-describedby={
                errors.prompt ? "agent-prompt-error" : undefined
              }
              placeholder="You are a helpful customer support assistant. Your job is to answer customer questions using the company's knowledge base..."
              rows={5}
              disabled={isSubmitting}
              {...register("prompt")}
            />
          </Field>
          {errors.prompt && (
            <p className="-mt-4 text-xs text-[#b75d47]" id="agent-prompt-error">
              {errors.prompt.message}
            </p>
          )}

          {errors.root && (
            <p
              aria-live="assertive"
              className="text-xs text-[#b75d47]"
              role="alert"
            >
              {errors.root.message}
            </p>
          )}

          {isOrganizationPending && (
            <p className="text-xs text-[#879087]">
              Loading your active organization...
            </p>
          )}

          {!isOrganizationPending && !activeOrganization && (
            <p className="text-xs text-[#b75d47]">
              No active organization selected. Please select an organization
              before creating an agent.
            </p>
          )}

          <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#eff1ec] pt-4 sm:flex-row">
            <Link
              aria-disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047] transition hover:border-[#cbd7c1] hover:bg-[#fafbf8]"
              href="/dashboard/agents"
            >
              Cancel
            </Link>

            <PrimaryButton
              type="submit"
              disabled={
                isSubmitting || isOrganizationPending || !activeOrganization?.id
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create agent <span aria-hidden="true">→</span>
                </>
              )}
            </PrimaryButton>
          </div>
        </form>
      </Panel>
    </>
  );
}
