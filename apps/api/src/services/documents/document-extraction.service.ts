import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { parse } from "csv-parse/sync";

export class DocumentExtractionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DocumentExtractionError";
  }
}

const decodeUtf8 = (bytes: Uint8Array) =>
  new TextDecoder("utf-8", { fatal: true }).decode(bytes);

export async function extractDocumentText(
  filename: string,
  bytes: Uint8Array,
): Promise<string> {
  const extension = filename.split(".").pop()?.toLowerCase();
  const blob = new Blob([Uint8Array.from(bytes)]);

  try {
    switch (extension) {
      case "txt":
        return decodeUtf8(bytes);
      case "csv": {
        const rows = parse<Record<string, string>>(decodeUtf8(bytes), {
          bom: true,
          columns: true,
          skip_empty_lines: true,
        });

        return rows
          .map((row) =>
            Object.entries(row)
              .map(([column, value]) => `${column}: ${value}`)
              .join("\n"),
          )
          .join("\n\n");
      }
      case "pdf":
        return (await new PDFLoader(blob, { splitPages: false }).load())
          .map((document) => document.pageContent)
          .join("\n\n");
      case "doc":
        return (await new DocxLoader(blob, { type: "doc" }).load())
          .map((document) => document.pageContent)
          .join("\n\n");
      case "docx":
        return (await new DocxLoader(blob).load())
          .map((document) => document.pageContent)
          .join("\n\n");
      default:
        throw new DocumentExtractionError("Unsupported document format.");
    }
  } catch (error) {
    if (error instanceof DocumentExtractionError) {
      throw error;
    }

    throw new DocumentExtractionError(
      "Unable to extract text. Verify the file is valid and not encrypted.",
      { cause: error },
    );
  }
}
