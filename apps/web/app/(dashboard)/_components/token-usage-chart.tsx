"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  XAxis,
  YAxis,
} from "@repo/ui/components/chart";

const usageValues = [
  38, 55, 44, 63, 49, 72, 58, 77, 61, 85, 69, 52, 75, 89, 66, 78, 57, 95, 73,
  82, 60, 72, 88, 68, 91, 76, 62, 84, 70, 93,
];

const chartData = usageValues.map((value, index) => {
  const date = new Date(Date.UTC(2025, 8, 19 + index));
  return {
    date: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date),
    tokens: value * 1000,
  };
});

const chartConfig = {
  tokens: {
    label: "Tokens",
    color: "#a8d45d",
  },
} satisfies ChartConfig;

export function TokenUsageChart() {
  return (
    <ChartContainer
      aria-label="Daily token consumption over the last 30 days"
      className="h-[220px] w-full aspect-auto"
      config={chartConfig}
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          dataKey="date"
          interval={6}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          domain={[0, 100000]}
          tickFormatter={(value: number) => `${value / 1000}k`}
          tickLine={false}
          tickMargin={8}
          ticks={[0, 25000, 50000, 75000, 100000]}
          width={42}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${Number(value).toLocaleString()} tokens`}
            />
          }
          cursor={{ fill: "#edf2e8", opacity: 0.55 }}
        />
        <Bar
          dataKey="tokens"
          fill="var(--color-tokens)"
          maxBarSize={20}
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
