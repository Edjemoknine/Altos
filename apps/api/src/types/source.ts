import type { SourceType } from "../db/schemas/source.ts";

export type CreateSourceInput = {
  name: string;
  type: SourceType;
  url: string | null;
  storageKey: string | null;
  originalFilename: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
};
