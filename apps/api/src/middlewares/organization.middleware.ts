import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { and, eq } from "drizzle-orm";

import { db } from "../db/index.ts";
import { member } from "../db/schemas/organization.ts";
import type { AppEnv } from "./auth.middleware.ts";

export type OrganizationEnv = {
  Variables: AppEnv["Variables"] & {
    organizationMembership: typeof member.$inferSelect;
  };
};

export const requireOrganizationRole = (allowedRoles: string[]) =>
  createMiddleware<OrganizationEnv>(async (c, next) => {
    const user = c.get("user");
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
          eq(member.userId, user.id),
          eq(member.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new HTTPException(403, {
        message: "You are not a member of this organization",
      });
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new HTTPException(403, {
        message: "Insufficient organization permissions",
      });
    }

    c.set("organizationMembership", membership);

    await next();
  });
