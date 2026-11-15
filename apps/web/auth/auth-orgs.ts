import { authClient } from "./auth-client";

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
