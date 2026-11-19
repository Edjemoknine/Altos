import { createHash, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { documents, sources } from "../../db/schema.ts";
import {
  DocumentExtractionError,
  extractDocumentText,
} from "../documents/document-extraction.service.ts";
import type { CreateFileUploadInput } from "../../types/source.ts";

import {
  createUploadUrl,
  deleteUploadedObject,
  getUploadedObject,
  getUploadedObjectBytes,
} from "./r2.service.ts";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const sanitizeFilename = (filename: string) =>
  filename
    .replace(/[^\w.-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 150) || "upload";

type CreateFileUploadOptions = {
  organizationId: string;
  agentId: string;
  input: CreateFileUploadInput;
};

export async function createFileUpload({
  organizationId,
  agentId,
  input,
}: CreateFileUploadOptions) {
  const sourceId = randomUUID();

  const storageKey = [
    "organizations",
    organizationId,
    "agents",
    agentId,
    "sources",
    sourceId,
    sanitizeFilename(input.originalFilename),
  ].join("/");

  const [source] = await db
    .insert(sources)
    .values({
      id: sourceId,
      organizationId,
      agentId,
      name: input.name,
      type: "file",
      storageKey,
      originalFilename: input.originalFilename,
      status: "pending",
      metadata: {
        contentType: input.contentType,
        size: input.size,
      },
    })
    .returning();

  if (!source) {
    throw new Error("Failed to create file source");
  }

  try {
    const uploadUrl = await createUploadUrl({
      storageKey,
      contentType: input.contentType,
    });

    return {
      source,
      uploadUrl,
      expiresIn: 600,
    };
  } catch (error) {
    // No file has been uploaded yet, so remove the reserved source.
    await db.delete(sources).where(eq(sources.id, sourceId));
    throw error;
  }
}

type SourceScope = {
  organizationId: string;
  agentId: string;
  sourceId: string;
};

async function markSourceProcessing(
  sourceId: string,
  scope: SourceScope,
  metadata: Record<string, unknown>,
  uploadedSize: number,
  uploadedContentType: string,
) {
  const [updatedSource] = await db
    .update(sources)
    .set({
      status: "processing",
      metadata: {
        ...metadata,
        uploadedSize,
        uploadedContentType,
        uploadedAt: new Date().toISOString(),
      },
    })
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.organizationId, scope.organizationId),
        eq(sources.agentId, scope.agentId),
        eq(sources.status, "pending"),
      ),
    )
    .returning();

  if (!updatedSource) {
    const [completedSource] = await db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.id, sourceId),
          eq(sources.organizationId, scope.organizationId),
          eq(sources.agentId, scope.agentId),
          eq(sources.status, "completed"),
        ),
      )
      .limit(1);

    if (completedSource) {
      return completedSource;
    }

    throw new Error("Failed to confirm file upload");
  }

  return updatedSource;
}

async function removeDuplicateUpload(storageKey: string, scope: SourceScope) {
  await deleteUploadedObject(storageKey);
  await db
    .delete(sources)
    .where(
      and(
        eq(sources.id, scope.sourceId),
        eq(sources.organizationId, scope.organizationId),
        eq(sources.agentId, scope.agentId),
      ),
    );
}

export async function createSourceUploadUrl({
  organizationId,
  agentId,
  sourceId,
}: SourceScope) {
  const [source] = await db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.organizationId, organizationId),
        eq(sources.agentId, agentId),
        eq(sources.type, "file"),
        eq(sources.status, "pending"),
      ),
    )
    .limit(1);

  if (!source || !source.storageKey) {
    return null;
  }

  const metadata = source.metadata as Record<string, unknown>;
  const contentType = metadata.contentType;

  if (typeof contentType !== "string") {
    throw new Error("File content type is missing");
  }

  const uploadUrl = await createUploadUrl({
    storageKey: source.storageKey,
    contentType,
  });

  return {
    source,
    uploadUrl,
    expiresIn: 600,
  };
}

export async function completeFileUpload(scope: SourceScope) {
  const [source] = await db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.id, scope.sourceId),
        eq(sources.organizationId, scope.organizationId),
        eq(sources.agentId, scope.agentId),
        eq(sources.type, "file"),
      ),
    )
    .limit(1);

  if (!source || !source.storageKey) {
    return { success: false as const, reason: "not_found" as const };
  }

  if (source.status === "processing" || source.status === "completed") {
    const [document] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.sourceId, source.id),
          eq(documents.organizationId, scope.organizationId),
          eq(documents.agentId, scope.agentId),
        ),
      )
      .limit(1);

    if (document) {
      return { success: true as const, source };
    }
  }

  if (source.status !== "pending") {
    return {
      success: false as const,
      reason: "invalid_status" as const,
    };
  }

  const metadata = source.metadata as Record<string, unknown>;
  const expectedSize = metadata.size;
  const expectedContentType = metadata.contentType;

  if (
    typeof expectedSize !== "number" ||
    typeof expectedContentType !== "string" ||
    !source.originalFilename
  ) {
    throw new Error("Invalid file metadata");
  }

  let uploadedObject;

  try {
    uploadedObject = await getUploadedObject(source.storageKey);
  } catch (error) {
    const name = (error as { name?: string }).name;

    if (name === "NotFound" || name === "NoSuchKey") {
      return {
        success: false as const,
        reason: "not_uploaded" as const,
      };
    }

    throw error;
  }

  const actualSize = uploadedObject.ContentLength;
  const actualContentType = uploadedObject.ContentType;

  if (
    typeof actualSize !== "number" ||
    actualSize > MAX_FILE_SIZE ||
    actualSize !== expectedSize ||
    actualContentType !== expectedContentType
  ) {
    await deleteUploadedObject(source.storageKey);

    return {
      success: false as const,
      reason: "invalid_file" as const,
    };
  }

  const uploadedBytes = await getUploadedObjectBytes(source.storageKey);

  if (!uploadedBytes) {
    await deleteUploadedObject(source.storageKey);

    return {
      success: false as const,
      reason: "invalid_file" as const,
    };
  }

  let content: string;

  try {
    content = await extractDocumentText(source.originalFilename, uploadedBytes);
  } catch (error) {
    if (error instanceof DocumentExtractionError) {
      return {
        success: false as const,
        reason: "extraction_failed" as const,
        message: error.message,
      };
    }

    throw error;
  }

  if (content.trim().length === 0) {
    return {
      success: false as const,
      reason: "extraction_failed" as const,
      message: "No text could be extracted from this document.",
    };
  }

  if (Buffer.byteLength(content, "utf8") > MAX_FILE_SIZE) {
    return {
      success: false as const,
      reason: "extraction_failed" as const,
      message: "Extracted text exceeds the 10 MB limit.",
    };
  }

  const contentHash = createHash("sha256").update(content).digest("hex");
  const [sameSourceDocument] = await db
    .select({ id: documents.id, sourceId: documents.sourceId })
    .from(documents)
    .where(
      and(
        eq(documents.agentId, scope.agentId),
        eq(documents.contentHash, contentHash),
        eq(documents.sourceId, source.id),
      ),
    )
    .limit(1);

  if (sameSourceDocument) {
    const updatedSource = await markSourceProcessing(
      source.id,
      scope,
      metadata,
      actualSize,
      expectedContentType,
    );

    return { success: true as const, source: updatedSource };
  }

  const [existingDocument] = await db
    .select({ id: documents.id, sourceId: documents.sourceId })
    .from(documents)
    .where(
      and(
        eq(documents.agentId, scope.agentId),
        eq(documents.contentHash, contentHash),
      ),
    )
    .limit(1);

  if (existingDocument) {
    await removeDuplicateUpload(source.storageKey, scope);

    return {
      success: false as const,
      reason: "duplicate" as const,
      message: "An identical document already exists for this agent.",
    };
  }

  const [document] = await db
    .insert(documents)
    .values({
      organizationId: scope.organizationId,
      agentId: scope.agentId,
      sourceId: source.id,
      externalId: "uploaded-file",
      title: source.name,
      content,
      contentHash,
      dedupeHash: contentHash,
      metadata: {
        originalFilename: source.originalFilename,
        contentType: expectedContentType,
      },
    })
    .onConflictDoNothing()
    .returning({ id: documents.id });

  if (!document) {
    const [sameSourceDocument] = await db
      .select({ sourceId: documents.sourceId })
      .from(documents)
      .where(
        and(
          eq(documents.agentId, scope.agentId),
          eq(documents.contentHash, contentHash),
          eq(documents.sourceId, source.id),
        ),
      )
      .limit(1);

    if (sameSourceDocument) {
      const updatedSource = await markSourceProcessing(
        source.id,
        scope,
        metadata,
        actualSize,
        expectedContentType,
      );

      return { success: true as const, source: updatedSource };
    }

    const [duplicateDocument] = await db
      .select({ sourceId: documents.sourceId })
      .from(documents)
      .where(
        and(
          eq(documents.agentId, scope.agentId),
          eq(documents.contentHash, contentHash),
        ),
      )
      .limit(1);

    if (!duplicateDocument) {
      throw new Error("Failed to create uploaded document");
    }

    if (duplicateDocument.sourceId !== source.id) {
      await removeDuplicateUpload(source.storageKey, scope);

      return {
        success: false as const,
        reason: "duplicate" as const,
        message: "An identical document already exists for this agent.",
      };
    }
  }

  const updatedSource = await markSourceProcessing(
    source.id,
    scope,
    metadata,
    actualSize,
    expectedContentType,
  );

  return {
    success: true as const,
    source: updatedSource,
  };
}

export async function retryFailedFileUpload(scope: SourceScope) {
  const [source] = await db
    .select({
      id: sources.id,
      type: sources.type,
      status: sources.status,
    })
    .from(sources)
    .where(
      and(
        eq(sources.id, scope.sourceId),
        eq(sources.organizationId, scope.organizationId),
        eq(sources.agentId, scope.agentId),
      ),
    )
    .limit(1);

  if (!source) {
    return { success: false as const, reason: "not_found" as const };
  }

  if (source.type !== "file") {
    return { success: false as const, reason: "not_file" as const };
  }

  if (source.status !== "failed") {
    return { success: false as const, reason: "not_failed" as const };
  }

  const [retryingSource] = await db
    .update(sources)
    .set({ status: "pending" })
    .where(
      and(
        eq(sources.id, scope.sourceId),
        eq(sources.organizationId, scope.organizationId),
        eq(sources.agentId, scope.agentId),
        eq(sources.status, "failed"),
      ),
    )
    .returning({ id: sources.id });

  if (!retryingSource) {
    return { success: false as const, reason: "not_failed" as const };
  }

  let result: Awaited<ReturnType<typeof completeFileUpload>>;

  try {
    result = await completeFileUpload(scope);
  } catch (error) {
    await db
      .update(sources)
      .set({ status: "failed" })
      .where(
        and(
          eq(sources.id, scope.sourceId),
          eq(sources.organizationId, scope.organizationId),
          eq(sources.agentId, scope.agentId),
          eq(sources.status, "pending"),
        ),
      );
    throw error;
  }

  if (!result.success) {
    await db
      .update(sources)
      .set({ status: "failed" })
      .where(
        and(
          eq(sources.id, scope.sourceId),
          eq(sources.organizationId, scope.organizationId),
          eq(sources.agentId, scope.agentId),
          eq(sources.status, "pending"),
        ),
      );
  }

  return result;
}
