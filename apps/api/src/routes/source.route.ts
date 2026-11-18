import { Hono } from "hono";

import {
  confirmFileUpload,
  createFileUploadUrl,
  createSource,
  deleteSource,
  getSource,
  listSources,
  refreshFileUploadUrl,
} from "../controllers/source.controller.ts";

import {
  requireOrganizationRole,
  type OrganizationEnv,
} from "../middlewares/organization.middleware.ts";

const sourceRoutes = new Hono<OrganizationEnv>();

// Read sources
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

// Create and manage sources
sourceRoutes.post("/", requireOrganizationRole(["owner"]), createSource);

// File uploads
sourceRoutes.post(
  "/uploads/presign",
  requireOrganizationRole(["owner"]),
  createFileUploadUrl,
);

sourceRoutes.post(
  "/:sourceId/upload-url",
  requireOrganizationRole(["owner"]),
  refreshFileUploadUrl,
);

sourceRoutes.post(
  "/:sourceId/complete",
  requireOrganizationRole(["owner"]),
  confirmFileUpload,
);

sourceRoutes.delete(
  "/:sourceId",
  requireOrganizationRole(["owner"]),
  deleteSource,
);

export default sourceRoutes;
