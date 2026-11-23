import { Hono } from "hono";
import { requireOrganizationRole } from "../middlewares/organization.middleware.ts";
import {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} from "../controllers/agent.controller.ts";
import {
  createAgentWidgetKey,
  getAgentWidgetKeys,
  deleteAgentWidgetKey,
} from "../controllers/agent.controller.ts";
import { requireAgentOrganizationRole } from "../middlewares/organization.middleware.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const agentRoutes = new Hono();
agentRoutes.use("*", requireAuth);
agentRoutes.get("/", requireOrganizationRole(["owner", "member"]), getAgents);

agentRoutes.post("/", requireOrganizationRole(["owner"]), createAgent);

agentRoutes.get(
  "/:agentId",
  requireOrganizationRole(["owner", "member"]),
  getAgentById,
);

agentRoutes.patch("/:agentId", requireOrganizationRole(["owner"]), updateAgent);

agentRoutes.delete(
  "/:agentId",
  requireOrganizationRole(["owner"]),
  deleteAgent,
);
agentRoutes.post(
  "/:agentId/widget-keys",
  requireAgentOrganizationRole(["owner"]),
  createAgentWidgetKey,
);

agentRoutes.get(
  "/:agentId/widget-keys",
  requireAgentOrganizationRole(["owner"]),
  getAgentWidgetKeys,
);

agentRoutes.delete(
  "/:agentId/widget-keys/:keyId",
  requireAgentOrganizationRole(["owner"]),
  deleteAgentWidgetKey,
);
export default agentRoutes;
