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

const agentRoutes = new Hono();

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
  requireOrganizationRole(["owner"]),
  createAgentWidgetKey,
);

agentRoutes.get(
  "/:agentId/widget-keys",
  requireOrganizationRole(["owner"]),
  getAgentWidgetKeys,
);

agentRoutes.delete(
  "/:agentId/widget-keys/:keyId",
  requireOrganizationRole(["owner"]),
  deleteAgentWidgetKey,
);
export default agentRoutes;
