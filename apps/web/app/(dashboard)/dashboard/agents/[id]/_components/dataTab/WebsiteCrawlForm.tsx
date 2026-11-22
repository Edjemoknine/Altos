"use client";

import { useState, type FormEvent } from "react";
import { Globe2, LoaderCircle, Play } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";

import {
  useCreateWebsiteSource,
  useSourceIngestionStatus,
} from "@/services/source.service";

import {
  Field,
  inputClassName,
  Panel,
} from "@/app/(dashboard)/_components/dashboard-ui";
import type { SourceListProps } from "@/types/agents/configs";

export function WebsiteCrawlForm({
  agentId,
  organizationId,
  isOrganizationPending,
}: SourceListProps) {
  const [url, setUrl] = useState("");
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);

  const createSourceMutation = useCreateWebsiteSource(organizationId, agentId);

  const ingestionQuery = useSourceIngestionStatus(
    organizationId,
    agentId,
    activeSourceId!,
  );

  const ingestionJob = ingestionQuery.data?.ingestionJob;
  const sourceStatus = ingestionQuery.data?.source.status;

  const status = ingestionJob?.status ?? sourceStatus;

  const isProcessing = status === "pending" || status === "processing";

  const progress = ingestionJob?.progress ?? 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUrl = url.trim();

    if (!normalizedUrl) return;

    try {
      const parsedUrl = new URL(normalizedUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Please enter a valid HTTP or HTTPS URL.");
      }

      const result = await createSourceMutation.mutateAsync({
        name: parsedUrl.hostname,
        url: parsedUrl.toString(),
      });

      setActiveSourceId(result.source.id);
      setUrl("");
    } catch (error) {
      // URL validation errors are handled here.
      // API errors are displayed through the mutation state.
      if (error instanceof TypeError) {
        return;
      }
    }
  }

  return (
    <Panel className="overflow-hidden">
      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Globe2 aria-hidden="true" className="size-4 text-[#718567]" />
          <h2 className="text-sm font-semibold text-[#27342b]">
            Website crawling
          </h2>
        </div>

        <p className="mt-1 text-xs text-[#879087]">
          Add a website and automatically extract its content into your
          knowledge base.
        </p>
      </div>

      <div className="border-t border-[#eff1ec] px-5 py-4 sm:px-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field id="scrape-url" label="Website URL">
            <Input
              className={inputClassName}
              id="scrape-url"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://docs.yourcompany.com"
              type="url"
              value={url}
            />
          </Field>

          <Button
            className="w-full rounded-xl"
            disabled={
              !url.trim() ||
              isOrganizationPending ||
              !organizationId ||
              createSourceMutation.isPending
            }
            type="submit"
          >
            {createSourceMutation.isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Starting crawl...
              </>
            ) : (
              <>
                <Play className="size-4" />
                Crawl website
              </>
            )}
          </Button>

          {createSourceMutation.isError && (
            <p className="text-xs text-[#a95140]" role="alert">
              {createSourceMutation.error.message}
            </p>
          )}
        </form>

        {/* Ingestion progress */}
        {activeSourceId && (
          <div
            aria-live="polite"
            className="mt-5 rounded-xl border border-[#eff1ec] bg-[#f8f9f6] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[#455047]">
                Website ingestion
              </p>

              {ingestionQuery.isPending ? (
                <LoaderCircle className="size-3.5 animate-spin text-[#718567]" />
              ) : (
                <span className="text-xs font-semibold text-[#718567]">
                  {status === "completed"
                    ? "Completed"
                    : status === "failed"
                      ? "Failed"
                      : status === "processing"
                        ? "Processing"
                        : "Pending"}
                </span>
              )}
            </div>

            {ingestionQuery.isError ? (
              <p className="mt-3 text-xs text-[#a95140]" role="alert">
                Unable to retrieve ingestion progress.
              </p>
            ) : (
              <>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-[#879087]">
                    {status === "completed"
                      ? "Website successfully processed."
                      : status === "failed"
                        ? "Website processing failed."
                        : status === "processing"
                          ? "Extracting and processing website content..."
                          : "Waiting for ingestion to start..."}
                  </p>

                  <span className="text-xs font-semibold tabular-nums text-[#536052]">
                    {progress}%
                  </span>
                </div>

                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8ece5]"
                  role="progressbar"
                  aria-label="Website ingestion progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[#718567] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {ingestionJob?.errorMessage && (
                  <p className="mt-3 text-xs text-[#a95140]" role="alert">
                    {ingestionJob.errorMessage}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
