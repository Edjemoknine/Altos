import type {
  CreateFileUploadInput,
  CreateSourceInput,
} from "../types/source.ts";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; status: 400 | 413 };

const MAX_TEXT_SIZE = 1_000_000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FILE_CONTENT_TYPES: Record<string, string> = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  txt: "text/plain",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getText = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const invalid = <T>(
  message: string,
  status: 400 | 413 = 400,
): ValidationResult<T> => ({
  success: false,
  message,
  status,
});

export const parseCreateSourceBody = (
  body: unknown,
): ValidationResult<CreateSourceInput> => {
  if (!isRecord(body)) {
    return invalid("Invalid request body");
  }

  const name = getText(body.name);
  const type = body.type;

  if (!name || (type !== "website" && type !== "text")) {
    return invalid("A valid name and source type are required");
  }

  const input: CreateSourceInput = {
    name,
    type,
    url: null,
    content: null,
    metadata: {},
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

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return invalid("Only HTTP and HTTPS URLs are supported");
    }

    input.url = parsedUrl.toString();
  }

  if (type === "text") {
    const content = getText(body.content);

    if (!content) {
      return invalid("Text content is required");
    }

    if (content.length > MAX_TEXT_SIZE) {
      return invalid("Text content exceeds the 1 MB limit", 413);
    }

    input.content = content;
  }

  return { success: true, data: input };
};

export type FileUploadValidationResult =
  | { success: true; data: CreateFileUploadInput }
  | { success: false; message: string; status: 400 | 413 };

export const parseCreateFileUploadBody = (
  body: unknown,
): FileUploadValidationResult => {
  if (!isRecord(body)) {
    return {
      success: false,
      message: "Invalid request body",
      status: 400,
    };
  }

  const name = getText(body.name);
  const originalFilename = getText(body.originalFilename);
  const contentType = getText(body.contentType);
  const size = body.size;

  if (!name || !originalFilename || !contentType) {
    return {
      success: false,
      message: "Name, filename and content type are required",
      status: 400,
    };
  }

  if (typeof size !== "number" || !Number.isSafeInteger(size) || size <= 0) {
    return {
      success: false,
      message: "Invalid file size",
      status: 400,
    };
  }

  if (size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: "File exceeds the 10 MB limit",
      status: 413,
    };
  }

  const extension = originalFilename.split(".").pop()?.toLowerCase();
  const expectedContentType =
    extension && Object.hasOwn(FILE_CONTENT_TYPES, extension)
      ? FILE_CONTENT_TYPES[extension]
      : null;

  if (!expectedContentType || contentType !== expectedContentType) {
    return {
      success: false,
      message: "Unsupported file type",
      status: 400,
    };
  }

  if (
    originalFilename.includes("/") ||
    originalFilename.includes("\\") ||
    originalFilename.includes("\0")
  ) {
    return {
      success: false,
      message: "Invalid filename",
      status: 400,
    };
  }

  return {
    success: true,
    data: {
      name,
      originalFilename,
      contentType,
      size,
    },
  };
};
