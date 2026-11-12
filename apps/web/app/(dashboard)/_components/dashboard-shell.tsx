"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/auth/auth-client";
import { useSignOutMutation } from "@/auth/auth-mutations";
import {
  Activity,
  Bot,
  ChevronDown,
  Command,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Usage", href: "/dashboard/usage", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type SidebarContentProps = {
  onNavigate?: () => void;
  userInitials: string;
  userName: string;
  onSignOut: () => void;
  isSigningOut: boolean;
  signOutError?: string;
};

function SidebarContent({
  onNavigate,
  userInitials,
  userName,
  onSignOut,
  isSigningOut,
  signOutError,
}: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <>
      <Link
        aria-label="Altos home"
        className="flex items-center gap-3 px-3 py-2"
        href="/dashboard"
        onClick={onNavigate}
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#c5ef70] text-sm font-bold text-[#17221b]">
          A
        </span>
        <span className="font-heading text-xl font-semibold tracking-tight text-white">
          Altos
        </span>
        <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/40">
          BETA
        </span>
      </Link>

      <div className="mt-10 px-3">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Workspace
        </p>
        <Button className="h-auto w-full justify-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-white hover:bg-white/[0.08] hover:text-white" variant="outline">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#c5ef70]/15 text-xs font-semibold text-[#c5ef70]">
            AC
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-white">
              Acme Corporation
            </span>
            <span className="mt-0.5 block text-[10px] text-white/40">
              Free plan
            </span>
          </span>
          <ChevronDown aria-hidden="true" className="size-4 text-white/40" />
        </Button>
      </div>

      <nav aria-label="Dashboard navigation" className="mt-8 space-y-1 px-2">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Menu
        </p>
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[#c5ef70] text-[#17221b]"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              }`}
              href={href}
              key={href}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" className="size-[17px]" strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <div className="mb-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#c5ef70]/10 text-[#c5ef70]">
            <Zap aria-hidden="true" className="size-4" />
          </span>
          <p className="mt-3 text-xs font-semibold text-white">Need more room?</p>
          <p className="mt-1 text-[11px] leading-5 text-white/45">
            Upgrade your plan to unlock more conversations.
          </p>
          <Link
            className="mt-3 inline-flex text-xs font-semibold text-[#c5ef70] hover:text-[#d8f5a5]"
            href="/dashboard/settings"
            onClick={onNavigate}
          >
            Explore plans <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSigningOut}
          onClick={onSignOut}
          type="button"
        >
          <Command aria-hidden="true" className="size-[17px]" strokeWidth={1.8} />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
        {signOutError && (
          <p aria-live="assertive" className="px-3 text-xs text-red-300" role="alert">
            {signOutError}
          </p>
        )}
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const signOutMutation = useSignOutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const userName = session?.user.name || session?.user.email || "Account";
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!isPending && !error && !session) {
      router.replace("/sign-in");
    }
  }, [error, isPending, router, session]);

  useEffect(() => {
    setDarkMode(window.localStorage.getItem("altos-dashboard-theme") === "dark");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("altos-dashboard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] text-sm text-[#657067]">
        Loading your account...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f8f4] text-sm text-[#657067]">
        <p role="alert">Unable to load your account. Please try again.</p>
        <Button onClick={() => void refetch()} type="button" variant="outline">
          Retry
        </Button>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const sidebarProps = {
    userInitials,
    userName,
    onSignOut: () =>
      signOutMutation.mutate(undefined, {
        onSuccess: () => {
          router.replace("/sign-in");
          router.refresh();
        },
      }),
    isSigningOut: signOutMutation.isPending,
    signOutError: signOutMutation.error?.message,
  };

  return (
    <div
      className="min-h-screen bg-[#f7f8f4] text-[#17221b]"
      data-dashboard-theme={darkMode ? "dark" : "light"}
    >
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-white/5 bg-[#111b15] px-3 py-5 lg:flex">
        <SidebarContent {...sidebarProps} />
      </aside>

      <div className="min-h-screen lg:pl-[248px]">
        <header className="dashboard-header sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#e8ebe3] bg-[#f7f8f4]/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="size-9 rounded-lg border border-[#e2e6de] bg-white text-[#455047] lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              size="icon"
              type="button"
              variant="outline"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
            <div className="hidden items-center gap-2 text-xs text-[#8a9489] sm:flex">
              <span>Workspace</span>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-[#405044]">Acme Corporation</span>
            </div>
            <span className="text-sm font-semibold text-[#27342b] sm:hidden">
              Acme Corporation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
              className="size-9 rounded-full border border-[#e5e8e1] bg-white text-[#657166] transition hover:border-[#cad6bf] hover:text-[#3d503f]"
              onClick={() => setDarkMode(!darkMode)}
              size="icon"
              type="button"
              variant="outline"
            >
              {darkMode ? <Sun aria-hidden="true" className="size-4" /> : <Moon aria-hidden="true" className="size-4" />}
            </Button>
            <Badge className="hidden h-auto items-center gap-1.5 rounded-full border-[#e4e9df] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#637064] sm:inline-flex">
              <span className="size-1.5 rounded-full bg-[#8db552]" />
              All systems operational
            </Badge>
            <Button
              aria-label="Open account menu"
              className="h-auto items-center gap-2 rounded-full border border-[#e5e8e1] bg-white p-1 pr-2.5 transition hover:border-[#cad6bf]"
              variant="outline"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#dce9d0] text-[11px] font-semibold text-[#42613b]">
                {userInitials}
              </span>
              <span className="hidden text-xs font-medium text-[#344237] sm:block">
                {userName}
              </span>
              <ChevronDown aria-hidden="true" className="hidden size-3.5 text-[#899286] sm:block" />
            </Button>
          </div>
        </header>

        <main className="dashboard-main mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <>
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#111b15] px-3 py-5 shadow-2xl lg:hidden">
            <SidebarContent
              {...sidebarProps}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}
