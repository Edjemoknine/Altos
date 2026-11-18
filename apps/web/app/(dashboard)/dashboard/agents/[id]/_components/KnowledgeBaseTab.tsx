"use client";

import { useState, type ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  Bot,
  Check,
  FileText,
  Globe2,
  LoaderCircle,
  Play,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { authClient } from "@/auth/auth-client";
import {
  Field,
  inputClassName,
  Panel,
  PrimaryButton,
} from "../../../../_components/dashboard-ui";
import { documentFileSchema, scrapeWebsiteSchema } from "@/schemas/agents";
import type { ScrapeWebsiteFormValues } from "@/types/agents";
import {
  useAgentSources,
  useDeleteAgentSource,
  useUploadAgentDocument,
} from "@/services/source.service";

export function KnowledgeBaseTab() {
  const { id: agentId } = useParams<{ id: string }>();
  const {
    data: activeOrganization,
    isPending: isOrganizationPending,
  } = authClient.useActiveOrganization();
  const organizationId = activeOrganization?.id;
  const sourcesQuery = useAgentSources(organizationId, agentId);
  const deleteSourceMutation = useDeleteAgentSource(organizationId, agentId);
  const uploadMutation = useUploadAgentDocument(organizationId, agentId);
  const [scrapeStatus, setScrapeStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [sourceToDelete, setSourceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScrapeWebsiteFormValues>({
    resolver: zodResolver(scrapeWebsiteSchema),
    defaultValues: { url: "" },
  });

  function startScraping() {
    setScrapeStatus(
      "Scraping started — pages will appear here when processing completes.",
    );
  }

  async function addDocument(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const result = documentFileSchema.safeParse(file);
    if (!result.success) {
      setFileName("");
      setFileStatus(result.error.issues[0]?.message ?? "Invalid document.");
      input.value = "";
      return;
    }

    setFileName(file.name);
    setFileStatus("Uploading document…");
    try {
      await uploadMutation.mutateAsync(file);
      setFileStatus("Ready · document uploaded and saved.");
    } catch (error) {
      setFileStatus(
        error instanceof Error ? error.message : "Unable to upload document.",
      );
    }
    input.value = "";
  }

  return (
    <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
      <Panel className="overflow-hidden">
        <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
            <Globe2 className="size-4" />
          </span>
          <h2 className="mt-3 text-sm font-semibold text-[#27342b]">
            Import from website
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#879087]">
            Crawl your website and use its content to ground agent responses.
          </p>
        </div>
        <form
          className="space-y-4 p-5 sm:p-6"
          noValidate
          onSubmit={handleSubmit(startScraping)}
        >
          <div>
            <Field id="scrape-url" label="Website URL">
              <Input
                aria-invalid={Boolean(errors.url)}
                aria-describedby={errors.url ? "scrape-url-error" : undefined}
                className={inputClassName}
                id="scrape-url"
                placeholder="https://docs.yourcompany.com"
                type="url"
                {...register("url")}
              />
            </Field>
            {errors.url && (
              <p
                aria-live="polite"
                className="mt-1 text-xs text-[#b75d47]"
                id="scrape-url-error"
              >
                {errors.url.message}
              </p>
            )}
          </div>
          <PrimaryButton type="submit">
            <Play aria-hidden="true" className="size-3.5" /> Start scraping
          </PrimaryButton>
          {scrapeStatus && (
            <p aria-live="polite" className="text-xs text-[#63804b]">
              {scrapeStatus}
            </p>
          )}
        </form>
      </Panel>
      <Panel className="overflow-hidden">
        <div className="border-b border-[#eff1ec] px-5 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2eef8] text-[#806d9a]">
            <FileText className="size-4" />
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
              onChange={addDocument}
              type="file"
              disabled={
                uploadMutation.isPending ||
                isOrganizationPending ||
                !organizationId
              }
            />
            <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#7c8c73] shadow-sm">
              <Upload className="size-4" />
            </span>
            <span className="mt-2 text-xs font-semibold text-[#536052]">
              Choose a document
            </span>
            <span className="mt-1 text-[10px] text-[#9aa398]">
              PDF, DOC, DOCX, CSV, or TXT · max 10 MB. PDFs need selectable text.
            </span>
          </label>
          {fileName && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#edf0e9] px-3 py-2.5">
              <FileText className="size-4 text-[#7b896f]" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#4d5b4e]">
                {fileName}
              </span>
              {uploadMutation.isPending ? (
                <span className="size-3 animate-spin rounded-full border-2 border-[#dbe4d1] border-t-[#7c9f57]" />
              ) : fileStatus.startsWith("Ready") ? (
                <Check className="size-4 text-[#78a050]" />
              ) : null}
            </div>
          )}
          {fileStatus && (
            <p
              aria-live="polite"
              className={`mt-2 text-[11px] ${fileStatus.startsWith("Ready") || uploadMutation.isPending ? "text-[#63804b]" : "text-[#b75d47]"}`}
            >
              {fileStatus}
            </p>
          )}
        </div>
      </Panel>
      <Panel className="overflow-hidden lg:col-span-2">
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#64804b]">
            <Bot className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#27342b]">
              Sources
            </h2>
            <p className="mt-1 text-xs text-[#879087]">
              Sources currently attached to this agent.
            </p>
          </div>
        </div>
        <div className="border-t border-[#eff1ec] px-5 py-4 sm:px-6">
          {isOrganizationPending ? (
            <p className="text-xs text-[#929b90]">
              Loading your organization…
            </p>
          ) : !organizationId ? (
            <p className="text-xs text-[#929b90]">
              Select an organization to view its sources.
            </p>
          ) : sourcesQuery.isPending ? (
            <p className="text-xs text-[#929b90]">Loading sources…</p>
          ) : sourcesQuery.isError ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="text-xs text-[#b75d47]">
                {sourcesQuery.error.message}
              </p>
              <button
                className="text-xs font-semibold text-[#536d43] underline"
                onClick={() => void sourcesQuery.refetch()}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : sourcesQuery.data?.length ? (
            <ul className="divide-y divide-[#eff1ec]">
              {sourcesQuery.data.map((source) => (
                <li
                  className="flex flex-wrap items-center gap-2 py-3 first:pt-0 last:pb-0"
                  key={source.id}
                >
                  <FileText className="size-4 shrink-0 text-[#7b896f]" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#4d5b4e]">
                    {source.originalFilename ?? source.name}
                  </span>
                  <span className="text-[10px] capitalize text-[#879087]">
                    {source.status}
                  </span>
                  <Button
                    aria-label={`Delete ${source.originalFilename ?? source.name}`}
                    className="size-8 shrink-0 rounded-lg text-[#9b7771] hover:bg-[#fff1ee] hover:text-[#a94336]"
                    disabled={deleteSourceMutation.isPending}
                    onClick={() => {
                      deleteSourceMutation.reset();
                      setSourceToDelete({
                        id: source.id,
                        name: source.originalFilename ?? source.name,
                      });
                    }}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    {deleteSourceMutation.isPending &&
                    deleteSourceMutation.variables === source.id ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-3.5 animate-spin"
                      />
                    ) : (
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#929b90]">
              No sources have been added yet.
            </p>
          )}
        </div>
      </Panel>
      <Dialog
        open={sourceToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteSourceMutation.isPending) {
            setSourceToDelete(null);
            deleteSourceMutation.reset();
          }
        }}
      >
        <DialogContent
          className="gap-0 rounded-2xl border border-[#e7eae3] bg-[#fdfefc] p-0 text-[#17221b] shadow-2xl sm:max-w-md"
          showCloseButton={!deleteSourceMutation.isPending}
        >
          <DialogHeader className="border-b border-[#eff1ec] px-6 py-5">
            <div className="flex items-start gap-3 pr-7">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ee] text-[#ad5144]">
                <AlertTriangle aria-hidden="true" className="size-5" />
              </span>
              <div>
                <DialogTitle className="font-heading text-base font-semibold text-[#26332a]">
                  Delete source?
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs leading-5 text-[#788278]">
                  This permanently deletes{" "}
                  <span className="font-semibold text-[#455047]">
                    {sourceToDelete?.name}
                  </span>
                  , its R2 file, documents, and document chunks. This action
                  cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6">
            {deleteSourceMutation.isError && (
              <p
                aria-live="assertive"
                className="mb-4 rounded-lg border border-[#f0d7d1] bg-[#fff7f5] px-3 py-2 text-xs text-[#a95140]"
                role="alert"
              >
                {deleteSourceMutation.error.message}
              </p>
            )}
            <DialogFooter className="flex-row justify-end gap-2">
              <Button
                className="rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047]"
                disabled={deleteSourceMutation.isPending}
                onClick={() => {
                  setSourceToDelete(null);
                  deleteSourceMutation.reset();
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-[#a94336] px-3.5 text-xs font-semibold text-white hover:bg-[#8f372d]"
                disabled={deleteSourceMutation.isPending}
                onClick={() => {
                  if (sourceToDelete) {
                    deleteSourceMutation.mutate(sourceToDelete.id, {
                      onSuccess: () => setSourceToDelete(null),
                    });
                  }
                }}
                type="button"
              >
                {deleteSourceMutation.isPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-3.5 animate-spin"
                  />
                ) : (
                  <Trash2 aria-hidden="true" className="size-3.5" />
                )}
                {deleteSourceMutation.isPending ? "Deleting..." : "Delete source"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
