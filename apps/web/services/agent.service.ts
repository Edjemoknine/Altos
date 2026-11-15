import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AgentTone = "Professional" | "Friendly" | "Casual" | "Empathic";

export type CreateAgentInput = {
  name: string;
  description: string;
  instructions: string;
  settings: {
    website: string;
    tone: AgentTone;
  };
};

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  instructions: string;
  status: "active" | "inactive";
  publicId: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const agentQueryKeys = {
  all: ["agents"] as const,
  list: (organizationId: string | undefined) =>
    [...agentQueryKeys.all, organizationId] as const,
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

export async function listAgents(organizationId: string): Promise<Agent[]> {
  requireApiUrl();

  try {
    const response = await api.get<ApiResponse<Agent[]>>(
      `/api/organizations/${encodeURIComponent(organizationId)}/agents`,
    );
    const result = response.data;

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message ?? "Unable to load agents.");
    }

    return result.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load agents."));
  }
}

export function useAgents(organizationId: string | undefined) {
  return useQuery({
    queryKey: agentQueryKeys.list(organizationId),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Select an organization to load agents.");
      }

      return listAgents(organizationId);
    },
    enabled: Boolean(organizationId),
    staleTime: 30_000,
  });
}

export async function createAgent(
  organizationId: string,
  payload: CreateAgentInput,
): Promise<Agent> {
  requireApiUrl();

  try {
    const response = await api.post<ApiResponse<Agent>>(
      `/api/organizations/${encodeURIComponent(organizationId)}/agents`,
      payload,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Unable to create the agent.");
    }

    return result.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to create the agent. Please try again."),
    );
  }
}

export function useCreateAgent(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAgentInput) => {
      if (!organizationId) {
        throw new Error("Select an organization before creating an agent.");
      }

      return createAgent(organizationId, payload);
    },
    onSuccess: (agent) => {
      queryClient.setQueryData<Agent[]>(
        agentQueryKeys.list(organizationId),
        (agents) => (agents ? [agent, ...agents] : [agent]),
      );
    },
  });
}

export async function deleteAgent(
  organizationId: string,
  agentId: string,
): Promise<void> {
  requireApiUrl();

  try {
    const response = await api.delete<ApiResponse<unknown>>(
      `/api/organizations/${encodeURIComponent(organizationId)}/agents/${encodeURIComponent(agentId)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.message ?? "Unable to delete the agent.");
    }
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to delete the agent. Please try again."),
    );
  }
}

export function useDeleteAgent(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => {
      if (!organizationId) {
        throw new Error("Select an organization before deleting an agent.");
      }

      return deleteAgent(organizationId, agentId);
    },
    onSuccess: (_result, agentId) => {
      queryClient.setQueryData<Agent[]>(
        agentQueryKeys.list(organizationId),
        (agents) => agents?.filter((agent) => agent.id !== agentId),
      );
    },
  });
}
