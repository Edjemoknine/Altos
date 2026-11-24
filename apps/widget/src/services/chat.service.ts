import { getApiUrl, getErrorMessage, getHeaders } from "../helpers";
import type {
  ApiResponse,
  RestoreConversationResult,
  WidgetConfig,
  WidgetCredentials,
} from "../types/widget";

const API_URL = import.meta.env.VITE_API_URL;

export async function getWidgetConfig(
  credentials: WidgetCredentials,
  signal?: AbortSignal,
): Promise<WidgetConfig> {
  const response = await fetch(
    `${getApiUrl(API_URL)}/api/chat/${encodeURIComponent(credentials.publicId)}/config`,
    {
      headers: getHeaders(credentials),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result = (await response.json()) as ApiResponse<WidgetConfig>;

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "Unable to load widget configuration");
  }

  return result.data;
}

/**
 * Restores the visitor's latest active conversation.
 */
export async function restoreConversation(
  credentials: WidgetCredentials,
  visitorId: string,
  signal?: AbortSignal,
): Promise<RestoreConversationResult> {
  const response = await fetch(
    `${getApiUrl(API_URL)}/api/chat/${encodeURIComponent(credentials.publicId)}/conversations/restore`,
    {
      method: "POST",
      headers: getHeaders(credentials),
      body: JSON.stringify({ visitorId }),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result =
    (await response.json()) as ApiResponse<RestoreConversationResult>;

  if (!result.success || !result.data) {
    throw new Error(result.message ?? "Unable to restore conversation");
  }

  return result.data;
}
