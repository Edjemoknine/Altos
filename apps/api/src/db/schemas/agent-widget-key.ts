import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { agents } from "./agent.ts";

export const agentWidgetKeys = pgTable(
  "agent_widget_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),

    name: text("name").notNull(),

    keyHash: text("key_hash").notNull().unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => [index("agent_widget_keys_agentId_idx").on(table.agentId)],
);
