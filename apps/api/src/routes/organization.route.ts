import { Hono } from "hono";

import { requireAuth } from "../middlewares/auth.middleware.ts";
import agentRoutes from "./agent.routes.ts";
import sourceRoutes from "./source.route.ts";

const organizationRoutes = new Hono();

organizationRoutes.use("*", requireAuth);

organizationRoutes.route("/:organizationId/agents", agentRoutes);
organizationRoutes.route(
  "/:organizationId/agents/:agentId/sources",
  sourceRoutes,
);
export default organizationRoutes;
