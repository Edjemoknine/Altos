import type { SourceType } from "../db/schemas/source.ts";

export type CreateSourceInput = {
  name: string;
  type: "website" | "text";
  url: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
};

export type CreateFileUploadInput = {
  name: string;
  originalFilename: string;
  contentType: string;
  size: number;
};
