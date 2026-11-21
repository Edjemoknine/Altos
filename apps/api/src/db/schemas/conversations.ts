import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { agents } from "./agent.ts";
import { organization } from "./organization.ts";

export type ConversationStatus = "active" | "closed";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id").notNull(),
    title: text("title").notNull(),
    status: varchar("status")
      .$type<ConversationStatus>()
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("conversations_organization_id_idx").on(table.organizationId),
    index("conversations_agent_id_idx").on(table.agentId),
    index("conversations_visitor_id_idx").on(table.visitorId),
    index("conversations_agent_visitor_updated_idx").on(
      table.agentId,
      table.visitorId,
      table.updatedAt,
    ),
    check(
      "conversations_status_check",
      sql`${table.status} in ('active', 'closed')`,
    ),
  ],
);
