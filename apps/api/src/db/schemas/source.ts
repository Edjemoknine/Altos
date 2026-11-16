import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { agents } from "./agent.ts";
import { organization } from "./organization.ts";

export type SourceType = "website" | "file" | "text";
export type SourceStatus = "pending" | "processing" | "completed" | "failed";

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    type: varchar("type").$type<SourceType>().notNull(),
    url: text("url"),
    storageKey: text("storage_key"),
    originalFilename: text("original_filename"),
    status: varchar("status")
      .$type<SourceStatus>()
      .default("pending")
      .notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sources_organization_id_idx").on(table.organizationId),
    index("sources_agent_id_idx").on(table.agentId),
    index("sources_status_idx").on(table.status),
    check(
      "sources_type_check",
      sql`${table.type} in ('website', 'file', 'text')`,
    ),
    check(
      "sources_status_check",
      sql`${table.status} in ('pending', 'processing', 'completed', 'failed')`,
    ),
  ],
);
