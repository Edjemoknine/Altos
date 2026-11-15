import { Hono } from "hono";

import { requireAuth } from "../middlewares/auth.middleware.ts";
import agentRoutes from "./agent.routes.ts";

const organizationRoutes = new Hono();

organizationRoutes.use("*", requireAuth);

organizationRoutes.route("/:organizationId/agents", agentRoutes);

export default organizationRoutes;
