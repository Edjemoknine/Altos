CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"url" text,
	"storage_key" text,
	"original_filename" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sources_type_check" CHECK ("type" in ('website', 'file', 'text')),
	CONSTRAINT "sources_status_check" CHECK ("status" in ('pending', 'processing', 'completed', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"external_id" text,
	"title" text NOT NULL,
	"url" text,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_external_id_not_empty_check" CHECK ("external_id" is null or length("external_id") > 0)
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"job_type" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"queue_job_id" text,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ingestion_jobs_type_check" CHECK ("job_type" in ('website_crawl', 'file_processing', 'text_processing')),
	CONSTRAINT "ingestion_jobs_status_check" CHECK ("status" in ('pending', 'processing', 'completed', 'failed')),
	CONSTRAINT "ingestion_jobs_progress_check" CHECK ("progress" between 0 and 100)
);
--> statement-breakpoint
CREATE INDEX "sources_organization_id_idx" ON "sources" ("organization_id");--> statement-breakpoint
CREATE INDEX "sources_agent_id_idx" ON "sources" ("agent_id");--> statement-breakpoint
CREATE INDEX "sources_status_idx" ON "sources" ("status");--> statement-breakpoint
CREATE INDEX "documents_source_id_idx" ON "documents" ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_source_external_id_unique" ON "documents" ("source_id","external_id") WHERE "external_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "document_chunks_document_chunk_index_unique" ON "document_chunks" ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "document_chunks_agent_id_idx" ON "document_chunks" ("agent_id");--> statement-breakpoint
CREATE INDEX "document_chunks_organization_id_idx" ON "document_chunks" ("organization_id");--> statement-breakpoint
CREATE INDEX "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "ingestion_jobs_source_id_idx" ON "ingestion_jobs" ("source_id");--> statement-breakpoint
CREATE INDEX "ingestion_jobs_status_idx" ON "ingestion_jobs" ("status");--> statement-breakpoint
CREATE INDEX "ingestion_jobs_agent_id_idx" ON "ingestion_jobs" ("agent_id");--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_source_id_sources_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_source_id_sources_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE;