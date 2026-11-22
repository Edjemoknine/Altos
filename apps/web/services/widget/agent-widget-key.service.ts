const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type AgentWidgetKey = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type CreatedAgentWidgetKey = {
  id: string;
  name: string;
  createdAt: string;
  key: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result.data as T;
}

/**
 * List an agent's widget keys.
 */
export async function getAgentWidgetKeys(
  agentId: string,
): Promise<AgentWidgetKey[]> {
  const response = await fetch(
    `${API_URL}/api/agents/${encodeURIComponent(agentId)}/widget-keys`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return handleResponse<AgentWidgetKey[]>(response);
}

/**
 * Create a named widget key.
 * The raw key is returned only once.
 */
export async function createAgentWidgetKey(
  agentId: string,
  name: string,
): Promise<CreatedAgentWidgetKey> {
  const response = await fetch(
    `${API_URL}/api/agents/${encodeURIComponent(agentId)}/widget-keys`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name }),
    },
  );

  return handleResponse<CreatedAgentWidgetKey>(response);
}

/**
 * Delete a widget key.
 */
export async function deleteAgentWidgetKey(
  agentId: string,
  keyId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/agents/${encodeURIComponent(agentId)}/widget-keys/${encodeURIComponent(keyId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  await handleResponse<unknown>(response);
}
