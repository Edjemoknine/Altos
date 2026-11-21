ALTER INDEX "messages_conversation_id_idx" RENAME TO "messages_conversation_created_idx";--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "settings" SET DEFAULT '{"tone":"professional","targetWebsiteUrl":""}';--> statement-breakpoint
DROP INDEX "messages_conversation_created_idx";--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "conversations_agent_visitor_updated_idx" ON "conversations" ("agent_id","visitor_id","updated_at");