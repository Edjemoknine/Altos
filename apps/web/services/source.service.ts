import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AgentSource = {
  id: string;
  name: string;
  type: "website" | "file" | "text";
  status: "pending" | "processing" | "completed" | "failed";
  originalFilename: string | null;
  createdAt: string;
};

export type AgentDocumentUploadStage = "extracting" | "processing";

type UploadUrlResponse = {
  source: AgentSource;
  uploadUrl: string;
  expiresIn: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const sourceQueryKeys = {
  all: ["sources"] as const,
  list: (organizationId: string | undefined, agentId: string | undefined) =>
    [...sourceQueryKeys.all, organizationId, agentId] as const,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data.message ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function requireApiUrl() {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }
}

function getSourcePath(organizationId: string, agentId: string) {
  return `/api/organizations/${encodeURIComponent(organizationId)}/agents/${encodeURIComponent(agentId)}/sources`;
}

function getDocumentContentType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    csv: "text/csv",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdf: "application/pdf",
    txt: "text/plain",
  };

  return extension ? contentTypes[extension] : undefined;
}

export async function listAgentSources(
  organizationId: string,
  agentId: string,
): Promise<AgentSource[]> {
  requireApiUrl();

  try {
    const response = await api.get<ApiResponse<AgentSource[]>>(
      getSourcePath(organizationId, agentId),
    );
    const result = response.data;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message ?? "Unable to load documents.");
    }

    return result.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load documents."));
  }
}

export function useAgentSources(
  organizationId: string | undefined,
  agentId: string | undefined,
) {
  return useQuery({
    queryKey: sourceQueryKeys.list(organizationId, agentId),
    queryFn: () => {
      if (!organizationId || !agentId) {
        throw new Error("Select an organization and agent to load documents.");
      }

      return listAgentSources(organizationId, agentId);
    },
    enabled: Boolean(organizationId && agentId),
  });
}

export async function uploadAgentDocument(
  organizationId: string,
  agentId: string,
  file: File,
  onStage?: (stage: AgentDocumentUploadStage) => void,
): Promise<AgentSource> {
  requireApiUrl();
  const sourcePath = getSourcePath(organizationId, agentId);
  const contentType = getDocumentContentType(file.name);

  if (!contentType) {
    throw new Error("Choose a PDF, DOC, DOCX, CSV, or TXT file.");
  }

  try {
    const uploadResponse = await api.post<ApiResponse<UploadUrlResponse>>(
      `${sourcePath}/uploads/presign`,
      {
        name: file.name,
        originalFilename: file.name,
        contentType,
        size: file.size,
      },
    );
    const upload = uploadResponse.data.data;

    if (!uploadResponse.data.success || !upload?.uploadUrl) {
      throw new Error(
        uploadResponse.data.message ?? "Unable to start the document upload.",
      );
    }

    await axios.put(upload.uploadUrl, file, {
      headers: { "Content-Type": contentType },
    });

    onStage?.("extracting");
    const completeResponse = await api.post<ApiResponse<AgentSource>>(
      `${sourcePath}/${encodeURIComponent(upload.source.id)}/complete`,
    );
    const result = completeResponse.data;

    if (!result.success || !result.data) {
      throw new Error(
        result.message ?? "Unable to finish the document upload.",
      );
    }

    onStage?.("processing");
    return result.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to upload the document. Please try again.",
      ),
    );
  }
}

export async function deleteAgentSource(
  organizationId: string,
  agentId: string,
  sourceId: string,
): Promise<void> {
  requireApiUrl();

  try {
    const response = await api.delete<ApiResponse<unknown>>(
      `${getSourcePath(organizationId, agentId)}/${encodeURIComponent(sourceId)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message ?? "Unable to delete the source.");
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to delete the source."));
  }
}

export async function retryAgentSource(
  organizationId: string,
  agentId: string,
  sourceId: string,
): Promise<AgentSource> {
  requireApiUrl();

  try {
    const response = await api.post<ApiResponse<AgentSource>>(
      `${getSourcePath(organizationId, agentId)}/${encodeURIComponent(sourceId)}/retry`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Unable to retry source processing.");
    }

    return result.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to retry source processing."),
    );
  }
}

export function useUploadAgentDocument(
  organizationId: string | undefined,
  agentId: string | undefined,
  onStage?: (stage: AgentDocumentUploadStage) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      if (!organizationId || !agentId) {
        throw new Error("Select an organization and agent before uploading.");
      }

      return uploadAgentDocument(organizationId, agentId, file, onStage);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: sourceQueryKeys.list(organizationId, agentId),
      }),
  });
}

export function useDeleteAgentSource(
  organizationId: string | undefined,
  agentId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => {
      if (!organizationId || !agentId) {
        throw new Error("Select an organization and agent before deleting.");
      }

      return deleteAgentSource(organizationId, agentId, sourceId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: sourceQueryKeys.list(organizationId, agentId),
      }),
  });
}

export function useRetryAgentSource(
  organizationId: string | undefined,
  agentId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => {
      if (!organizationId || !agentId) {
        throw new Error("Select an organization and source before retrying.");
      }

      return retryAgentSource(organizationId, agentId, sourceId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: sourceQueryKeys.list(organizationId, agentId),
      }),
  });
}
