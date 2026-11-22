import { and, eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

import { db } from "../db/index.ts";
import { agentWidgetKeys, agents } from "../db/schema.ts";
import { hashWidgetKey } from "../utils/widget-key.ts";

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export const widgetAuthMiddleware = createMiddleware(async (c, next) => {
  const publicId = c.req.param("publicId");
  const widgetKey = c.req.header("X-Widget-Key");
  const customerOrigin = c.req.header("X-Widget-Origin");

  if (!publicId || !widgetKey) {
    return c.json(
      { success: false, message: "Invalid widget credentials" },
      401,
    );
  }

  if (!customerOrigin) {
    return c.json(
      { success: false, message: "Customer website origin is required" },
      403,
    );
  }

  const requestOrigin = normalizeOrigin(customerOrigin);

  if (!requestOrigin) {
    return c.json(
      { success: false, message: "Invalid customer website origin" },
      403,
    );
  }

  const keyHash = hashWidgetKey(widgetKey);

  const [result] = await db
    .select({
      keyId: agentWidgetKeys.id,
      agentId: agents.id,
      status: agents.status,
      settings: agents.settings,
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

  const allowedOrigin = normalizeOrigin(result.settings.targetWebsiteUrl);

  if (!allowedOrigin || requestOrigin !== allowedOrigin) {
    return c.json(
      { success: false, message: "This website is not authorized" },
      403,
    );
  }

  await db
    .update(agentWidgetKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(agentWidgetKeys.id, result.keyId));

  await next();
});
