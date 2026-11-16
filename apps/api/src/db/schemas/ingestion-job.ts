import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { agents } from "./agent.ts";
import { sources } from "./source.ts";
import { organization } from "./organization.ts";

export type IngestionJobType =
  | "website_crawl"
  | "file_processing"
  | "text_processing";
export type IngestionJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export const ingestionJobs = pgTable(
  "ingestion_jobs",
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
    jobType: varchar("job_type").$type<IngestionJobType>().notNull(),
    status: varchar("status")
      .$type<IngestionJobStatus>()
      .default("pending")
      .notNull(),
    progress: integer("progress").default(0).notNull(),
    queueJobId: text("queue_job_id"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ingestion_jobs_source_id_idx").on(table.sourceId),
    index("ingestion_jobs_status_idx").on(table.status),
    index("ingestion_jobs_agent_id_idx").on(table.agentId),
    check(
      "ingestion_jobs_type_check",
      sql`${table.jobType} in ('website_crawl', 'file_processing', 'text_processing')`,
    ),
    check(
      "ingestion_jobs_status_check",
      sql`${table.status} in ('pending', 'processing', 'completed', 'failed')`,
    ),
    check(
      "ingestion_jobs_progress_check",
      sql`${table.progress} between 0 and 100`,
    ),
  ],
);
