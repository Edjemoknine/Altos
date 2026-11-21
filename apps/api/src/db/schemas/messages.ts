import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations.ts";

export type MessageRole = "user" | "assistant";
export type MessageSource = {
  documentId: string;
  chunkId: string;
  sourceId: string;
  title: string;
  url: string | null;
  snippet: string;
};
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: varchar("role").$type<MessageRole>().notNull(),
    content: text("content").notNull(),
    sources: jsonb("sources").$type<MessageSource[]>().default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
    check("messages_role_check", sql`${table.role} in ('user', 'assistant')`),
  ],
);
