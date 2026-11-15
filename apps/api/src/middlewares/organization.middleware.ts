import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { and, eq } from "drizzle-orm";

import { auth } from "../auth/auth.ts";
import { db } from "../db/index.ts";
import { member } from "../db/schemas/organization.ts";

type Variables = {
  session: NonNullable<typeof auth.$Infer.Session>;
  organizationMembership: typeof member.$inferSelect;
};

export const requireAuth = createMiddleware<{
  Variables: Variables;
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  c.set("session", session);

  await next();
});

export const requireOrganizationRole = (allowedRoles: string[]) =>
  createMiddleware<{
    Variables: Variables;
  }>(async (c, next) => {
    const session = c.get("session");

    const organizationId = c.req.param("organizationId");

    if (!organizationId) {
      throw new HTTPException(400, {
        message: "Organization ID is required",
      });
    }

    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new HTTPException(403, {
        message: "You are not a member of this organization",
      });
    }

    const userRoles = membership.role.split(",");

    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      throw new HTTPException(403, {
        message: "Insufficient organization permissions",
      });
    }

    c.set("organizationMembership", membership);

    await next();
  });
