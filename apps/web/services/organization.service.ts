import { authClient } from "@/auth/auth-client";

function throwIfError(error: { message?: string } | null) {
  if (error) {
    throw new Error(error.message ?? "The organization request failed.");
  }
}

export async function inviteOrganizationMember(
  email: string,
  organizationId: string,
) {
  const { data, error } = await authClient.organization.inviteMember({
    email,
    role: "member",
    organizationId,
  });

  throwIfError(error);
  if (!data) {
    throw new Error("The organization invitation was not created.");
  }
  return data;
}

export async function listOrganizationMembers(organizationId: string) {
  const { data, error } = await authClient.organization.listMembers({
    query: { organizationId },
  });

  throwIfError(error);
  if (!data) {
    throw new Error("No organization members were returned.");
  }
  return data;
}

export async function listOrganizationInvitations(organizationId: string) {
  const { data, error } = await authClient.organization.listInvitations({
    query: { organizationId },
  });

  throwIfError(error);
  if (!data) {
    throw new Error("No organization invitations were returned.");
  }
  return data;
}

export async function cancelOrganizationInvitation(invitationId: string) {
  const { data, error } = await authClient.organization.cancelInvitation({
    invitationId,
  });

  throwIfError(error);
  return data;
}

export async function acceptOrganizationInvitation(invitationId: string) {
  const { data, error } = await authClient.organization.acceptInvitation({
    invitationId,
  });

  throwIfError(error);
  if (!data) {
    throw new Error("The invitation could not be accepted.");
  }
  return data;
}

export async function rejectOrganizationInvitation(invitationId: string) {
  const { data, error } = await authClient.organization.rejectInvitation({
    invitationId,
  });

  throwIfError(error);
  if (!data) {
    throw new Error("The invitation could not be declined.");
  }
  return data;
}

export async function getOrganizationInvitation(invitationId: string) {
  const { data, error } = await authClient.organization.getInvitation({
    query: { id: invitationId },
  });

  throwIfError(error);
  if (!data) {
    throw new Error("This invitation could not be found or has expired.");
  }
  return data;
}
