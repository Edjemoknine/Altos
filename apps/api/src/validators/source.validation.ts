import type { CreateSourceInput } from "../types/source.ts";
import type { SourceType } from "../db/schemas/source.ts";

export type CreateSourceValidationResult =
  | { success: true; data: CreateSourceInput }
  | { success: false; message: string; status: 400 | 413 };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getText = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const getSourceType = (value: unknown): SourceType | null => {
  if (value === "website" || value === "file" || value === "text") {
    return value;
  }

  return null;
};

const invalid = (
  message: string,
  status: 400 | 413 = 400,
): CreateSourceValidationResult => ({
  success: false,
  message,
  status,
});

export const parseCreateSourceBody = (
  body: unknown,
): CreateSourceValidationResult => {
  if (!isRecord(body)) {
    return invalid("Invalid request body");
  }

  const name = getText(body.name);
  const type = getSourceType(body.type);

  if (!name || !type) {
    return invalid("A valid name and source type are required");
  }

  const input: CreateSourceInput = {
    name,
    type,
    url: null,
    storageKey: null,
    originalFilename: null,
    content: null,
    metadata: isRecord(body.metadata) ? body.metadata : {},
  };

  if (type === "website") {
    const rawUrl = getText(body.url);

    if (!rawUrl) {
      return invalid("Website URL is required");
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return invalid("Invalid website URL");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return invalid("Only HTTP and HTTPS URLs are supported");
    }

    input.url = parsedUrl.toString();
  }

  if (type === "file") {
    input.storageKey = getText(body.storageKey);
    input.originalFilename = getText(body.originalFilename);

    if (!input.storageKey || !input.originalFilename) {
      return invalid(
        "storageKey and originalFilename are required for file sources",
      );
    }
  }

  if (type === "text") {
    input.content = getText(body.content);

    if (!input.content) {
      return invalid("Text content is required");
    }

    if (input.content.length > 1_000_000) {
      return invalid("Text content exceeds the 1 MB limit", 413);
    }
  }

  return { success: true, data: input };
};
