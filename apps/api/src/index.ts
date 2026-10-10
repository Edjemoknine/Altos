import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono().basePath("/api");

const appRoutes = app.get("/health", (c) => {
  return c.json({ status: "ok", message: "Hono backend is running!" });
});

export type AppType = typeof appRoutes;

serve({
  fetch: app.fetch,
  port: 3001,
});

export default app;
