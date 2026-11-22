"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAgentWidgetKey,
  deleteAgentWidgetKey,
  getAgentWidgetKeys,
} from "./agent-widget-key.service";

export const agentWidgetKeysQueryKey = (agentId: string) => [
  "agents",
  agentId,
  "widget-keys",
];

export function useAgentWidgetKeys(agentId: string) {
  return useQuery({
    queryKey: agentWidgetKeysQueryKey(agentId),
    queryFn: () => getAgentWidgetKeys(agentId),
    enabled: Boolean(agentId),
    staleTime: 30_000,
  });
}

export function useCreateAgentWidgetKey(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createAgentWidgetKey(agentId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agentWidgetKeysQueryKey(agentId),
      });
    },
  });
}

export function useDeleteAgentWidgetKey(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => deleteAgentWidgetKey(agentId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: agentWidgetKeysQueryKey(agentId),
      });
    },
  });
}
