"use client";

import { useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Building2, Check, Plus } from "lucide-react";
import { authClient } from "@/auth/auth-client";
import { CreateOrganizationDialog } from "../../_components/create-organization-dialog";
import {
  PageHeading,
  Panel,
  PanelHeading,
  PrimaryButton,
} from "../../_components/dashboard-ui";

export default function OrganizationsPage() {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const organizations = organizationsQuery.data ?? [];
  const activeOrganization = activeOrganizationQuery.data;
  const [createOpen, setCreateOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function switchOrganization(organizationId: string) {
    setSwitchingId(organizationId);
    setError("");
    try {
      const result = await authClient.organization.setActive({ organizationId });

      if (result.error) {
        setError(
          result.error.message ?? "Unable to switch organizations. Please try again.",
        );
      }
    } catch {
      setError("Unable to switch organizations. Please try again.");
    } finally {
      setSwitchingId(null);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Workspace settings"
        title="Organizations"
        description="Manage the workspaces you belong to and choose which one to use."
        action={
          <PrimaryButton onClick={() => setCreateOpen(true)} type="button">
            <Plus aria-hidden="true" className="size-4" />
            Create organization
          </PrimaryButton>
        }
      />

      {error && (
        <p
          aria-live="assertive"
          className="mb-5 rounded-xl border border-[#f0d7d1] bg-[#fff7f5] px-4 py-3 text-xs text-[#a95140]"
          role="alert"
        >
          {error}
        </p>
      )}

      {organizationsQuery.error && (
        <Panel className="p-6">
          <p className="text-sm font-semibold text-[#344137]">
            Unable to load organizations
          </p>
          <p className="mt-1 text-xs text-[#879087]">
            Please refresh the page and try again.
          </p>
        </Panel>
      )}

      {!organizationsQuery.error && organizationsQuery.isPending && (
        <Panel className="p-6 text-sm text-[#879087]">
          Loading your organizations...
        </Panel>
      )}

      {!organizationsQuery.error &&
        !organizationsQuery.isPending &&
        organizations.length === 0 && (
          <Panel className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f0f4eb] text-[#607b4b]">
              <Building2 aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-[#344137]">
              No organizations yet
            </h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-[#879087]">
              Create an organization to bring your team and workspace together.
            </p>
            <PrimaryButton
              className="mt-5"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              Create organization
            </PrimaryButton>
          </Panel>
        )}

      {!organizationsQuery.error && organizations.length > 0 && (
        <Panel className="overflow-hidden">
          <PanelHeading
            title="Your organizations"
            description={`${organizations.length} ${
              organizations.length === 1 ? "workspace" : "workspaces"
            } available to your account.`}
          />
          <ul className="divide-y divide-[#eff1ec]">
            {organizations.map((organization) => {
              const isActive = organization.id === activeOrganization?.id;

              return (
                <li
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6"
                  key={organization.id}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f4eb] text-[#607b4b]">
                    <Building2 aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-[#344137]">
                        {organization.name}
                      </h2>
                      {isActive && (
                        <Badge className="h-auto gap-1 rounded-full border-0 bg-[#eff5e9] px-2 py-1 text-[10px] font-semibold text-[#64804b]">
                          <Check aria-hidden="true" className="size-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-[#879087]">
                      /{organization.slug}
                    </p>
                    <p className="mt-1 text-[10px] text-[#a0a89f]">
                      Created{" "}
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(organization.createdAt))}
                    </p>
                  </div>
                  {isActive ? (
                    <Button
                      className="h-9 shrink-0 rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#849084]"
                      disabled
                      type="button"
                      variant="outline"
                    >
                      Current workspace
                    </Button>
                  ) : (
                    <Button
                      className="h-9 shrink-0 rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047] hover:border-[#cbd7c1] hover:bg-[#fafbf8]"
                      disabled={switchingId !== null}
                      onClick={() => void switchOrganization(organization.id)}
                      type="button"
                      variant="outline"
                    >
                      {switchingId === organization.id
                        ? "Switching..."
                        : "Switch to organization"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {!organizationsQuery.error && organizations.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#e7eae3] bg-[#fbfcfa] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#344137]">
            Need another workspace?
          </h2>
          <p className="mt-1 text-xs text-[#879087]">
            Create a separate organization for another team or project.
          </p>
          <Button
            className="mt-4 h-9 rounded-xl border-[#e3e8df] bg-white px-3.5 text-xs font-semibold text-[#455047] hover:border-[#cbd7c1] hover:bg-[#fafbf8]"
            onClick={() => setCreateOpen(true)}
            type="button"
            variant="outline"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            Create organization
          </Button>
        </div>
      )}

      <CreateOrganizationDialog
        onClose={() => setCreateOpen(false)}
        open={createOpen}
      />
    </>
  );
}
