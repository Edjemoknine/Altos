import { authClient } from "./auth-client";
export { inviteOrganizationMember } from "@/services/organization.service";

export type CreateOrganizationInput = {
  name: string;
  slug: string;
};

export const createOrganizationClient = async (
  input: CreateOrganizationInput,
) => {
  const { data, error } = await authClient.organization.create(input);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
