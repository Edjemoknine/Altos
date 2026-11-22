CREATE TABLE "agent_widget_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "widget_key_hash";--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "widget_key_created_at";--> statement-breakpoint
CREATE INDEX "agent_widget_keys_agentId_idx" ON "agent_widget_keys" ("agent_id");--> statement-breakpoint
ALTER TABLE "agent_widget_keys" ADD CONSTRAINT "agent_widget_keys_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;