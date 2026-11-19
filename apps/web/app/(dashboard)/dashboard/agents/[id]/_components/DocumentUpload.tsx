"use client";

import { useState, type ChangeEvent } from "react";
import { Check, FileText, LoaderCircle, Upload } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { Panel } from "../../../../_components/dashboard-ui";
import { documentFileSchema } from "@/schemas/agents";
import {
  useAgentSources,
  useUploadAgentDocument,
} from "@/services/source.service";
import type { DocumentUploadProps, UploadStage } from "@/types/agents/configs";

const uploadStageLabels: Record<Exclude<UploadStage, "idle">, string> = {
  uploading: "Uploading file to secure storage…",
  extracting: "Extracting text from the document…",
  processing: "Saving the document and refreshing sources…",
  ready: "Ready · document uploaded and saved.",
  failed: "Unable to upload or process the document.",
};

export function DocumentUpload({
  agentId,
  isOrganizationPending,
  organizationId,
}: DocumentUploadProps) {
  const [fileName, setFileName] = useState("");
  const [uploadedSourceId, setUploadedSourceId] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [uploadError, setUploadError] = useState("");
  const sourcesQuery = useAgentSources(organizationId, agentId);
  const uploadMutation = useUploadAgentDocument(
    organizationId,
    agentId,
    setUploadStage,
  );

  async function addDocument(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadedSourceId(null);
    setUploadError("");

    const validation = documentFileSchema.safeParse(file);
    if (!validation.success) {
      setUploadStage("failed");
      setUploadError(
        validation.error.issues[0]?.message ?? "Invalid document.",
      );
      input.value = "";
      return;
    }

    setUploadStage("uploading");

    try {
      const source = await uploadMutation.mutateAsync(file);

      setUploadedSourceId(source.id);
      setUploadStage(source.status === "completed" ? "ready" : "processing");
    } catch (error) {
      setUploadStage("failed");
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload document.",
      );
    } finally {
      input.value = "";
    }
  }

  const uploadedSource = sourcesQuery.data?.find(
    (source) => source.id === uploadedSourceId,
  );
  const displayedStage =
    uploadedSource?.status === "completed"
      ? "ready"
      : uploadedSource?.status === "failed"
        ? "failed"
        : uploadStage;
  const isUploading =
    displayedStage !== "idle" &&
    displayedStage !== "ready" &&
    displayedStage !== "failed";
  const uploadMessage =
    displayedStage === "idle"
      ? ""
      : uploadError || uploadStageLabels[displayedStage];

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2eef8] text-[#806d9a]">
          <FileText aria-hidden="true" className="size-4" />
        </span>
        <h2 className="mt-3 text-sm font-semibold text-[#27342b]">
          Upload documents
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#879087]">
          Add PDF, Word, CSV, or plain-text files to your agent’s knowledge
          base.
        </p>
      </div>
      <div className="p-5 sm:p-6">
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#dce3d7] bg-[#fbfcfa] px-4 text-center transition hover:border-[#a8be91] hover:bg-[#f8faf5]">
          <Input
            accept=".pdf,.doc,.docx,.csv,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain"
            className="sr-only"
            disabled={
              uploadMutation.isPending ||
              isOrganizationPending ||
              !organizationId
            }
            onChange={addDocument}
            type="file"
          />
          <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#7c8c73] shadow-sm">
            <Upload aria-hidden="true" className="size-4" />
          </span>
          <span className="mt-2 text-xs font-semibold text-[#536052]">
            Choose a document
          </span>
          <span className="mt-1 text-[10px] text-[#9aa398]">
            PDF, DOC, DOCX, CSV, or TXT · max 10 MB. PDFs need selectable text.
          </span>
        </label>

        {fileName && displayedStage !== "idle" && (
          <div
            aria-live="polite"
            className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
              displayedStage === "failed"
                ? "border-[#f0d7d1] bg-[#fff7f5]"
                : "border-[#edf0e9]"
            }`}
            role="status"
          >
            {isUploading ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin text-[#7c9f57]"
              />
            ) : displayedStage === "ready" ? (
              <Check
                aria-hidden="true"
                className="size-4 shrink-0 text-[#78a050]"
              />
            ) : (
              <FileText
                aria-hidden="true"
                className="size-4 shrink-0 text-[#b75d47]"
              />
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#4d5b4e]">
              {fileName}
            </span>
          </div>
        )}

        {displayedStage !== "idle" && (
          <p
            aria-live="polite"
            className={`mt-2 text-[11px] ${
              displayedStage === "failed"
                ? "text-[#b75d47]"
                : displayedStage === "ready"
                  ? "text-[#63804b]"
                  : "text-[#718071]"
            }`}
            role={displayedStage === "failed" ? "alert" : undefined}
          >
            {uploadMessage}
          </p>
        )}
      </div>
    </Panel>
  );
}
