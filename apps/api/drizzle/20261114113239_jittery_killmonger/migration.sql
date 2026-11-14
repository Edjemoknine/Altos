CREATE TABLE "invitation" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members" RENAME TO "member";--> statement-breakpoint
ALTER TABLE "organizations" RENAME TO "organization";--> statement-breakpoint
ALTER TABLE "agents" DROP CONSTRAINT "agents_organization_id_organizations_id_fkey";--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "members_organization_id_organizations_id_fkey";--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "members_role_check";--> statement-breakpoint
DROP INDEX "members_organization_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "organization_id" SET DATA TYPE text USING "organization_id"::text;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "organization_id" SET DATA TYPE text USING "organization_id"::text;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE text USING "role"::text;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "name" SET DATA TYPE text USING "name"::text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "slug" SET DATA TYPE text USING "slug"::text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" ("user_id");--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;