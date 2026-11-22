import type { WidgetCredentials } from "../types/widget";

function getApiUrl(API_URL: string): string {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  return API_URL;
}

function getHeaders(credentials: WidgetCredentials): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Widget-Key": credentials.apiKey,
    "X-Widget-Origin": credentials.customerOrigin,
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  const result = await response.json().catch(() => null);

  return result?.message ?? `Request failed with status ${response.status}`;
}

/**
 * Creates or retrieves a stable visitor ID for this browser.
 */
function getVisitorId(VISITOR_ID_STORAGE_KEY: string): string {
  const existingId = localStorage.getItem(VISITOR_ID_STORAGE_KEY);

  if (existingId) {
    return existingId;
  }

  const visitorId = crypto.randomUUID();

  localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);

  return visitorId;
}

export { getApiUrl, getHeaders, getErrorMessage, getVisitorId };
