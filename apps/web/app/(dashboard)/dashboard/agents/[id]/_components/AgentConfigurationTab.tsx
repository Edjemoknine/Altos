"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon, LoaderCircle, Save, Upload } from "lucide-react";
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
import {
  useUpdateAgent,
  useUploadAgentLogo,
} from "@/services/agent/agent.service";
function getConfigurationValues(agent: Agent): AgentConfigurationFormValues {
  return {
    name: agent.name,
    tone: getAgentTone(agent),
    description: agent.description,
    targetWebsiteUrl:
      typeof agent.settings.targetWebsiteUrl === "string"
        ? agent.settings.targetWebsiteUrl
        : "",
    prompt: agent.instructions,
  };
}

export function AgentConfigurationTab({ agent }: { agent: Agent }) {
  const [savedNotice, setSavedNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const updateAgentMutation = useUpdateAgent(agent.organizationId, agent.id);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    agent.logoUrl ?? null,
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState("");
  const uploadLogoMutation = useUploadAgentLogo(agent.organizationId, agent.id);
  async function handleUploadLogo() {
    if (!logoFile) return;

    setLogoError("");

    try {
      const updatedAgent = await uploadLogoMutation.mutateAsync(logoFile);

      setLogoFile(null);
      setLogoPreview(updatedAgent.logoUrl ?? null);
      setSavedNotice("Agent logo uploaded successfully.");
    } catch (error) {
      setLogoError(
        error instanceof Error ? error.message : "Unable to upload agent logo.",
      );
    }
  }
  useEffect(() => {
    setLogoPreview(agent.logoUrl ?? null);
    setLogoFile(null);
  }, [agent.id, agent.logoUrl]);
  function handleLogoChange(file?: File) {
    setLogoError("");

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setLogoError("Please select a PNG, JPEG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be smaller than 2 MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }
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

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

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
          targetWebsiteUrl: values.targetWebsiteUrl,
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
          <div className="flex flex-col gap-4">
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
                <NativeSelectOption value="friendly">
                  Friendly
                </NativeSelectOption>
                <NativeSelectOption value="casual">Casual</NativeSelectOption>
                <NativeSelectOption value="formal">Formal</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
          <div className=" flex justify-center flex-col">
            <Field id="agent-logo" label="Agent logo">
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#dce3d7] bg-[#fbfcfa] px-4 py-3 text-center transition hover:border-[#a8be91] hover:bg-[#f8faf5]">
                <Input
                  id="agent-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) =>
                    handleLogoChange(event.target.files?.[0])
                  }
                />
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border border-[#eff1ec] bg-white shadow-sm">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Agent logo preview"
                      className="size-full object-contain"
                    />
                  ) : (
                    <ImageIcon
                      aria-hidden="true"
                      className="size-5 text-[#a0aa9c]"
                    />
                  )}
                </div>
                <span className="mt-2 text-xs font-semibold text-[#536052]">
                  {logoPreview ? "Change agent logo" : "Choose an agent logo"}
                </span>
                <span className="mt-1 text-[10px] text-[#9aa398]">
                  PNG, JPEG, or WebP · max 2 MB
                </span>
              </label>
            </Field>

            {logoError && (
              <p className="mt-1 text-xs text-[#b75d47]" role="alert">
                {logoError}
              </p>
            )}

            {logoFile && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploadLogoMutation.isPending}
                  onClick={handleUploadLogo}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#27342b] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#3b4b3d] disabled:opacity-50"
                >
                  {uploadLogoMutation.isPending ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-3.5 animate-spin"
                    />
                  ) : (
                    <Upload aria-hidden="true" className="size-3.5" />
                  )}
                  {uploadLogoMutation.isPending
                    ? "Uploading..."
                    : "Upload logo"}
                </button>
                <button
                  type="button"
                  disabled={uploadLogoMutation.isPending}
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview(agent.logoUrl ?? null);
                    setLogoError("");
                  }}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-[#879087] transition hover:bg-[#f8f9f6] hover:text-[#27342b] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <Field
            id="detail-website"
            label="Website"
            hint="Changing your website does not automatically refresh the knowledge base."
          >
            <Input
              aria-invalid={Boolean(errors.targetWebsiteUrl)}
              aria-describedby={
                errors.targetWebsiteUrl ? "detail-website-error" : undefined
              }
              className={inputClassName}
              disabled={updateAgentMutation.isPending}
              id="detail-website"
              type="url"
              {...register("targetWebsiteUrl")}
            />
          </Field>
          {errors.targetWebsiteUrl && (
            <p
              className="mt-1 text-xs text-[#b75d47]"
              id="detail-website-error"
            >
              {errors.targetWebsiteUrl.message}
            </p>
          )}
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
