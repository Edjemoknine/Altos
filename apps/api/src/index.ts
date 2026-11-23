import { Hono } from "hono";
import { cors } from "hono/cors";

import authRoutes from "./routes/auth.routes.ts";
import userRoutes from "./routes/user.routes.ts";
import agentRoutes from "./routes/agent.routes.ts";
import organizationRoutes from "./routes/organization.route.ts";
import { chatRoutes } from "./routes/chat.routes.ts";
import { agentPreviewRoutes } from "./routes/agent-preview.routes.ts";

// Keep this outside authenticated organization routes.
const app = new Hono().basePath("/api");

// CORS - apply to every route under /api
const allowedOrigins = [
  process.env.FRONTEND_URL, // dashboard app
  process.env.WIDGET_URL, // Widget app
].filter((origin): origin is string => Boolean(origin));

app.use(
  "*",
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : ""),
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Widget-Key",
      "X-Widget-Origin",
    ],
    credentials: true,
  }),
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Hono backend is running!",
  });
});

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/agents", agentRoutes);
app.route("/organizations", organizationRoutes);
app.route("/chat", chatRoutes);
app.route("/agent-preview", agentPreviewRoutes);

export type AppType = typeof app;

export default app;
