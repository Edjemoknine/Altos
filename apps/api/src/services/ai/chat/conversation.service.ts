import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "../../../db/index.ts";
import { agents, conversations, messages } from "../../../db/schema.ts";

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

  return history.reverse();
}

type RestoreVisitorConversationInput = {
  publicId: string;
  visitorId: string;
};

export async function restoreVisitorConversation({
  publicId,
  visitorId,
}: RestoreVisitorConversationInput) {
  // Resolve the public agent identifier without exposing internal agent IDs.
  const [agent] = await db
    .select({
      id: agents.id,
      organizationId: agents.organizationId,
    })
    .from(agents)
    .where(and(eq(agents.publicId, publicId), eq(agents.status, "active")))
    .limit(1);

  if (!agent) {
    return null;
  }

  // Restore only the visitor's latest active conversation for this agent.
  const [conversation] = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      status: conversations.status,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.agentId, agent.id),
        eq(conversations.organizationId, agent.organizationId),
        eq(conversations.visitorId, visitorId),
        eq(conversations.status, "active"),
      ),
    )
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  if (!conversation) {
    return {
      conversation: null,
      messages: [],
    };
  }

  const conversationMessages = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      sources: messages.sources,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(asc(messages.createdAt));

  return {
    conversation,
    messages: conversationMessages,
  };
}
