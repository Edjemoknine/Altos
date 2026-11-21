import { eq } from "drizzle-orm";
import {
  conversations,
  messages,
  type MessageRole,
  type MessageSource,
} from "../../../db/schema.ts";
import { db } from "../../../db/index.ts";

type CreateMessageInput = {
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
};

export async function createMessage({
  conversationId,
  role,
  content,
  sources = [],
}: CreateMessageInput) {
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      role,
      content,
      sources,
    })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return message;
}
