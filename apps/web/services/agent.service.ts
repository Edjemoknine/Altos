import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent, CreateAgentInput } from "@/types/agents";
import { api, API_URL } from "./api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export const agentQueryKeys = {
  all: ["agents"] as const,
  list: (organizationId: string | undefined) =>
    [...agentQueryKeys.all, organizationId] as const,
  detail: (organizationId: string | undefined, agentId: string | undefined) =>
    [...agentQueryKeys.all, organizationId, "detail", agentId] as const,
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

export async function getAgent(
  organizationId: string,
  agentId: string,
): Promise<Agent> {
  requireApiUrl();

  try {
    const response = await api.get<ApiResponse<Agent>>(
      `/api/organizations/${encodeURIComponent(organizationId)}/agents/${encodeURIComponent(agentId)}`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Unable to load the agent.");
    }

    return result.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load the agent."));
  }
}

export function useAgent(
  organizationId: string | undefined,
  agentId: string | undefined,
) {
  return useQuery({
    queryKey: agentQueryKeys.detail(organizationId, agentId),
    queryFn: () => {
      if (!organizationId || !agentId) {
        throw new Error(
          "Select an organization and agent to load its details.",
        );
      }

      return getAgent(organizationId, agentId);
    },
    enabled: Boolean(organizationId && agentId),
  });
}

export type UpdateAgentInput = Pick<
  Agent,
  "name" | "description" | "instructions" | "settings"
>;

export async function updateAgent(
  organizationId: string,
  agentId: string,
  payload: UpdateAgentInput,
): Promise<Agent> {
  requireApiUrl();

  try {
    const response = await api.patch<ApiResponse<Agent>>(
      `/api/organizations/${encodeURIComponent(organizationId)}/agents/${encodeURIComponent(agentId)}`,
      payload,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.message ?? "Unable to update the agent.");
    }

    return result.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to update the agent. Please try again."),
    );
  }
}

export function useUpdateAgent(
  organizationId: string | undefined,
  agentId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAgentInput) => {
      if (!organizationId || !agentId) {
        throw new Error("Select an organization and agent before saving.");
      }

      return updateAgent(organizationId, agentId, payload);
    },
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(
        agentQueryKeys.detail(organizationId, agentId),
        updatedAgent,
      );
      queryClient.setQueryData<Agent[]>(
        agentQueryKeys.list(organizationId),
        (agents) =>
          agents?.map((agent) =>
            agent.id === updatedAgent.id ? updatedAgent : agent,
          ),
      );
    },
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
