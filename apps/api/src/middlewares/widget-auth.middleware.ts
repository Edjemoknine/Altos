import { and, eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { db } from "../db/index.ts";
import { agentWidgetKeys, agents } from "../db/schema.ts";
import { hashWidgetKey } from "../utils/widget-key.ts";

export const widgetAuthMiddleware = createMiddleware(async (c, next) => {
  const publicId = c.req.param("publicId");
  const widgetKey = c.req.header("X-Widget-Key");
  const origin = c.req.header("Origin");

  if (!publicId || !widgetKey) {
    return c.json(
      { success: false, message: "Invalid widget credentials" },
      401,
    );
  }

  if (!origin) {
    return c.json(
      { success: false, message: "Origin header is required" },
      403,
    );
  }

  let requestOrigin: string;

  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    return c.json({ success: false, message: "Invalid origin" }, 403);
  }

  const keyHash = hashWidgetKey(widgetKey);

  const [result] = await db
    .select({
      keyId: agentWidgetKeys.id,
      agentId: agents.id,
      status: agents.status,
      targetWebsiteUrl: agents.settings,
    })
    .from(agentWidgetKeys)
    .innerJoin(agents, eq(agentWidgetKeys.agentId, agents.id))
    .where(
      and(eq(agents.publicId, publicId), eq(agentWidgetKeys.keyHash, keyHash)),
    )
    .limit(1);

  if (!result) {
    return c.json(
      { success: false, message: "Invalid widget credentials" },
      401,
    );
  }

  if (result.status !== "active") {
    return c.json({ success: false, message: "This agent is inactive" }, 403);
  }

  const allowedOrigin = result.targetWebsiteUrl.targetWebsiteUrl;

  if (!allowedOrigin || requestOrigin !== allowedOrigin) {
    return c.json(
      { success: false, message: "This website is not authorized" },
      403,
    );
  }

  // Update last-used timestamp after successful authentication.
  await db
    .update(agentWidgetKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(agentWidgetKeys.id, result.keyId));

  await next();
});
