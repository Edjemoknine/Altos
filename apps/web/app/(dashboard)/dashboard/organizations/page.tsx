"use client";

import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Building2, Check, MailPlus, Plus, Users } from "lucide-react";
import { authClient } from "@/auth/auth-client";
import {
  cancelOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
} from "@/services/organization.service";
import { CreateOrganizationDialog } from "../../_components/create-organization-dialog";
import { InviteMemberForm } from "../../_components/invite-member-form";
import {
  PageHeading,
  Panel,
  PanelHeading,
  PrimaryButton,
} from "../../_components/dashboard-ui";

type OrganizationTab = "organizations" | "members" | "invitations";

const tabs: { id: OrganizationTab; label: string }[] = [
  { id: "organizations", label: "Organizations" },
  { id: "members", label: "Members" },
  { id: "invitations", label: "Invitations" },
];

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function OrganizationsPage() {
  const organizationsQuery = authClient.useListOrganizations();
  const activeOrganizationQuery = authClient.useActiveOrganization();
  const organizations = organizationsQuery.data ?? [];
  const activeOrganization = activeOrganizationQuery.data;
  const organizationId = activeOrganization?.id;
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OrganizationTab>("organizations");
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [members, setMembers] = useState<
    NonNullable<Awaited<ReturnType<typeof listOrganizationMembers>>>["members"]
  >([]);
  const [invitations, setInvitations] = useState<
    NonNullable<Awaited<ReturnType<typeof listOrganizationInvitations>>>
  >([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [invitationsError, setInvitationsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancelingInvitationId, setCancelingInvitationId] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (activeTab !== "members" || !organizationId) return;

    let cancelled = false;
    setMembersLoading(true);
    setMembersError("");

    void listOrganizationMembers(organizationId)
      .then((result) => {
        if (!cancelled) setMembers(result.members);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMembersError(
            error instanceof Error
              ? error.message
              : "Unable to load organization members.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, organizationId, refreshKey]);

  useEffect(() => {
    if (activeTab !== "invitations" || !organizationId) return;

    let cancelled = false;
    setInvitationsLoading(true);
    setInvitationsError("");

    void listOrganizationInvitations(organizationId)
      .then((result) => {
        if (!cancelled) setInvitations(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setInvitationsError(
            error instanceof Error
              ? error.message
              : "Unable to load invitations.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setInvitationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, organizationId, refreshKey]);

  async function switchOrganization(nextOrganizationId: string) {
    setSwitchingId(nextOrganizationId);
    setActionError("");

    try {
      const result = await authClient.organization.setActive({
        organizationId: nextOrganizationId,
      });

      if (result.error) {
        setActionError(
          result.error.message ??
            "Unable to switch organizations. Please try again.",
        );
      }
    } catch {
      setActionError("Unable to switch organizations. Please try again.");
    } finally {
      setSwitchingId(null);
    }
  }

  async function cancelInvitation(invitationId: string) {
    setCancelingInvitationId(invitationId);
    setInvitationsError("");

    try {
      await cancelOrganizationInvitation(invitationId);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setInvitationsError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this invitation.",
      );
    } finally {
      setCancelingInvitationId(null);
    }
  }

  const tabCounts: Partial<Record<OrganizationTab, number>> = {
    organizations: organizations.length,
    members: members.length,
    invitations: invitations.filter(
      (invitation) => invitation.status === "pending",
    ).length,
  };

  return (
    <>
      <PageHeading
        eyebrow="Workspace settings"
        title="Organizations"
        description="Manage your workspaces, team members, and invitations."
        action={
          <PrimaryButton onClick={() => setCreateOpen(true)} type="button">
            <Plus aria-hidden="true" className="size-4" />
            Create organization
          </PrimaryButton>
        }
      />

      {actionError && (
        <p
          aria-live="assertive"
          className="mb-5 rounded-xl border border-[#f0d7d1] bg-[#fff7f5] px-4 py-3 text-xs text-[#a95140]"
          role="alert"
        >
          {actionError}
        </p>
      )}

      <div
        aria-label="Organization management"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e5e9e1]"
        role="tablist"
      >
        {tabs.map(({ id, label }) => (
          <button
            aria-controls={`${id}-panel`}
            aria-selected={activeTab === id}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === id
                ? "border-[#789951] text-[#3d5835]"
                : "border-transparent text-[#879087] hover:text-[#455047]"
            }`}
            id={`${id}-tab`}
            key={id}
            onClick={() => setActiveTab(id)}
            role="tab"
            type="button"
          >
            {label}
            {tabCounts[id] !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === id
                    ? "bg-[#eff5e9] text-[#64804b]"
                    : "bg-[#f0f2ed] text-[#879087]"
                }`}
              >
                {tabCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`${activeTab}-tab`}
        className="space-y-5"
        id={`${activeTab}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab === "organizations" && (
          <>
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
                    Create an organization to bring your team and workspace
                    together.
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
                                <Check
                                  aria-hidden="true"
                                  className="size-3"
                                />
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-[#879087]">
                            /{organization.slug}
                          </p>
                          <p className="mt-1 text-[10px] text-[#a0a89f]">
                            Created {formatDate(organization.createdAt)}
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
                            onClick={() =>
                              void switchOrganization(organization.id)
                            }
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
          </>
        )}

        {activeTab === "members" && (
          <>
            {!organizationId ? (
              <Panel className="p-6 text-sm text-[#879087]">
                Select or create an organization to manage its members.
              </Panel>
            ) : (
              <>
                <Panel className="overflow-hidden">
                  <PanelHeading
                    title="Organization members"
                    description={`People who belong to ${activeOrganization?.name ?? "this organization"}.`}
                    trailing={
                      <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#607b4b]">
                        <Users aria-hidden="true" className="size-4" />
                      </span>
                    }
                  />
                  {membersError && (
                    <p className="px-5 py-4 text-xs text-[#a95140]" role="alert">
                      {membersError}
                    </p>
                  )}
                  {membersLoading ? (
                    <p className="px-5 py-6 text-xs text-[#879087]">
                      Loading members...
                    </p>
                  ) : !membersError && members.length === 0 ? (
                    <p className="px-5 py-6 text-xs text-[#879087]">
                      No members found for this organization.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#eff1ec]">
                      {members.map((member) => (
                        <li
                          className="flex items-center gap-3 px-5 py-4 sm:px-6"
                          key={member.id}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#dce9d0] text-xs font-semibold text-[#42613b]">
                            {member.user.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-[#344137]">
                              {member.user.name}
                            </p>
                            <p className="truncate text-[11px] text-[#879087]">
                              {member.user.email}
                            </p>
                          </div>
                          <Badge className="h-auto rounded-full border-0 bg-[#f1f3ef] px-2.5 py-1 text-[10px] font-medium capitalize text-[#697568]">
                            {member.role}
                          </Badge>
                          <span className="hidden text-[10px] text-[#a0a89f] sm:block">
                            Joined {formatDate(member.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
                <Panel className="p-5 sm:p-6">
                  <InviteMemberForm
                    onInvited={() => {
                      setActiveTab("invitations");
                      setRefreshKey((key) => key + 1);
                    }}
                    organizationId={organizationId}
                  />
                </Panel>
              </>
            )}
          </>
        )}

        {activeTab === "invitations" && (
          <>
            {!organizationId ? (
              <Panel className="p-6 text-sm text-[#879087]">
                Select or create an organization to manage its invitations.
              </Panel>
            ) : (
              <>
                <Panel className="overflow-hidden">
                  <PanelHeading
                    title="Pending invitations"
                    description={`Invitations sent from ${activeOrganization?.name ?? "this organization"}.`}
                    trailing={
                      <span className="flex size-9 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#607b4b]">
                        <MailPlus aria-hidden="true" className="size-4" />
                      </span>
                    }
                  />
                  {invitationsError && (
                    <p className="px-5 py-4 text-xs text-[#a95140]" role="alert">
                      {invitationsError}
                    </p>
                  )}
                  {invitationsLoading ? (
                    <p className="px-5 py-6 text-xs text-[#879087]">
                      Loading invitations...
                    </p>
                  ) : !invitationsError && invitations.length === 0 ? (
                    <p className="px-5 py-6 text-xs text-[#879087]">
                      No invitations have been sent yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#eff1ec]">
                      {invitations.map((invitation) => {
                        const isPending = invitation.status === "pending";

                        return (
                          <li
                            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                            key={invitation.id}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-[#344137]">
                                {invitation.email}
                              </p>
                              <p className="mt-1 text-[11px] text-[#879087]">
                                Invited {formatDate(invitation.createdAt)}
                                {isPending &&
                                  ` · Expires ${formatDate(invitation.expiresAt)}`}
                              </p>
                            </div>
                            <Badge
                              className={`h-auto w-fit rounded-full border-0 px-2.5 py-1 text-[10px] font-medium capitalize ${
                                isPending
                                  ? "bg-[#fff4e5] text-[#a2763d]"
                                  : "bg-[#f1f3ef] text-[#697568]"
                              }`}
                            >
                              {invitation.status}
                            </Badge>
                            {isPending && (
                              <Button
                                className="h-8 shrink-0 rounded-lg border border-[#eceee9] bg-white px-3 text-[11px] font-semibold text-[#9b5b4f] hover:border-[#e7cfc9] hover:bg-[#fff8f6]"
                                disabled={cancelingInvitationId !== null}
                                onClick={() =>
                                  void cancelInvitation(invitation.id)
                                }
                                type="button"
                                variant="outline"
                              >
                                {cancelingInvitationId === invitation.id
                                  ? "Canceling..."
                                  : "Cancel invitation"}
                              </Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Panel>
                <Panel className="p-5 sm:p-6">
                  <InviteMemberForm
                    onInvited={() => setRefreshKey((key) => key + 1)}
                    organizationId={organizationId}
                  />
                </Panel>
              </>
            )}
          </>
        )}
      </section>

      <CreateOrganizationDialog
        onClose={() => setCreateOpen(false)}
        open={createOpen}
      />
    </>
  );
}
