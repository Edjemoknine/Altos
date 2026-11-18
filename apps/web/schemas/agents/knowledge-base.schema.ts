import { z } from "zod";

export const scrapeWebsiteSchema = z.object({
  url: z.string().trim().min(1, "Enter a website URL.").refine((value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !!url.hostname;
    } catch {
      return false;
    }
  }, "Enter a valid HTTP or HTTPS website URL."),
});

const supportedDocumentExtensions = new Set([
  ".csv",
  ".doc",
  ".docx",
  ".pdf",
  ".txt",
]);
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const documentFileSchema = z.custom<File>(
  (value) =>
    typeof File !== "undefined" &&
    value instanceof File &&
    value.size > 0 &&
    value.size <= MAX_DOCUMENT_SIZE &&
    [...supportedDocumentExtensions].some((extension) =>
      value.name.toLowerCase().endsWith(extension),
    ),
  "Choose a PDF, DOC, DOCX, CSV, or TXT file under 10 MB.",
);
