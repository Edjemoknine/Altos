import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#778675]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1d2a21] sm:text-[34px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#788278]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`dashboard-panel gap-0 rounded-2xl bg-white py-0 text-[#17221b] shadow-[0_2px_8px_rgba(23,34,27,0.025)] ring-1 ring-[#e7eae3] ${className}`}
    >
      {children}
    </Card>
  );
}

export function PanelHeading({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eff1ec] px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-sm font-semibold text-[#27342b]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-[#879087]">{description}</p>
        )}
      </div>
      {trailing}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={`h-10 rounded-xl bg-[#17221b] px-4 text-sm font-semibold text-white transition hover:bg-[#304536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8aaa55] ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={`h-9 rounded-xl border border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047] transition hover:border-[#cbd7c1] hover:bg-[#fafbf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8aaa55] ${className}`}
      variant="outline"
      {...props}
    >
      {children}
    </Button>
  );
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  trend?: string;
}) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#7b867c]">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#607b4b]">
          <Icon className="size-[17px]" strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-[#202c23]">
          {value}
        </span>
        {trend && (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#618c43]">
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-[#96a096]">{note}</p>
    </Panel>
  );
}

export function CreateAction({
  onClick,
  children = "Create new agent",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <PrimaryButton onClick={onClick} type="button">
      <Plus aria-hidden="true" className="size-4" />
      {children}
    </PrimaryButton>
  );
}

export function ChangeIndicator({ value }: { value: string }) {
  const positive = !value.startsWith("-");
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        positive ? "text-[#618c43]" : "text-[#bb694f]"
      }`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {value.replace(/^-/, "")}
    </span>
  );
}

export function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#435046]" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] leading-5 text-[#929b90]">{hint}</p>}
    </div>
  );
}

export const inputClassName =
  "h-10 w-full rounded-xl border border-[#e2e7de] bg-white px-3.5 text-sm text-[#28352b] outline-none transition placeholder:text-[#a0a99f] focus:border-[#90ac68] focus:ring-4 focus:ring-[#c5ef70]/20";

export const textareaClassName =
  "w-full rounded-xl border border-[#e2e7de] bg-white px-3.5 py-3 text-sm leading-6 text-[#28352b] outline-none transition placeholder:text-[#a0a99f] focus:border-[#90ac68] focus:ring-4 focus:ring-[#c5ef70]/20";
