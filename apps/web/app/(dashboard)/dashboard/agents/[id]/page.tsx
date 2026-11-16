"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { PageHeading } from "../../../_components/dashboard-ui";
import { seedAgents } from "../../../_components/mock-data";
import { AgentTabs } from "./_components/AgentTabs";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const agent = seedAgents.find((item) => item.id === id) ?? seedAgents[0];

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#788579] transition hover:text-[#405b35]"
        href="/dashboard/agents"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to agents
      </Link>
      <PageHeading
        eyebrow="Agent settings"
        title={agent.name}
        description={`${agent.description} · ${agent.website}`}
        action={
          <Badge className="h-auto gap-1.5 rounded-full border-0 bg-[#eff5e9] px-2.5 py-1.5 text-[10px] font-semibold text-[#67834d]">
            <span className="size-1.5 rounded-full bg-[#8ab45e]" />{" "}
            {agent.status}
          </Badge>
        }
      />
      <AgentTabs agent={agent} />
    </>
  );
}
