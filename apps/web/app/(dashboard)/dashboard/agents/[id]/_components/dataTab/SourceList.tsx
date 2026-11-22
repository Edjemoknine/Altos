"use client";

import { useState } from "react";
import { FileText, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  useAgentSources,
  useDeleteAgentSource,
  useRetryAgentSource,
  type AgentSource,
} from "@/services/agent/source.service";
import type { SourceListProps } from "@/types/agents/configs";
import { DeleteSourceDialog, type SourceToDelete } from "./DeleteSourceDialog";
import { SourceItem } from "./SourceItem";
import { Panel } from "@/app/(dashboard)/_components/dashboard-ui";

export function SourceList({
  agentId,
  isOrganizationPending,
  organizationId,
}: SourceListProps) {
  const sourcesQuery = useAgentSources(organizationId, agentId);
  const deleteSourceMutation = useDeleteAgentSource(organizationId, agentId);
  const retrySourceMutation = useRetryAgentSource(organizationId, agentId);
  const [sourceToDelete, setSourceToDelete] = useState<SourceToDelete | null>(
    null,
  );

  function requestDelete(source: AgentSource) {
    deleteSourceMutation.reset();
    setSourceToDelete({
      id: source.id,
      name: source.originalFilename ?? source.name,
    });
  }

  function retrySource(sourceId: string) {
    retrySourceMutation.reset();
    retrySourceMutation.mutate(sourceId);
  }

  function confirmDelete() {
    if (!sourceToDelete) return;

    deleteSourceMutation.mutate(sourceToDelete.id, {
      onSuccess: () => setSourceToDelete(null),
    });
  }

  return (
    <Panel className="overflow-hidden lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-[#27342b]">Sources</h2>
          <p className="mt-1 text-xs text-[#879087]">
            Files and websites attached to this agent.
          </p>
        </div>
        <Button
          aria-label="Refresh sources"
          className="rounded-xl border-[#e3e8df] bg-white px-3 text-xs font-semibold text-[#455047]"
          disabled={
            isOrganizationPending || !organizationId || sourcesQuery.isFetching
          }
          onClick={() => void sourcesQuery.refetch()}
          type="button"
          variant="outline"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-3.5 ${sourcesQuery.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="border-t border-[#eff1ec] px-5 py-4 sm:px-6">
        {isOrganizationPending ? (
          <div
            aria-label="Loading organization"
            className="space-y-3"
            role="status"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-[#eff1ec]" />
            <div className="h-10 animate-pulse rounded-xl bg-[#f7f8f5]" />
          </div>
        ) : !organizationId ? (
          <div className="rounded-xl bg-[#f8f9f6] px-4 py-5 text-center">
            <p className="text-xs font-semibold text-[#536052]">
              Select an organization
            </p>
            <p className="mt-1 text-xs text-[#879087]">
              Choose an organization to view this agent’s sources.
            </p>
          </div>
        ) : sourcesQuery.isPending ? (
          <div aria-label="Loading sources" className="space-y-3" role="status">
            <div className="flex items-center gap-2 text-xs text-[#879087]">
              <LoaderCircle
                aria-hidden="true"
                className="size-3.5 animate-spin"
              />
              Loading sources…
            </div>
            <div className="h-12 animate-pulse rounded-xl bg-[#f7f8f5]" />
            <div className="h-12 animate-pulse rounded-xl bg-[#f7f8f5]" />
          </div>
        ) : sourcesQuery.isError ? (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f0d7d1] bg-[#fff7f5] px-4 py-3"
            role="alert"
          >
            <p className="text-xs text-[#a95140]">
              Unable to load sources: {sourcesQuery.error.message}
            </p>
            <Button
              className="rounded-xl border-[#e3e8df] bg-white px-3 text-xs font-semibold text-[#455047]"
              onClick={() => void sourcesQuery.refetch()}
              type="button"
              variant="outline"
            >
              Try again
            </Button>
          </div>
        ) : sourcesQuery.data?.length ? (
          <ul className="divide-y divide-[#eff1ec]">
            {sourcesQuery.data.map((source) => (
              <SourceItem
                isDeleting={
                  deleteSourceMutation.isPending &&
                  deleteSourceMutation.variables === source.id
                }
                isRetrying={
                  retrySourceMutation.isPending &&
                  retrySourceMutation.variables === source.id
                }
                key={source.id}
                onDelete={requestDelete}
                onRetry={retrySource}
                retryError={
                  retrySourceMutation.isError &&
                  retrySourceMutation.variables === source.id
                    ? retrySourceMutation.error.message
                    : undefined
                }
                source={source}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-xl bg-[#f8f9f6] px-4 py-8 text-center">
            <FileText
              aria-hidden="true"
              className="mx-auto size-6 text-[#9aa398]"
            />
            <p className="mt-2 text-xs font-semibold text-[#536052]">
              No sources yet
            </p>
            <p className="mt-1 text-xs text-[#879087]">
              Add documents or websites to build this agent&apos;s knowledge
              base.
            </p>
          </div>
        )}
      </div>

      <DeleteSourceDialog
        error={
          deleteSourceMutation.isError
            ? deleteSourceMutation.error.message
            : undefined
        }
        isDeleting={deleteSourceMutation.isPending}
        onConfirm={confirmDelete}
        onOpenChange={(open) => {
          if (!open && !deleteSourceMutation.isPending) {
            setSourceToDelete(null);
            deleteSourceMutation.reset();
          }
        }}
        source={sourceToDelete}
      />
    </Panel>
  );
}
