import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  bigint,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./organization.ts";
import { agents } from "./agent.ts";

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, {
        onDelete: "cascade",
      }),

    // Where the operation originated.
    source: varchar("source", {
      enum: ["widget", "playground", "system"],
    }).notNull(),

    // What operation was performed.
    operation: varchar("operation", {
      enum: ["chat", "crawl", "embedding", "transcription"],
    }).notNull(),

    // Provider/model information for future cost calculation.
    provider: varchar("provider"),
    model: varchar("model"),

    // Usage measurements.
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),

    // Operation-specific measurements.
    pagesProcessed: integer("pages_processed"),
    chunksProcessed: integer("chunks_processed"),
    audioDurationSeconds: integer("audio_duration_seconds"),

    // null means cost has not been calculated.
    costMicros: bigint("cost_micros", {
      mode: "number",
    }),

    // measured, estimated, or unavailable.
    measurement: varchar("measurement", {
      enum: ["measured", "estimated", "unavailable"],
    })
      .notNull()
      .default("measured"),

    status: varchar("status", {
      enum: ["success", "failed"],
    }).notNull(),
    idempotencyKey: varchar("idempotency_key"),
    // Optional correlation / idempotency identifier.
    requestId: varchar("request_id"),

    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("usage_events_agent_created_idx").on(table.agentId, table.createdAt),
    index("usage_events_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("usage_events_operation_idx").on(table.operation, table.createdAt),
    uniqueIndex("usage_events_idempotency_key_idx").on(table.idempotencyKey),
  ],
);
