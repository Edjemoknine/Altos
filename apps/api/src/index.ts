import { Hono } from "hono";
import { cors } from "hono/cors";

import authRoutes from "./routes/auth.routes.ts";
import userRoutes from "./routes/user.routes.ts";

const app = new Hono().basePath("/api");

// CORS
app.use(
  "/api/*",
  cors({
    origin: process.env.FRONTEND_URL!,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
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
export type AppType = typeof app;

export default app;
