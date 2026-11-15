CREATE INDEX "agents_organizationId_idx" ON "agents" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_unique" ON "member" ("organization_id","user_id");