import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { documents, sources } from "../../db/schema.ts";

import type { CrawledPage } from "./website-crawler.service.ts";

type PersistWebsiteDocumentsOptions = {
  organizationId: string;
  agentId: string;
  sourceId: string;
  pages: CrawledPage[];
};

export type PersistWebsiteDocumentsResult = {
  totalPages: number;
  created: number;
  updated: number;
  unchanged: number;
};

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function createPageDedupeHash(agentId: string, url: string): string {
  return createHash("sha256").update(`${agentId}:${url}`).digest("hex");
}

function normalizePageUrl(value: string): string {
  const url = new URL(value);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid page URL protocol.");
  }

  if (url.username || url.password) {
    throw new Error("Page URLs cannot contain credentials.");
  }

  url.hash = "";

  return url.toString();
}

export async function persistWebsiteDocuments({
  organizationId,
  agentId,
  sourceId,
  pages,
}: PersistWebsiteDocumentsOptions): Promise<PersistWebsiteDocumentsResult> {
  const [source] = await db
    .select({
      id: sources.id,
      url: sources.url,
      type: sources.type,
    })
    .from(sources)
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.organizationId, organizationId),
        eq(sources.agentId, agentId),
      ),
    )
    .limit(1);

  if (!source) {
    throw new Error("Website source not found.");
  }

  if (source.type !== "website" || !source.url) {
    throw new Error("The provided source is not a valid website source.");
  }

  const sourceOrigin = new URL(source.url).origin;

  // Deduplicate pages by URL before persisting.
  const uniquePages = new Map<string, CrawledPage>();

  for (const page of pages) {
    const url = normalizePageUrl(page.url);

    if (new URL(url).origin !== sourceOrigin) {
      throw new Error(`Page URL is outside the source origin: ${url}`);
    }

    const content = page.content.trim();

    if (!content) {
      continue;
    }

    uniquePages.set(url, {
      ...page,
      url,
      content,
      title: page.title.trim() || url,
    });
  }

  const normalizedPages = [...uniquePages.values()];

  if (normalizedPages.length === 0) {
    return {
      totalPages: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
    };
  }

  const existingDocuments = await db
    .select({
      id: documents.id,
      externalId: documents.externalId,
      contentHash: documents.contentHash,
    })
    .from(documents)
    .where(
      and(
        eq(documents.sourceId, sourceId),
        eq(documents.agentId, agentId),
        eq(documents.organizationId, organizationId),
      ),
    );

  const existingByUrl = new Map(
    existingDocuments
      .filter((document) => document.externalId !== null)
      .map((document) => [document.externalId!, document]),
  );

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const page of normalizedPages) {
    const contentHash = hashContent(page.content);
    const dedupeHash = createPageDedupeHash(agentId, page.url);

    const existingDocument = existingByUrl.get(page.url);

    if (existingDocument) {
      // Only update the document content when it actually changed.
      const contentChanged = existingDocument.contentHash !== contentHash;

      await db
        .update(documents)
        .set({
          title: page.title,
          url: page.url,
          ...(contentChanged
            ? {
                content: page.content,
                contentHash,
              }
            : {}),
          metadata: page.metadata,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(documents.id, existingDocument.id),
            eq(documents.sourceId, sourceId),
            eq(documents.agentId, agentId),
            eq(documents.organizationId, organizationId),
          ),
        );

      if (contentChanged) {
        updated++;
      } else {
        unchanged++;
      }

      continue;
    }

    await db.insert(documents).values({
      organizationId,
      agentId,
      sourceId,
      externalId: page.url,
      title: page.title,
      url: page.url,
      content: page.content,
      contentHash,
      dedupeHash,
      metadata: page.metadata,
    });

    created++;
  }

  return {
    totalPages: normalizedPages.length,
    created,
    updated,
    unchanged,
  };
}
