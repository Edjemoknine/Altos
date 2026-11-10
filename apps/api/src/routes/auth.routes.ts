import { Hono } from "hono";
import { auth } from "../auth/auth.ts";

const authRoutes = new Hono();

authRoutes.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRoutes;
