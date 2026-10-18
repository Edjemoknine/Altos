"use client";

import { useState } from "react";
import {
  AudioLines,
  CalendarDays,
  Coins,
  Database,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import {
  MetricCard,
  PageHeading,
  Panel,
  PanelHeading,
  SecondaryButton,
} from "../../_components/dashboard-ui";
import { usageRows } from "../../_components/mock-data";

const chartValues = [38, 55, 44, 63, 49, 72, 58, 77, 61, 85, 69, 52, 75, 89, 66, 78, 57, 95, 73, 82, 60, 72, 88, 68, 91, 76, 62, 84, 70, 93];

export default function UsagePage() {
  const [period, setPeriod] = useState("Last 30 days");

  return (
    <>
      <PageHeading
        eyebrow="Workspace analytics"
        title="Usage & analytics"
        description="Track your token consumption and understand how customers interact with your agents."
        action={
          <SecondaryButton onClick={() => setPeriod(period === "Last 30 days" ? "This month" : "Last 30 days")} type="button">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {period}
          </SecondaryButton>
        }
      />

      <Panel className="mb-5 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-xs font-semibold text-[#4a584c]">Free plan token usage</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-[26px] font-semibold tracking-tight text-[#202c23]">45,200</span>
              <span className="text-xs text-[#879087]">/ 100,000 tokens this month</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="rounded-full bg-[#f1f5ed] px-2.5 py-1 text-[10px] font-semibold text-[#63804b]">45.2% used</span>
            <p className="mt-2 text-[11px] text-[#939c92]">54,800 tokens remaining</p>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-6">
          <div aria-label="45.2% of monthly token allowance used" className="h-2.5 overflow-hidden rounded-full bg-[#edf0e9]" role="progressbar" aria-valuemax={100000} aria-valuemin={0} aria-valuenow={45200}>
            <div className="h-full w-[45.2%] rounded-full bg-gradient-to-r from-[#a8d45d] to-[#bfdf77]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-[#a0a89e]">
            <span>Resets Nov 1, 2025</span>
            <span>100,000 token limit</span>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={MessageSquareText} label="Embedded widget calls" note="Customer website conversations" trend="+14.2%" value="1,284" />
        <MetricCard icon={Sparkles} label="Playground tests" note="Internal agent testing" trend="+6.4%" value="342" />
        <MetricCard icon={AudioLines} label="Audio transcriptions" note="Speech-to-text minutes" trend="+18.1%" value="86" />
        <MetricCard icon={Database} label="Vector embeddings" note="Knowledge base processing" value="2,460" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <Panel className="overflow-hidden">
          <PanelHeading
            title="Token consumption"
            description={`Daily usage over the ${period.toLowerCase()}.`}
            trailing={
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8c968b]">
                <span className="size-2 rounded-sm bg-[#a8d45d]" />
                Tokens
              </span>
            }
          />
          <div className="px-5 pb-5 pt-6 sm:px-6">
            <div className="relative flex h-48 items-end gap-1.5 border-b border-[#edf0e9] sm:gap-2">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-px">
                {[100, 75, 50, 25].map((value) => (
                  <div className="flex items-center border-t border-dashed border-[#eff1ec]" key={value}>
                    <span className="absolute -left-1 -translate-x-full pr-2 text-[9px] text-[#abb2a9]">{value}k</span>
                  </div>
                ))}
              </div>
              {chartValues.map((height, index) => (
                <div className="group relative z-[1] flex h-full flex-1 items-end" key={index}>
                  <div
                    aria-label={`${height * 120} tokens`}
                    className={`w-full rounded-t-[3px] transition-colors group-hover:bg-[#7fa447] ${
                      index === chartValues.length - 4 ? "bg-[#bfdc87]" : "bg-[#dcebc9]"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-[#17221b] px-2 py-1 text-[9px] text-white group-hover:block">
                    {(height * 120).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-[#a1aaa0]">
              <span>Sep 19</span><span>Sep 26</span><span>Oct 03</span><span>Oct 10</span><span>Oct 18</span>
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeading title="Cost breakdown" description="Estimated spend by event type." />
          <div className="space-y-5 p-5 sm:p-6">
            {[
              { name: "Embedded widget", amount: "$5.42", share: 42, color: "bg-[#a8d45d]" },
              { name: "Audio transcription", amount: "$3.76", share: 29, color: "bg-[#c0b2dd]" },
              { name: "Playground tests", amount: "$2.44", share: 19, color: "bg-[#eac48f]" },
              { name: "Vector embeddings", amount: "$1.22", share: 10, color: "bg-[#a9cbd0]" },
            ].map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[#69756a]">{item.name}</span>
                  <span className="font-semibold tabular-nums text-[#39473b]">{item.amount}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f2ed]">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[#eff1ec] pt-4 text-xs">
              <span className="text-[#69756a]">Total estimated cost</span>
              <span className="font-semibold text-[#26332a]">$12.84</span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mt-5 overflow-hidden">
        <PanelHeading
          title="Usage activity"
          description="Detailed usage events across your agents."
          trailing={<button className="text-xs font-semibold text-[#617d4b] hover:text-[#344f2c]" type="button" onClick={() => window.alert("Usage export is available when your workspace is connected.")}>Export CSV</button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="bg-[#fbfcfa] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98a096]">
                <th className="px-6 py-3">Date</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Agent</th><th className="px-4 py-3 text-right">Tokens</th><th className="px-6 py-3 text-right">Est. cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2ed]">
              {usageRows.map((row, index) => (
                <tr className="text-xs" key={`${row.event}-${row.date}-${index}`}>
                  <td className="whitespace-nowrap px-6 py-3.5 text-[#879087]">{row.date}</td>
                  <td className="px-4 py-3.5 font-medium text-[#465348]">{row.event}</td>
                  <td className="px-4 py-3.5 text-[#7c877d]">{row.agent}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-[#536052]">{row.tokens}</td>
                  <td className="px-6 py-3.5 text-right font-medium tabular-nums text-[#465348]">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#a0a89e]">
        <Coins aria-hidden="true" className="size-3.5" /> Costs are estimates and may differ from your final invoice.
      </p>
    </>
  );
}
