import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Enter an organization name.").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter an organization URL slug.")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens.",
    ),
});
