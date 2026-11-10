import { createMiddleware } from "hono/factory";
import { auth } from "../auth/auth.ts";

type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData) {
    return c.json(
      {
        success: false,
        message: "Unauthorized. Please login.",
      },
      401,
    );
  }

  c.set("user", sessionData.user);
  c.set("session", sessionData.session);

  await next();
});

export type { AppEnv };
