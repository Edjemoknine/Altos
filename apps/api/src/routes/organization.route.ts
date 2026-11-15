import { Hono } from "hono";

import {
  requireAuth,
  requireOrganizationRole,
} from "../middlewares/organization.middleware.ts";

const organizationRoutes = new Hono();

organizationRoutes.get(
  "/:organizationId/agents",
  requireAuth,
  requireOrganizationRole(["owner", "member"]),
  async (c) => {
    const membership = c.get("organizationMembership");

    return c.json({
      message: "Authorized",
      organizationId: membership.organizationId,
    });
  },
);

organizationRoutes.post(
  "/:organizationId/agents",
  requireAuth,
  requireOrganizationRole(["owner"]),
  async (c) => {
    return c.json({
      message: "Agent creation authorized",
    });
  },
);

export default organizationRoutes;
