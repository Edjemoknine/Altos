import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { and, eq } from "drizzle-orm";
import { agents } from "../db/schemas/agent.ts";
import { db } from "../db/index.ts";
import { member } from "../db/schemas/organization.ts";
import type { AppEnv } from "./auth.middleware.ts";

export type OrganizationEnv = {
  Variables: AppEnv["Variables"] & {
    organizationMembership: typeof member.$inferSelect;
  };
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const requireAgentOrganizationRole = (allowedRoles: string[]) =>
  createMiddleware<OrganizationEnv>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    const agentId = c.req.param("agentId");

    if (!agentId || !UUID_REGEX.test(agentId)) {
      throw new HTTPException(400, {
        message: "Invalid agent ID",
      });
    }

    // Resolve the organization that owns this agent.
    const [agent] = await db
      .select({
        organizationId: agents.organizationId,
      })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      throw new HTTPException(404, {
        message: "Agent not found",
      });
    }

    // Verify that the authenticated user belongs to that organization.
    const [membership] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, user.id),
          eq(member.organizationId, agent.organizationId),
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
