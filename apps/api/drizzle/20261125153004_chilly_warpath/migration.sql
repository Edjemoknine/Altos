CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"source" varchar NOT NULL,
	"operation" varchar NOT NULL,
	"provider" varchar,
	"model" varchar,
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"pages_processed" integer,
	"chunks_processed" integer,
	"audio_duration_seconds" integer,
	"cost_micros" bigint,
	"measurement" varchar DEFAULT 'measured' NOT NULL,
	"status" varchar NOT NULL,
	"idempotency_key" varchar,
	"request_id" varchar,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "usage_events_agent_created_idx" ON "usage_events" ("agent_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_org_created_idx" ON "usage_events" ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_operation_idx" ON "usage_events" ("operation","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_events_idempotency_key_idx" ON "usage_events" ("idempotency_key");--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;