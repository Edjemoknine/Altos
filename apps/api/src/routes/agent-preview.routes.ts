import { Hono } from "hono";

import {
  sendPreviewMessage,
  restorePreviewConversation,
} from "../controllers/agent-preview.controller.ts";

import { requireAgentOrganizationRole } from "../middlewares/organization.middleware.ts";

import { requireAuth } from "../middlewares/auth.middleware.ts";

const agentPreviewRoutes = new Hono();

agentPreviewRoutes.use("*", requireAuth);

agentPreviewRoutes.post(
  "/:agentId/messages",
  requireAgentOrganizationRole(["owner", "member"]),
  sendPreviewMessage,
);

agentPreviewRoutes.post(
  "/:agentId/conversations/restore",
  requireAgentOrganizationRole(["owner", "member"]),
  restorePreviewConversation,
);

export { agentPreviewRoutes };
