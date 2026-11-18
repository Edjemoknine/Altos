"use client";

import { useParams } from "next/navigation";
import { authClient } from "@/auth/auth-client";
import { DocumentUpload } from "./DocumentUpload";
import { SourceList } from "./SourceList";
import { WebsiteCrawlForm } from "./WebsiteCrawlForm";

export function KnowledgeBaseTab() {
  const { id: agentId } = useParams<{ id: string }>();
  const { data: activeOrganization, isPending: isOrganizationPending } =
    authClient.useActiveOrganization();
  const organizationId = activeOrganization?.id;

  return (
    <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
      <WebsiteCrawlForm />
      <DocumentUpload
        agentId={agentId}
        isOrganizationPending={isOrganizationPending}
        organizationId={organizationId}
      />
      <SourceList
        agentId={agentId}
        isOrganizationPending={isOrganizationPending}
        organizationId={organizationId}
      />
    </div>
  );
}
