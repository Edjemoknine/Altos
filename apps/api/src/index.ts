import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.routes.ts";
import userRoutes from "./routes/user.routes.ts";

const app = new Hono().basePath("/api");
app.use(
  "/api/*",
  cors({
    origin: process.env.FRONTEND_URL!,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.route("/auth", authRoutes);
app.route("/api/users", userRoutes);

app.get("/health", (c) => {
  return c.json({ status: "ok", message: "Hono backend is running!" });
});

export default app;
