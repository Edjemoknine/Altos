import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { agents } from "./agent.ts";
import { sources } from "./source.ts";
import { organization } from "./organization.ts";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
    title: text("title").notNull(),
    url: text("url"),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    dedupeHash: text("dedupe_hash"),
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
    index("documents_source_id_idx").on(table.sourceId),
    uniqueIndex("documents_source_external_id_unique")
      .on(table.sourceId, table.externalId)
      .where(sql`${table.externalId} is not null`),
    uniqueIndex("documents_agent_dedupe_hash_unique").on(
      table.agentId,
      table.dedupeHash,
    ),
    check(
      "documents_external_id_not_empty_check",
      sql`${table.externalId} is null or length(${table.externalId}) > 0`,
    ),
  ],
);
