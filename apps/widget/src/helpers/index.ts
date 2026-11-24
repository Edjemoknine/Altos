import type { WidgetCredentials } from "../types/widget";

function getApiUrl(apiUrl: string | undefined): string {
  const normalizedApiUrl = apiUrl?.replace(/\/+$/, "");

  if (!normalizedApiUrl) {
    throw new Error("VITE_API_URL is not configured");
  }

  return normalizedApiUrl;
}

function getHeaders(credentials: WidgetCredentials): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Widget-Key": credentials.apiKey,
    "X-Widget-Origin": credentials.customerOrigin,
  };
}

async function getErrorMessage(response: Response): Promise<string> {
  const result = await response.json().catch(() => null);

  return (
    (typeof result?.message === "string" && result.message) ||
    `Request failed with status ${response.status}`
  );
}

function getVisitorId(storageKey: string): string {
  const existingId = localStorage.getItem(storageKey);

  if (existingId) {
    return existingId;
  }

  const visitorId = crypto.randomUUID();

  localStorage.setItem(storageKey, visitorId);

  return visitorId;
}

export { getApiUrl, getHeaders, getErrorMessage, getVisitorId };
