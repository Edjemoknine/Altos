import { authClient } from "./auth-client";
import type { CreateOrganizationInput } from "@/types/organizations";
export { inviteOrganizationMember } from "@/services/organization.service";

export const createOrganizationClient = async (
  input: CreateOrganizationInput,
) => {
  const { data, error } = await authClient.organization.create(input);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
