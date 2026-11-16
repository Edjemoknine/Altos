import { Hono } from "hono";

import {
  createSource,
  deleteSource,
  getSource,
  listSources,
} from "../controllers/source.controller.ts";

import {
  requireOrganizationRole,
  type OrganizationEnv,
} from "../middlewares/organization.middleware.ts";

const sourceRoutes = new Hono<OrganizationEnv>();

// Members and owners can read sources.
sourceRoutes.get(
  "/",
  requireOrganizationRole(["owner", "member"]),
  listSources,
);

sourceRoutes.get(
  "/:sourceId",
  requireOrganizationRole(["owner", "member"]),
  getSource,
);

// Only owners can manage sources.
sourceRoutes.post("/", requireOrganizationRole(["owner"]), createSource);

sourceRoutes.delete(
  "/:sourceId",
  requireOrganizationRole(["owner"]),
  deleteSource,
);

export default sourceRoutes;
