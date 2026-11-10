import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./auth/auth.ts";

const app = new Hono().basePath("/api");

const appRoutes = app.get("/health", (c) => {
  return c.json({ status: "ok", message: "Hono backend is running!" });
});

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

export type AppType = typeof appRoutes;

export default app;
