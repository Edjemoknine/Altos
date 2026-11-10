import { Hono } from "hono";

import { requireAuth, type AppEnv } from "../middlewares/auth.middleware.ts";

const userRoutes = new Hono<AppEnv>();

userRoutes.use("*", requireAuth);

userRoutes.get("/me", (c) => {
  const user = c.get("user");

  return c.json({
    success: true,
    user,
  });
});

userRoutes.get("/session", (c) => {
  const session = c.get("session");

  return c.json({
    success: true,
    session,
  });
});

export default userRoutes;
