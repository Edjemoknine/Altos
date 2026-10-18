"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Coins,
  MessageSquareText,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  CreateAction,
  MetricCard,
  PageHeading,
  Panel,
  PanelHeading,
} from "../_components/dashboard-ui";
import { CreateAgentDialog } from "../_components/create-agent-dialog";
import { activityRows, seedAgents, type Agent } from "../_components/mock-data";

const modes = [
  { title: "Text chat", icon: MessageSquareText, color: "text-[#607b4b] bg-[#eef4e8]" },
  { title: "Audio stream", icon: Volume2, color: "text-[#7b6a9a] bg-[#f2eef8]" },
  { title: "Website crawler", icon: Activity, color: "text-[#b17a47] bg-[#fbf2e9]" },
];

export default function DashboardOverviewPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>(seedAgents);

  function addAgent(agent: Agent) {
    setAgents((current) => [agent, ...current]);
  }

  return (
    <>
      <PageHeading
        eyebrow="Saturday, October 18, 2025"
        title="Good morning, Jordan"
        description="Here’s what’s happening with your AI support workspace today."
        action={<CreateAction onClick={() => setCreateOpen(true)} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Bot}
          label="Active agents"
          note="Across your workspace"
          trend="+1 this month"
          value={String(agents.filter((agent) => agent.status === "Active").length)}
        />
        <MetricCard
          icon={Sparkles}
          label="Tokens consumed"
          note="This billing period"
          trend="+12.8%"
          value="45.2K"
        />
        <MetricCard
          icon={Coins}
          label="Usage cost"
          note="Estimated this month"
          trend="+8.2%"
          value="$12.84"
        />
        <MetricCard
          icon={Activity}
          label="Active plan"
          note="45% of your monthly limit"
          value="Free"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <Panel className="overflow-hidden">
          <PanelHeading
            title="Recent activity"
            description="A live view of your agents’ latest work."
            trailing={
              <span className="flex items-center gap-1.5 rounded-full bg-[#eff5e9] px-2.5 py-1 text-[10px] font-semibold text-[#608244]">
                <span className="size-1.5 rounded-full bg-[#83aa58]" />
                Live
              </span>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="bg-[#fbfcfa] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98a096]">
                  <th className="px-6 py-3">Agent / activity</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2ed]">
                {activityRows.map((row, index) => {
                  const type = modes.find((mode) => mode.title === row.mode) ?? {
                    title: "Text chat",
                    icon: MessageSquareText,
                    color: "text-[#607b4b] bg-[#eef4e8]",
                  };
                  const Icon = type.icon;
                  return (
                    <tr className="text-xs" key={`${row.agent}-${row.time}`}>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-[#344137]">{row.agent}</div>
                        <div className="mt-1 text-[10px] text-[#99a198]">{row.detail}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-[#647064]">
                          <span className={`flex size-7 items-center justify-center rounded-lg ${type.color}`}>
                            <Icon aria-hidden="true" className="size-3.5" />
                          </span>
                          {row.mode}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[#879087]">{row.time}</td>
                      <td className="px-4 py-3.5 text-right font-medium tabular-nums text-[#455147]">
                        {row.tokens}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                          index === 3 ? "bg-[#f4f1e8] text-[#9b8046]" : "bg-[#eff5e9] text-[#66874d]"
                        }`}>
                          {index === 3 ? "Processing" : row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#eff1ec] px-6 py-3.5">
            <span className="text-[11px] text-[#96a096]">Showing your latest agent events</span>
            <Link className="inline-flex items-center gap-1 text-xs font-semibold text-[#52703e] hover:text-[#344f2c]" href="/dashboard/usage">
              View usage <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <PanelHeading title="Usage this month" description="Your free plan resets on Nov 1." />
            <div className="p-5 sm:p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tracking-tight text-[#202c23]">45,200</span>
                <span className="text-xs text-[#8c968b]">of 100,000 tokens</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf0e9]">
                <div className="h-full w-[45.2%] rounded-full bg-[#a8d45d]" />
              </div>
              <p className="mt-3 text-[11px] text-[#929b90]">54,800 tokens remaining</p>
              <Link className="mt-5 flex h-10 items-center justify-center rounded-xl border border-[#dfe7d6] bg-[#f6f9f2] text-xs font-semibold text-[#506d3c] transition hover:bg-[#edf4e5]" href="/dashboard/usage">
                See usage details
              </Link>
            </div>
          </Panel>
          <Panel className="overflow-hidden">
            <PanelHeading
              title="Your agents"
              trailing={<Link className="text-xs font-semibold text-[#617d4b] hover:text-[#344f2c]" href="/dashboard/agents">View all</Link>}
            />
            <div className="divide-y divide-[#f0f2ed]">
              {agents.slice(0, 3).map((agent) => (
                <Link className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#fbfcfa] sm:px-6" href={`/dashboard/agents/${agent.id}`} key={agent.id}>
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f4eb] text-[#607b4b]">
                    <Bot aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-[#354238]">{agent.name}</span>
                    <span className="mt-1 block truncate text-[10px] text-[#939c92]">{agent.website}</span>
                  </span>
                  <span className={`size-2 rounded-full ${agent.status === "Active" ? "bg-[#88b15b]" : "bg-[#e0b165]"}`} title={agent.status} />
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      <CreateAgentDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addAgent} />
    </>
  );
}
