import { authClient } from "./auth-client";

export const createOrganizationClient = async () => {
  try {
    const { data, error } = await authClient.organization.create({
      name: "Acme Corporation",
      slug: "acme-corporation",
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
