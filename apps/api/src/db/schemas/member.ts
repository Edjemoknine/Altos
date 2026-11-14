import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth.ts";
import { organizations } from "./organization.ts";

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check("members_role_check", sql`${table.role} in ('owner', 'admin', 'member')`),
    uniqueIndex("members_organization_id_user_id_unique").on(
      table.organizationId,
      table.userId,
    ),
  ],
);
