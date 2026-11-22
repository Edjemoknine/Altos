import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { streamChatResponse } from "../services/ai/chat/chat.service.ts";
import { restoreVisitorConversation } from "../services/ai/chat/conversation.service.ts";
import { widgetAuthMiddleware } from "../middlewares/widget-auth.middleware.ts";
const chatRoutes = new Hono();

const MAX_MESSAGE_LENGTH = 4000;
const MAX_VISITOR_ID_LENGTH = 128;

type PublicChatBody = {
  visitorId: string;
  conversationId?: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
chatRoutes.use("/:publicId/*", widgetAuthMiddleware);
function validateChatBody(value: unknown): PublicChatBody | null {
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

chatRoutes.post("/:publicId/messages", async (c) => {
  const publicId = c.req.param("publicId");

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

  return streamSSE(c, async (stream) => {
    try {
      const generator = streamChatResponse({
        publicId,
        ...input,
      });

      for await (const event of generator) {
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
        });
      }
    } catch (error) {
      // Keep internal errors in server logs, never in the public response.
      console.error("Public chat stream failed:", error);

      try {
        await stream.writeSSE({
          event: "error",
          data: JSON.stringify({
            type: "error",
            message: "Unable to generate a response. Please try again.",
          }),
        });
      } catch {
        // The client may have disconnected before the error could be sent.
      }
    }
  });
});

function validateRestoreBody(value: unknown): { visitorId: string } | null {
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

chatRoutes.post("/:publicId/conversations/restore", async (c) => {
  const publicId = c.req.param("publicId");

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
    const result = await restoreVisitorConversation({
      publicId,
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
    console.error("Conversation restoration failed:", error);

    return c.json(
      {
        success: false,
        message: "Unable to restore conversation",
      },
      500,
    );
  }
});

export { chatRoutes };
