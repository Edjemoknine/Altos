import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});