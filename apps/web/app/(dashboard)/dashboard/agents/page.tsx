"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Globe2, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import {
  CreateAction,
  PageHeading,
  Panel,
} from "../../_components/dashboard-ui";
import { CreateAgentDialog } from "../../_components/create-agent-dialog";
import { seedAgents, type Agent } from "../../_components/mock-data";

const toneStyles: Record<Agent["tone"], string> = {
  Professional: "bg-[#eef1f8] text-[#677493]",
  Friendly: "bg-[#eff5e9] text-[#67834d]",
  Casual: "bg-[#f9f1e7] text-[#aa7b4c]",
  Empathic: "bg-[#f5edf4] text-[#9a6f91]",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");

  function removeAgent(agent: Agent) {
    if (!window.confirm(`Delete "${agent.name}"? This demo action removes it from the list.`)) return;
    setAgents((current) => current.filter((item) => item.id !== agent.id));
    setNotice(`${agent.name} was removed from this demo workspace.`);
  }

  return (
    <>
      <PageHeading
        eyebrow="Workspace"
        title="Your agents"
        description="Create, customize, and manage the AI agents that support your customers."
        action={<CreateAction onClick={() => setCreateOpen(true)} />}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#849084]">
          <span className="font-semibold text-[#465348]">{agents.length} agents</span> in your workspace
        </p>
        <span className="inline-flex items-center gap-2 text-[11px] text-[#8d978b]">
          <span className="size-1.5 rounded-full bg-[#8ab45e]" />
          {agents.filter((agent) => agent.status === "Active").length} active
        </span>
      </div>
      {notice && (
        <p aria-live="polite" className="mb-4 rounded-xl border border-[#dce8d1] bg-[#f1f7eb] px-4 py-3 text-xs text-[#54703e]">
          {notice}
        </p>
      )}
      {agents.length === 0 ? (
        <Panel className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f0f4eb] text-[#607b4b]">
            <Bot className="size-6" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-[#344137]">No agents yet</h2>
          <p className="mt-1 max-w-sm text-xs leading-5 text-[#879087]">Create your first agent to start answering customer questions.</p>
          <div className="mt-5">
            <CreateAction onClick={() => setCreateOpen(true)} />
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {agents.map((agent) => (
            <Panel className="overflow-hidden transition hover:border-[#d7dfce] hover:shadow-[0_8px_24px_rgba(23,34,27,0.05)]" key={agent.id}>
              <div className="flex items-start justify-between px-5 pt-5 sm:px-6 sm:pt-6">
                <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#f0f4eb] text-[#5f7a4c]">
                  <Bot aria-hidden="true" className="size-5" />
                </span>
                <button aria-label={`More options for ${agent.name}`} className="flex size-8 items-center justify-center rounded-lg text-[#929b90] hover:bg-[#f4f6f1] hover:text-[#445146]">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
              <div className="px-5 pt-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-[#26332a]">{agent.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${toneStyles[agent.tone]}`}>{agent.tone}</span>
                </div>
                <p className="mt-1.5 min-h-5 text-xs text-[#879087]">{agent.description || "A helpful AI support agent."}</p>
                <div className="mt-5 space-y-3 border-t border-[#eff1ec] pt-4">
                  <div className="flex items-center gap-2.5 text-xs text-[#6f7b70]">
                    <Globe2 aria-hidden="true" className="size-3.5 text-[#9aa397]" />
                    <span className="truncate">{agent.website}</span>
                    <ArrowUpRight aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-[#a4aca1]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#969f95]">Created {agent.createdAt}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${agent.status === "Active" ? "text-[#64854a]" : "text-[#a47b45]"}`}>
                      <span className={`size-1.5 rounded-full ${agent.status === "Active" ? "bg-[#8ab45e]" : "bg-[#e0b165]"}`} />
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-[#eff1ec] bg-[#fbfcfa] px-5 py-3.5 sm:px-6">
                <Link className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#17221b] px-3 text-[11px] font-semibold text-white transition hover:bg-[#304536]" href={`/dashboard/agents/${agent.id}`}>
                  Manage <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </Link>
                <Link className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e2e7de] bg-white px-3 text-[11px] font-semibold text-[#536052] transition hover:bg-[#f5f7f3]" href={`/dashboard/agents/${agent.id}?test=1`}>
                  <Sparkles aria-hidden="true" className="size-3.5" /> Test
                </Link>
                <button aria-label={`Delete ${agent.name}`} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#eceee9] bg-white text-[#9b7771] transition hover:border-[#e7cfc9] hover:bg-[#fff8f6] hover:text-[#ab5748]" onClick={() => removeAgent(agent)} type="button">
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}
      <CreateAgentDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(agent) => {
          setAgents((current) => [agent, ...current]);
          setNotice(`${agent.name} was created and is ready for setup.`);
        }}
      />
    </>
  );
}
