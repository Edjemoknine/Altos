import type { Context } from "hono";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

import { db } from "../db/index.ts";
import { agents } from "../db/schema.ts";
import { streamChatResponse } from "../services/ai/chat/chat.service.ts";
import { restoreVisitorConversation } from "../services/ai/chat/conversation.service.ts";
import { and, eq } from "drizzle-orm";

type PublicChatSource = {
  documentId: string;
  chunkId: string;
  sourceId: string;
  title: string;
  url: string | null;
  snippet: string;
};

type PublicChatUIMessage = UIMessage<
  never,
  {
    conversation: {
      conversationId: string;
    };
    sources: PublicChatSource[];
    messageId: {
      messageId: string;
    };
  }
>;

const MAX_MESSAGE_LENGTH = 4000;
const MAX_VISITOR_ID_LENGTH = 128;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type PublicChatBody = {
  visitorId: string;
  conversationId?: string;
  message: string;
};
function getPublicId(c: Context): string | null {
  const publicId = c.req.param("publicId");

  if (!publicId || !UUID_REGEX.test(publicId)) {
    return null;
  }

  return publicId;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

async function readJsonBody(c: Context): Promise<unknown | null> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

export async function sendChatMessage(c: Context) {
  const publicId = getPublicId(c);

  if (!publicId) {
    return c.json({ success: false, message: "Invalid agent public ID" }, 400);
  }
  const body = await readJsonBody(c);

  if (body === null) {
    return c.json(
      { success: false, message: "Invalid JSON request body" },
      400,
    );
  }

  const input = validateChatBody(body);

  if (!input) {
    return c.json({ success: false, message: "Invalid chat request" }, 400);
  }

  const stream = createUIMessageStream<PublicChatUIMessage>({
    execute: async ({ writer }) => {
      const textId = "assistant-response";
      let textStarted = false;
      let sources: PublicChatSource[] | undefined;

      writer.write({ type: "start" });

      try {
        const generator = streamChatResponse({
          publicId,
          ...input,
        });

        for await (const event of generator) {
          switch (event.type) {
            case "conversation": {
              writer.write({
                type: "data-conversation",
                data: {
                  conversationId: event.conversationId,
                },
                transient: true,
              });
              break;
            }

            case "sources": {
              sources = event.sources;
              break;
            }

            case "token": {
              if (!textStarted) {
                writer.write({
                  type: "text-start",
                  id: textId,
                });

                textStarted = true;
              }

              writer.write({
                type: "text-delta",
                id: textId,
                delta: event.token,
              });
              break;
            }

            case "done": {
              if (textStarted) {
                writer.write({
                  type: "text-end",
                  id: textId,
                });
              }

              writer.write({
                type: "data-messageId",
                data: {
                  messageId: event.messageId,
                },
              });

              if (sources) {
                writer.write({
                  type: "data-sources",
                  data: sources,
                });
              }
              break;
            }
          }
        }
      } catch (error) {
        console.error("Public chat stream failed:", error);

        if (textStarted) {
          writer.write({
            type: "text-end",
            id: textId,
          });
        }

        writer.write({
          type: "error",
          errorText: "Unable to generate a response. Please try again.",
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function restoreConversation(c: Context) {
  const publicId = getPublicId(c);

  if (!publicId) {
    return c.json({ success: false, message: "Invalid agent public ID" }, 400);
  }
  const body = await readJsonBody(c);

  if (body === null) {
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
}

export async function getWidgetConfig(c: Context) {
  const publicId = getPublicId(c);

  if (!publicId) {
    return c.json({ success: false, message: "Invalid agent public ID" }, 400);
  }
  try {
    const [agent] = await db
      .select({
        name: agents.name,
        logoUrl: agents.logoUrl,
      })
      .from(agents)
      .where(and(eq(agents.publicId, publicId), eq(agents.status, "active")))
      .limit(1);

    if (!agent) {
      return c.json(
        { success: false, message: "Agent not found or inactive" },
        404,
      );
    }

    return c.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error("Widget configuration retrieval failed:", error);

    return c.json(
      {
        success: false,
        message: "Unable to load widget configuration",
      },
      500,
    );
  }
}
