"use client";

import { useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Progress } from "@repo/ui/components/progress";
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
import { TokenUsageChart } from "../../_components/token-usage-chart";

export default function UsagePage() {
  const [period, setPeriod] = useState("Last 30 days");

  return (
    <>
      <PageHeading
        eyebrow="Workspace analytics"
        title="Usage & analytics"
        description="Track your token consumption and understand how customers interact with your agents."
        action={
          <SecondaryButton
            onClick={() =>
              setPeriod(
                period === "Last 30 days" ? "This month" : "Last 30 days",
              )
            }
            type="button"
          >
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {period}
          </SecondaryButton>
        }
      />

      <Panel className="mb-5 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-xs font-semibold text-[#4a584c]">
              Free plan token usage
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-[26px] font-semibold tracking-tight text-[#202c23]">
                45,200
              </span>
              <span className="text-xs text-[#879087]">
                / 100,000 tokens this month
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <Badge className="h-auto rounded-full border-0 bg-[#f1f5ed] px-2.5 py-1 text-[10px] font-semibold text-[#63804b]">
              45.2% used
            </Badge>
            <p className="mt-2 text-[11px] text-[#939c92]">
              54,800 tokens remaining
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-6">
          <Progress
            aria-label="45.2% of monthly token allowance used"
            className="h-2.5 bg-[#edf0e9] [&>[data-slot=progress-indicator]]:rounded-full [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#a8d45d] [&>[data-slot=progress-indicator]]:to-[#bfdf77]"
            value={45.2}
          />
          <div className="mt-3 flex items-center justify-between text-[10px] text-[#a0a89e]">
            <span>Resets Nov 1, 2025</span>
            <span>100,000 token limit</span>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={MessageSquareText}
          label="Embedded widget calls"
          note="Customer website conversations"
          trend="+14.2%"
          value="1,284"
        />
        <MetricCard
          icon={Sparkles}
          label="Playground tests"
          note="Internal agent testing"
          trend="+6.4%"
          value="342"
        />
        <MetricCard
          icon={AudioLines}
          label="Audio transcriptions"
          note="Speech-to-text minutes"
          trend="+18.1%"
          value="86"
        />
        <MetricCard
          icon={Database}
          label="Vector embeddings"
          note="Knowledge base processing"
          value="2,460"
        />
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
          <div className="px-5 pb-5 pt-4 sm:px-6">
            <TokenUsageChart />
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeading
            title="Cost breakdown"
            description="Estimated spend by event type."
          />
          <div className="space-y-5 p-5 sm:p-6">
            {[
              {
                name: "Embedded widget",
                amount: "$5.42",
                share: 42,
                color: "bg-[#a8d45d]",
              },
              {
                name: "Audio transcription",
                amount: "$3.76",
                share: 29,
                color: "bg-[#c0b2dd]",
              },
              {
                name: "Playground tests",
                amount: "$2.44",
                share: 19,
                color: "bg-[#eac48f]",
              },
              {
                name: "Vector embeddings",
                amount: "$1.22",
                share: 10,
                color: "bg-[#a9cbd0]",
              },
            ].map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[#69756a]">{item.name}</span>
                  <span className="font-semibold tabular-nums text-[#39473b]">
                    {item.amount}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f2ed]">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.share}%` }}
                  />
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
          trailing={
            <Button
              className="h-auto px-0 text-xs font-semibold text-[#617d4b] hover:bg-transparent hover:text-[#344f2c]"
              variant="ghost"
              type="button"
              onClick={() =>
                window.alert(
                  "Usage export is available when your workspace is connected.",
                )
              }
            >
              Export CSV
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <Table className="min-w-[640px] text-left">
            <TableHeader>
              <TableRow className="border-0 bg-[#fbfcfa] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98a096] hover:bg-[#fbfcfa]">
                <TableHead className="px-6 py-3">Date</TableHead>
                <TableHead className="px-4 py-3">Event</TableHead>
                <TableHead className="px-4 py-3">Agent</TableHead>
                <TableHead className="px-4 py-3 text-right">Tokens</TableHead>
                <TableHead className="px-6 py-3 text-right">
                  Est. cost
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#f0f2ed]">
              {usageRows.map((row, index) => (
                <TableRow
                  className="border-[#f0f2ed] text-xs hover:bg-[#fbfcfa]"
                  key={`${row.event}-${row.date}-${index}`}
                >
                  <TableCell className="whitespace-nowrap px-6 py-3.5 text-[#879087]">
                    {row.date}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 font-medium text-[#465348]">
                    {row.event}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-[#7c877d]">
                    {row.agent}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right tabular-nums text-[#536052]">
                    {row.tokens}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right font-medium tabular-nums text-[#465348]">
                    {row.cost}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#a0a89e]">
        <Coins aria-hidden="true" className="size-3.5" /> Costs are estimates
        and may differ from your final invoice.
      </p>
    </>
  );
}
