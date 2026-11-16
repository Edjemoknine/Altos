"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@repo/ui/components/native-select";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Field,
  inputClassName,
  Panel,
  PrimaryButton,
  textareaClassName,
} from "../../../../_components/dashboard-ui";
import { agentConfigurationSchema } from "@/schemas/agents";
import type {
  AgentConfigurationFormValues,
  DemoAgent,
} from "@/types/agents";

export function AgentConfigurationTab({ agent }: { agent: DemoAgent }) {
  const [savedNotice, setSavedNotice] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentConfigurationFormValues>({
    resolver: zodResolver(agentConfigurationSchema),
    defaultValues: {
      name: agent.name,
      tone: agent.tone,
      description: agent.description,
      website: `https://${agent.website}`,
      prompt: `You are ${agent.name}, a ${agent.tone.toLowerCase()} customer support assistant for Acme. Use the provided knowledge base to answer clearly and accurately. If you don't know an answer, say so and offer to connect the customer with a person.`,
    },
  });

  function saveConfiguration() {
    setSavedNotice("Agent configuration saved in this demo.");
  }

  return (
    <Panel className="max-w-3xl overflow-hidden">
      <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-[#27342b]">
          Agent configuration
        </h2>
        <p className="mt-1 text-xs text-[#879087]">
          Tune how this agent introduces itself and responds to customers.
        </p>
      </div>
      <form
        className="space-y-5 p-5 sm:p-6"
        noValidate
        onSubmit={handleSubmit(saveConfiguration)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Field id="detail-name" label="Agent name">
              <Input
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "detail-name-error" : undefined}
                className={inputClassName}
                id="detail-name"
                {...register("name")}
              />
            </Field>
            {errors.name && (
              <p
                className="mt-1 text-xs text-[#b75d47]"
                id="detail-name-error"
              >
                {errors.name.message}
              </p>
            )}
          </div>
          <Field id="detail-tone" label="Conversation tone">
            <NativeSelect
              className="w-full"
              id="detail-tone"
              {...register("tone")}
            >
              <NativeSelectOption value="Professional">
                Professional
              </NativeSelectOption>
              <NativeSelectOption value="Friendly">Friendly</NativeSelectOption>
              <NativeSelectOption value="Casual">Casual</NativeSelectOption>
              <NativeSelectOption value="Empathic">Empathic</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>
        <div>
          <Field id="detail-description" label="Description">
            <Input
              className={inputClassName}
              id="detail-description"
              {...register("description")}
            />
          </Field>
          {errors.description && (
            <p className="mt-1 text-xs text-[#b75d47]">
              {errors.description.message}
            </p>
          )}
        </div>
        <div>
          <Field
            id="detail-website"
            label="Website"
            hint="Changing your website does not automatically refresh the knowledge base."
          >
            <Input
              aria-invalid={Boolean(errors.website)}
              aria-describedby={
                errors.website ? "detail-website-error" : undefined
              }
              className={inputClassName}
              id="detail-website"
              type="url"
              {...register("website")}
            />
          </Field>
          {errors.website && (
            <p
              className="mt-1 text-xs text-[#b75d47]"
              id="detail-website-error"
            >
              {errors.website.message}
            </p>
          )}
        </div>
        <div>
          <Field
            id="system-prompt"
            label="Base system prompt"
            hint="Describe the role, voice, and boundaries for your assistant."
          >
            <Textarea
              className={`${textareaClassName} min-h-40 resize-y`}
              id="system-prompt"
              rows={6}
              {...register("prompt")}
            />
          </Field>
          {errors.prompt && (
            <p className="mt-1 text-xs text-[#b75d47]">
              {errors.prompt.message}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eff1ec] pt-4">
          <p aria-live="polite" className="text-xs text-[#5f7e49]">
            {savedNotice}
          </p>
          <PrimaryButton type="submit">
            <Save aria-hidden="true" className="size-3.5" /> Save changes
          </PrimaryButton>
        </div>
      </form>
    </Panel>
  );
}
