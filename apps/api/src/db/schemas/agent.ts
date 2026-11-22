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

import { organization } from "./organization.ts";

export type AgentTone = "professional" | "friendly" | "casual" | "formal";

export type AgentSettings = {
  tone: AgentTone;
  targetWebsiteUrl: string;
};

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    description: text("description").notNull(),
    instructions: text("instructions").notNull(),
    logoUrl: text("logo_url"),
    status: varchar("status").default("active").notNull(),
    settings: jsonb("settings")
      .$type<AgentSettings>()
      .default({
        tone: "professional",
        targetWebsiteUrl: "",
      })
      .notNull(),
    publicId: uuid("public_id").defaultRandom().notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("agents_organizationId_idx").on(table.organizationId),

    check(
      "agents_status_check",
      sql`${table.status} in ('active', 'inactive')`,
    ),
  ],
);
