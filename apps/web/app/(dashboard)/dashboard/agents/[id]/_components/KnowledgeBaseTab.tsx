"use client";

import { useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Bot,
  Check,
  FileText,
  Globe2,
  Play,
  Upload,
} from "lucide-react";
import { Input } from "@repo/ui/components/input";
import {
  Field,
  inputClassName,
  Panel,
  PrimaryButton,
} from "../../../../_components/dashboard-ui";
import { scrapeWebsiteSchema, textFileSchema } from "@/schemas/agents";
import type { ScrapeWebsiteFormValues } from "@/types/agents";

export function KnowledgeBaseTab() {
  const [scrapeStatus, setScrapeStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileStatus, setFileStatus] = useState("");
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

  function addDocument(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const result = textFileSchema.safeParse(file);
    if (!result.success) {
      setFileName("");
      setFileStatus(result.error.issues[0]?.message ?? "Invalid document.");
      input.value = "";
      return;
    }

    setFileName(file.name);
    setFileStatus("Processing document…");
    window.setTimeout(
      () => setFileStatus("Ready · document processed in this demo."),
      900,
    );
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
            Upload a text document
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#879087]">
            Add a plain-text document to your agent’s knowledge base.
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#dce3d7] bg-[#fbfcfa] px-4 text-center transition hover:border-[#a8be91] hover:bg-[#f8faf5]">
            <Input
              accept=".txt,text/plain"
              className="sr-only"
              onChange={addDocument}
              type="file"
            />
            <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#7c8c73] shadow-sm">
              <Upload className="size-4" />
            </span>
            <span className="mt-2 text-xs font-semibold text-[#536052]">
              Choose a .txt file
            </span>
            <span className="mt-1 text-[10px] text-[#9aa398]">
              Plain text documents only
            </span>
          </label>
          {fileName && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#edf0e9] px-3 py-2.5">
              <FileText className="size-4 text-[#7b896f]" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#4d5b4e]">
                {fileName}
              </span>
              {fileStatus.startsWith("Ready") ? (
                <Check className="size-4 text-[#78a050]" />
              ) : (
                <span className="size-3 animate-spin rounded-full border-2 border-[#dbe4d1] border-t-[#7c9f57]" />
              )}
            </div>
          )}
          {fileStatus && (
            <p
              aria-live="polite"
              className={`mt-2 text-[11px] ${fileStatus.startsWith("Only") ? "text-[#b75d47]" : "text-[#63804b]"}`}
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
              Indexed sources
            </h2>
            <p className="mt-1 text-xs text-[#879087]">
              Sources currently attached to this agent.
            </p>
          </div>
        </div>
        <div className="border-t border-[#eff1ec] px-5 py-4 text-xs text-[#929b90] sm:px-6">
          No sources have been indexed yet.
        </div>
      </Panel>
    </div>
  );
}
