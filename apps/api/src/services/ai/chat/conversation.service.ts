import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db/index.ts";
import { conversations, messages } from "../../../db/schema.ts";

const HISTORY_LIMIT = 10;

type CreateConversationInput = {
  organizationId: string;
  agentId: string;
  visitorId: string;
  title: string;
};

export async function createConversation({
  organizationId,
  agentId,
  visitorId,
  title,
}: CreateConversationInput) {
  const [conversation] = await db
    .insert(conversations)
    .values({
      organizationId,
      agentId,
      visitorId,
      title,
    })
    .returning();

  return conversation;
}

type GetConversationInput = {
  conversationId: string;
  agentId: string;
  visitorId: string;
};

export async function getVisitorConversation({
  conversationId,
  agentId,
  visitorId,
}: GetConversationInput) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.agentId, agentId),
        eq(conversations.visitorId, visitorId),
      ),
    )
    .limit(1);

  return conversation ?? null;
}

export async function getConversationHistory(conversationId: string) {
  const history = await db
    .select({
      role: messages.role,
      content: messages.content,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(HISTORY_LIMIT);

  // The database query gets the latest messages first.
  // Reverse them to preserve chronological order for the LLM.
  return history.reverse();
}
