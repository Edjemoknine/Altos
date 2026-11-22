"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/auth/auth-client";
import { PageHeading, Panel } from "../../../_components/dashboard-ui";
import { AgentTabs } from "./_components/AgentTabs";
import { useAgent } from "@/services/agent/agent.service";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: activeOrganization, isPending: isOrganizationPending } =
    authClient.useActiveOrganization();
  const agentQuery = useAgent(activeOrganization?.id, id);
  const agent = agentQuery.data;
  const website =
    typeof agent?.settings.website === "string"
      ? agent.settings.website.trim()
      : "";

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#788579] transition hover:text-[#405b35]"
        href="/dashboard/agents"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to agents
      </Link>

      {isOrganizationPending ? (
        <Panel className="p-6 text-sm text-[#879087]">
          Loading your organization...
        </Panel>
      ) : !activeOrganization?.id ? (
        <Panel className="p-6 text-sm text-[#879087]">
          Select an organization to view this agent.
        </Panel>
      ) : agentQuery.isPending ? (
        <Panel className="p-6 text-sm text-[#879087]">Loading agent...</Panel>
      ) : agentQuery.isError ? (
        <Panel className="flex flex-col items-start gap-3 p-6">
          <p className="text-sm font-semibold text-[#344137]">
            Unable to load this agent
          </p>
          <p className="text-xs text-[#879087]">{agentQuery.error.message}</p>
          <Button
            className="rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047]"
            onClick={() => void agentQuery.refetch()}
            type="button"
            variant="outline"
          >
            Try again
          </Button>
        </Panel>
      ) : !agent ? (
        <Panel className="p-6 text-sm text-[#879087]">
          This agent could not be found in the selected organization.
        </Panel>
      ) : (
        <>
          <PageHeading
            eyebrow="Agent settings"
            title={agent.name}
            description={[agent.description, website]
              .filter(Boolean)
              .join(" · ")}
            action={
              <Badge
                className={`h-auto gap-1.5 rounded-full border-0 px-2.5 py-1.5 text-[10px] font-semibold ${
                  agent.status === "active"
                    ? "bg-[#eff5e9] text-[#67834d]"
                    : "bg-[#f3f4f1] text-[#788579]"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    agent.status === "active" ? "bg-[#8ab45e]" : "bg-[#a2aaa0]"
                  }`}
                />{" "}
                {agent.status}
              </Badge>
            }
          />
          <AgentTabs agent={agent} />
        </>
      )}
    </>
  );
}
