"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";

import {
  ArrowUpRight,
  Bot,
  Globe2,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { authClient } from "@/auth/auth-client";
import {
  type Agent,
  useAgents,
  useDeleteAgent,
} from "@/services/agent.service";
import { PageHeading, Panel } from "../../_components/dashboard-ui";
import { DeleteAgentDialog } from "../../_components/delete-agent";
import {
  formatCreatedDate,
  getAgentTone,
  getAgentWebsite,
  toneStyles,
} from "@/utils";
export default function AgentsPage() {
  const { data: activeOrganization, isPending: isOrganizationPending } =
    authClient.useActiveOrganization();
  const organizationId = activeOrganization?.id;
  const agentsQuery = useAgents(organizationId);
  const deleteAgentMutation = useDeleteAgent(organizationId);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [deleteError, setDeleteError] = useState("");

  function confirmDeleteAgent() {
    if (!organizationId || !agentToDelete) return;

    deleteAgentMutation.mutate(agentToDelete.id, {
      onSuccess: () => {
        toast.success(`Deleted "${agentToDelete.name}" successfully.`);
        setAgentToDelete(null);
        setDeleteError("");
      },
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Unable to delete the agent.",
        );
      },
    });
  }

  const agents = agentsQuery.data ?? [];
  const activeCount = agents.filter(
    (agent) => agent.status === "active",
  ).length;

  return (
    <>
      <PageHeading
        eyebrow="Workspace"
        title="Your agents"
        description="Create, customize, and manage the AI agents that support your customers."
        action={
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#17221b] px-4 text-sm font-semibold text-white transition hover:bg-[#304536]"
            href="/dashboard/agents/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Create new agent
          </Link>
        }
      />

      {isOrganizationPending ? (
        <Panel className="p-6 text-sm text-[#879087]">
          Loading your organization...
        </Panel>
      ) : !organizationId ? (
        <Panel className="p-6 text-sm text-[#879087]">
          Select an organization to view its agents.
        </Panel>
      ) : agentsQuery.isPending ? (
        <Panel className="p-6 text-sm text-[#879087]">Loading agents...</Panel>
      ) : agentsQuery.isError ? (
        <Panel className="flex flex-col items-start gap-3 p-6">
          <p className="text-sm font-semibold text-[#344137]">
            Unable to load agents
          </p>
          <p className="text-xs text-[#879087]">{agentsQuery.error.message}</p>
          <Button
            className="rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047]"
            onClick={() => void agentsQuery.refetch()}
            type="button"
            variant="outline"
          >
            Try again
          </Button>
        </Panel>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#849084]">
              <span className="font-semibold text-[#465348]">
                {agents.length} {agents.length === 1 ? "agent" : "agents"}
              </span>{" "}
              in {activeOrganization.name}
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] text-[#8d978b]">
              <span className="size-1.5 rounded-full bg-[#8ab45e]" />
              {activeCount} active
            </span>
          </div>

          {agents.length === 0 ? (
            <Panel className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f0f4eb] text-[#607b4b]">
                <Bot aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-4 text-sm font-semibold text-[#344137]">
                No agents yet
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[#879087]">
                Create your first agent to start answering customer questions.
              </p>
              <Link
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#17221b] px-4 text-sm font-semibold text-white transition hover:bg-[#304536]"
                href="/dashboard/agents/new"
              >
                <Plus aria-hidden="true" className="size-4" />
                Create new agent
              </Link>
            </Panel>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {agents.map((agent) => {
                const tone = getAgentTone(agent);
                const isActive = agent.status === "active";

                return (
                  <Panel
                    className="overflow-hidden transition hover:border-[#d7dfce] hover:shadow-[0_8px_24px_rgba(23,34,27,0.05)]"
                    key={agent.id}
                  >
                    <div className="flex items-start justify-between px-5 pt-5 sm:px-6 sm:pt-6">
                      <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#f0f4eb] text-[#5f7a4c]">
                        <Bot aria-hidden="true" className="size-5" />
                      </span>
                      <Button
                        aria-label={`More options for ${agent.name}`}
                        className="size-8 rounded-lg text-[#929b90] hover:bg-[#f4f6f1] hover:text-[#445146]"
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <MoreHorizontal aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                    <div className="px-5 pt-4 sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-lg font-semibold tracking-tight text-[#26332a]">
                          {agent.name}
                        </h2>
                        <Badge
                          className={`h-auto rounded-full border-0 px-2.5 py-1 text-[10px] font-medium ${toneStyles[tone]}`}
                        >
                          {tone}
                        </Badge>
                      </div>
                      <p className="mt-1.5 min-h-5 text-xs text-[#879087]">
                        {agent.description || "A helpful AI support agent."}
                      </p>
                      <div className="mt-5 space-y-3 border-t border-[#eff1ec] pt-4">
                        <div className="flex items-center gap-2.5 text-xs text-[#6f7b70]">
                          <Globe2
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-[#9aa397]"
                          />
                          <span className="truncate">
                            {getAgentWebsite(agent)}
                          </span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="ml-auto size-3.5 shrink-0 text-[#a4aca1]"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#969f95]">
                            Created {formatCreatedDate(agent.createdAt)}
                          </span>
                          <Badge
                            className={`h-auto gap-1.5 border-0 bg-transparent px-0 text-[10px] font-medium ${isActive ? "text-[#64854a]" : "text-[#a47b45]"}`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${isActive ? "bg-[#8ab45e]" : "bg-[#e0b165]"}`}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 border-t border-[#eff1ec] bg-[#fbfcfa] px-5 py-3.5 sm:px-6">
                      <Button
                        asChild
                        className="h-8 flex-1 rounded-lg bg-[#17221b] px-3 text-[11px] font-semibold text-white hover:bg-[#304536]"
                        size="sm"
                      >
                        <Link href={`/dashboard/agents/${agent.id}`}>
                          Manage{" "}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5"
                          />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="h-8 flex-1 rounded-lg border border-[#e2e7de] bg-white px-3 text-[11px] font-semibold text-[#536052] hover:bg-[#f5f7f3] hover:text-[#536052]"
                        size="sm"
                        variant="outline"
                      >
                        <Link href={`/dashboard/agents/${agent.id}?test=1`}>
                          <Sparkles aria-hidden="true" className="size-3.5" />{" "}
                          Test
                        </Link>
                      </Button>
                      <Button
                        aria-label={`Delete ${agent.name}`}
                        className="size-8 rounded-lg border border-[#eceee9] bg-white text-[#9b7771] hover:border-[#e7cfc9] hover:bg-[#fff8f6] hover:text-[#ab5748]"
                        disabled={deleteAgentMutation.isPending}
                        onClick={() => {
                          setDeleteError("");
                          setAgentToDelete(agent);
                        }}
                        size="icon-sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 aria-hidden="true" className="size-3.5" />
                      </Button>
                    </div>
                  </Panel>
                );
              })}
            </div>
          )}
        </>
      )}
      <DeleteAgentDialog
        agentName={agentToDelete?.name ?? null}
        error={deleteError}
        isDeleting={deleteAgentMutation.isPending}
        onConfirm={confirmDeleteAgent}
        onOpenChange={(open) => {
          if (!open) {
            setAgentToDelete(null);
            setDeleteError("");
          }
        }}
        open={agentToDelete !== null}
      />
    </>
  );
}
