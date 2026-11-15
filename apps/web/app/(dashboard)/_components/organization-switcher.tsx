"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { authClient } from "@/auth/auth-client";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { CreateOrganizationDialog } from "./create-organization-dialog";

type Organization = NonNullable<
  ReturnType<typeof authClient.useListOrganizations>["data"]
>[number];

export function OrganizationSwitcher({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const organizations = organizationsQuery.data ?? [];
  const activeOrganization = activeOrganizationQuery.data;
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function switchOrganization(organization: Organization) {
    if (organization.id === activeOrganization?.id) {
      setOpen(false);
      return;
    }

    setSwitchingId(organization.id);
    setError("");
    const result = await authClient.organization.setActive({
      organizationId: organization.id,
    });
    setSwitchingId(null);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setOpen(false);
    onNavigate?.();
  }

  return (
    <div className="relative">
      <Button
        aria-expanded={open}
        aria-haspopup="menu"
        className="h-auto w-full justify-start hover:bg-primary-foreground aria-expanded:bg-primary-foreground cursor-pointer gap-3 rounded-xl border border-white/10  px-3 py-2.5 text-left text-white "
        onClick={() => setOpen((current) => !current)}
        type="button"
        variant="ghost"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#c5ef70]/15 text-[#c5ef70]">
          <Building2 aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-white">
            {activeOrganization?.name ?? "Select organization"}
          </span>
          <span className="mt-0.5 block text-[10px] text-white/40">
            {organizationsQuery.isPending
              ? "Loading organizations..."
              : organizations.length === 1
                ? "1 organization"
                : `${organizations.length} organizations`}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className="size-4 text-white/40" />
      </Button>

      {open && (
        <div
          aria-label="Organization options"
          className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/10 bg-[#1a261e] p-2 shadow-xl"
          role="menu"
        >
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Switch organization
          </p>
          {organizationsQuery.isPending ? (
            <p className="px-2 py-2 text-xs text-white/55">
              Loading organizations...
            </p>
          ) : organizations.length ? (
            organizations.map((organization) => {
              const isActive = organization.id === activeOrganization?.id;

              return (
                <button
                  aria-current={isActive ? "true" : undefined}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-white/75 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
                  disabled={switchingId !== null}
                  key={organization.id}
                  onClick={() => void switchOrganization(organization)}
                  role="menuitem"
                  type="button"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/[0.07] text-[10px] font-semibold text-[#c5ef70]">
                    {organization.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {organization.name}
                  </span>
                  {isActive ? (
                    <Check
                      aria-label="Current organization"
                      className="size-3.5 text-[#c5ef70]"
                    />
                  ) : switchingId === organization.id ? (
                    <span className="text-[10px] text-white/40">
                      Switching...
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="px-2 py-2 text-xs text-white/50">
              You haven&apos;t joined an organization yet.
            </p>
          )}
          {organizationsQuery.error && (
            <p className="px-2 py-2 text-xs text-red-300" role="alert">
              Unable to load organizations.
            </p>
          )}
          {error && (
            <p className="px-2 py-2 text-xs text-red-300" role="alert">
              {error}
            </p>
          )}
          <div className="mt-1 border-t border-white/10 pt-1">
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium text-[#c5ef70] transition hover:bg-white/[0.07]"
              onClick={() => {
                setCreateOpen(true);
                setOpen(false);
              }}
              role="menuitem"
              type="button"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Create one
            </button>
            <Link
              className="block rounded-lg px-2 py-2 text-xs text-white/55 transition hover:bg-white/[0.07] hover:text-white"
              href="/dashboard/organizations"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              Manage organizations
            </Link>
          </div>
        </div>
      )}

      <CreateOrganizationDialog
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setError("");
          onNavigate?.();
        }}
        open={createOpen}
      />
    </div>
  );
}
