"use client";

import { useEffect, useState } from "react";
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
import type { Agent, AgentConfigurationFormValues } from "@/types/agents";
import { getAgentTone } from "@/utils";
import { useUpdateAgent } from "@/services/agent.service";

function getConfigurationValues(agent: Agent): AgentConfigurationFormValues {
  return {
    name: agent.name,
    tone: getAgentTone(agent),
    description: agent.description,
    website:
      typeof agent.settings.website === "string" ? agent.settings.website : "",
    prompt: agent.instructions,
  };
}

export function AgentConfigurationTab({ agent }: { agent: Agent }) {
  const [savedNotice, setSavedNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const updateAgentMutation = useUpdateAgent(agent.organizationId, agent.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentConfigurationFormValues>({
    resolver: zodResolver(agentConfigurationSchema),
    defaultValues: getConfigurationValues(agent),
  });

  useEffect(() => {
    reset(getConfigurationValues(agent));
  }, [agent, reset]);

  async function saveConfiguration(values: AgentConfigurationFormValues) {
    setSavedNotice("");
    setSaveError("");

    try {
      const updatedAgent = await updateAgentMutation.mutateAsync({
        name: values.name,
        description: values.description,
        instructions: values.prompt,
        settings: {
          ...agent.settings,
          website: values.website,
          tone: values.tone,
        },
      });

      reset(getConfigurationValues(updatedAgent));
      setSavedNotice("Agent configuration saved.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save agent configuration.",
      );
    }
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
                disabled={updateAgentMutation.isPending}
                id="detail-name"
                {...register("name")}
              />
            </Field>
            {errors.name && (
              <p className="mt-1 text-xs text-[#b75d47]" id="detail-name-error">
                {errors.name.message}
              </p>
            )}
          </div>
          <Field id="detail-tone" label="Conversation tone">
            <NativeSelect
              className="w-full"
              disabled={updateAgentMutation.isPending}
              id="detail-tone"
              {...register("tone")}
            >
              <NativeSelectOption value="professional">
                Professional
              </NativeSelectOption>
              <NativeSelectOption value="friendly">Friendly</NativeSelectOption>
              <NativeSelectOption value="casual">Casual</NativeSelectOption>
              <NativeSelectOption value="formal">Formal</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>
        <div>
          <Field id="detail-description" label="Description">
            <Input
              className={inputClassName}
              disabled={updateAgentMutation.isPending}
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
              disabled={updateAgentMutation.isPending}
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
              disabled={updateAgentMutation.isPending}
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
          <div aria-live="polite" className="text-xs">
            {saveError ? (
              <p className="text-[#b75d47]" role="alert">
                {saveError}
              </p>
            ) : (
              <p className="text-[#5f7e49]">{savedNotice}</p>
            )}
          </div>
          <PrimaryButton disabled={updateAgentMutation.isPending} type="submit">
            <Save aria-hidden="true" className="size-3.5" />
            {updateAgentMutation.isPending ? "Saving..." : "Save changes"}
          </PrimaryButton>
        </div>
      </form>
    </Panel>
  );
}
