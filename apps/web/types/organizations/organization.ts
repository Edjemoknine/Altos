import type { z } from "zod";
import type { createOrganizationSchema } from "@/schemas/organizations";

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>;
