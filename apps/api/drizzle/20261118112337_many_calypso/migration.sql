ALTER TABLE "documents" ADD COLUMN "dedupe_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX "documents_agent_dedupe_hash_unique" ON "documents" ("agent_id","dedupe_hash");