import type {
  AgentDocumentUploadStage,
  AgentSource,
} from "@/services/agent/source.service";
export type UploadStage =
  | "idle"
  | "uploading"
  | AgentDocumentUploadStage
  | "processing"
  | "ready"
  | "failed";

export type DocumentUploadProps = {
  agentId: string;
  isOrganizationPending: boolean;
  organizationId: string | undefined;
};

export type SourceListProps = {
  agentId: string;
  isOrganizationPending: boolean;
  organizationId: string | undefined;
};

export type SourceItemProps = {
  source: AgentSource;
  isRetrying: boolean;
  isDeleting: boolean;
  retryError?: string;
  onRetry: (sourceId: string) => void;
  onDelete: (source: AgentSource) => void;
};
