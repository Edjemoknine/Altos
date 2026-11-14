import { sql } from "drizzle-orm";
import { check, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { organizations } from "./organization.ts";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    description: text("description").notNull(),
    instructions: text("instructions").notNull(),
    status: varchar("status").default("active").notNull(),
    publicId: uuid("public_id").defaultRandom().notNull().unique(),
    settings: jsonb("settings")
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
    check("agents_status_check", sql`${table.status} in ('active', 'inactive')`),
  ],
);
