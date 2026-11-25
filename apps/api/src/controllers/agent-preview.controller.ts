import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { and, eq } from "drizzle-orm";

import { db } from "../db/index.ts";
import { agents } from "../db/schema.ts";
import {
  streamChatResponse,
  type ChatStreamEvent,
} from "../services/ai/chat/chat.service.ts";
import { restoreVisitorConversation } from "../services/ai/chat/conversation.service.ts";
import type { OrganizationEnv } from "../middlewares/organization.middleware.ts";

// Use the same OrganizationEnv import path as your agent controller.

const MAX_MESSAGE_LENGTH = 4000;
const MAX_VISITOR_ID_LENGTH = 128;

type PreviewChatBody = {
  visitorId: string;
  conversationId?: string;
  message: string;
};

type RestoreBody = {
  visitorId: string;
};

type PreviewContext = Context<OrganizationEnv>;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string | undefined): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateChatBody(value: unknown): PreviewChatBody | null {
  if (!isRecord(value)) return null;

  const { visitorId, conversationId, message } = value;

  if (
    typeof visitorId !== "string" ||
    !visitorId.trim() ||
    visitorId.length > MAX_VISITOR_ID_LENGTH
  ) {
    return null;
  }

  if (
    conversationId !== undefined &&
    conversationId !== null &&
    typeof conversationId !== "string"
  ) {
    return null;
  }

  if (
    typeof message !== "string" ||
    !message.trim() ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return null;
  }

  return {
    visitorId: visitorId.trim(),
    conversationId:
      typeof conversationId === "string" ? conversationId : undefined,
    message: message.trim(),
  };
}

function validateRestoreBody(value: unknown): RestoreBody | null {
  if (!isRecord(value)) return null;

  const { visitorId } = value;

  if (
    typeof visitorId !== "string" ||
    !visitorId.trim() ||
    visitorId.length > MAX_VISITOR_ID_LENGTH
  ) {
    return null;
  }

  return { visitorId: visitorId.trim() };
}

/**
 * Resolve an active agent belonging to the authenticated organization.
 */
async function getPreviewAgent(agentId: string, organizationId: string) {
  const [agent] = await db
    .select({
      id: agents.id,
      publicId: agents.publicId,
    })
    .from(agents)
    .where(
      and(
        eq(agents.id, agentId),
        eq(agents.organizationId, organizationId),
        eq(agents.status, "active"),
      ),
    )
    .limit(1);

  return agent ?? null;
}

/**
 * POST /api/agent-preview/:agentId/messages
 */
export const sendPreviewMessage = async (c: PreviewContext) => {
  const agentId = c.req.param("agentId");
  if (!isValidUuid(agentId)) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }
  const organizationId = c.get("organizationMembership").organizationId;

  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { success: false, message: "Invalid JSON request body" },
      400,
    );
  }

  const input = validateChatBody(body);

  if (!input) {
    return c.json({ success: false, message: "Invalid chat request" }, 400);
  }

  try {
    const agent = await getPreviewAgent(agentId, organizationId);

    if (!agent) {
      return c.json(
        { success: false, message: "Agent not found or inactive" },
        404,
      );
    }

    return streamSSE(c, async (stream) => {
      try {
        const generator = streamChatResponse({
          publicId: agent.publicId,
          organizationId,
          source: "playground",
          ...input,
        });
        let pendingSources:
          Extract<ChatStreamEvent, { type: "sources" }> | undefined;

        for await (const event of generator) {
          if (event.type === "sources") {
            pendingSources = event;
            continue;
          }

          await stream.writeSSE({
            event: event.type,
            data: JSON.stringify(event),
          });

          if (event.type === "done" && pendingSources) {
            await stream.writeSSE({
              event: pendingSources.type,
              data: JSON.stringify(pendingSources),
            });
          }
        }
      } catch (error) {
        console.error("Agent preview chat stream failed:", error);

        try {
          await stream.writeSSE({
            event: "error",
            data: JSON.stringify({
              type: "error",
              message: "Unable to generate a response. Please try again.",
            }),
          });
        } catch {
          // Client may have disconnected.
        }
      }
    });
  } catch (error) {
    console.error("Agent preview request failed:", error);

    return c.json(
      { success: false, message: "Unable to process preview request" },
      500,
    );
  }
};

/**
 * POST /api/agent-preview/:agentId/conversations/restore
 */
export const restorePreviewConversation = async (c: PreviewContext) => {
  const agentId = c.req.param("agentId");

  if (!isValidUuid(agentId)) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }
  const organizationId = c.get("organizationMembership").organizationId;

  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { success: false, message: "Invalid JSON request body" },
      400,
    );
  }

  const input = validateRestoreBody(body);

  if (!input) {
    return c.json({ success: false, message: "Invalid restore request" }, 400);
  }

  try {
    const agent = await getPreviewAgent(agentId, organizationId);

    if (!agent) {
      return c.json(
        { success: false, message: "Agent not found or inactive" },
        404,
      );
    }

    const result = await restoreVisitorConversation({
      publicId: agent.publicId,
      visitorId: input.visitorId,
    });

    if (!result) {
      return c.json(
        { success: false, message: "Agent not found or inactive" },
        404,
      );
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Agent preview conversation restoration failed:", error);

    return c.json(
      {
        success: false,
        message: "Unable to restore conversation",
      },
      500,
    );
  }
};
