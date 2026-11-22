"use client";

import {
  LoaderCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import type { SourceItemProps } from "@/types/agents/configs";
import {
  getSourceFileType,
  getSourceIcon,
  getSourceStatus,
  formatSourceDate,
} from "@/utils";

export function SourceItem({
  source,
  isRetrying,
  isDeleting,
  retryError,
  onRetry,
  onDelete,
}: SourceItemProps) {
  const SourceIcon = getSourceIcon(source);
  const status = getSourceStatus(source.status);
  const sourceName = source.originalFilename ?? source.name;

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#718567]">
        <SourceIcon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-semibold text-[#4d5b4e]"
          title={sourceName}
        >
          {sourceName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#879087]">
          <span>{getSourceFileType(source)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={source.createdAt}>
            Added {formatSourceDate(source.createdAt)}
          </time>
        </div>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
      >
        {status.label}
      </span>
      {source.status === "failed" && source.type === "file" && (
        <Button
          aria-label={`Retry processing ${sourceName}`}
          className="size-8 shrink-0 rounded-lg text-[#718567] hover:bg-[#f1f5ed] hover:text-[#536d43]"
          disabled={isRetrying || isDeleting}
          onClick={() => onRetry(source.id)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          {isRetrying ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin"
            />
          ) : (
            <RotateCcw aria-hidden="true" className="size-3.5" />
          )}
        </Button>
      )}
      <Button
        aria-label={`Delete ${sourceName}`}
        className="size-8 shrink-0 rounded-lg text-[#9b7771] hover:bg-[#fff1ee] hover:text-[#a94336]"
        disabled={isDeleting || isRetrying}
        onClick={() => onDelete(source)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {isDeleting ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-3.5 animate-spin"
          />
        ) : (
          <Trash2 aria-hidden="true" className="size-3.5" />
        )}
      </Button>
      {retryError && (
        <p
          aria-live="assertive"
          className="basis-full text-xs text-[#a95140]"
          role="alert"
        >
          {retryError}
        </p>
      )}
    </li>
  );
}
