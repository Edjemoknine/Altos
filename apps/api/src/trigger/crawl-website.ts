import { task } from "@trigger.dev/sdk";
import { eq, and } from "drizzle-orm";
import {
  getIngestionJob,
  updateIngestionStatus,
} from "../services/ingestion/ingestion-job.service.ts";
import { db } from "../db/index.ts";
import { crawlWebsite } from "../services/crawling/website-crawler.service.ts";
import { persistWebsiteDocuments } from "../services/crawling/website-document.service.ts";
import { triggerSourceIngestion } from "../services/ingestion/trigger.service.ts";
import { sources } from "../db/schema.ts";
import { error } from "better-auth/api";

type CrawlWebsitePayload = {
  jobId: string;
};

export const crawlWebsiteTask = task({
  id: "crawl-website",

  retry: {
    maxAttempts: 3,
  },

  maxDuration: 3600,

  run: async ({ jobId }: CrawlWebsitePayload) => {
    // 1. Retrieve the ingestion job.
    const result = await getIngestionJob(jobId);

    if (!result) {
      throw new Error(`Ingestion job not found: ${jobId}`);
    }

    if (result.job.status === "completed") {
      return {
        success: true,
        skipped: true,
        message: "Ingestion job is already completed.",
      };
    }

    if (result.job.jobType !== "website_crawl") {
      throw new Error("Invalid job type for website crawling.");
    }

    // 2. Retrieve and validate the website source.
    const [source] = await db
      .select({
        id: sources.id,
        url: sources.url,
        type: sources.type,
      })
      .from(sources)
      .where(
        and(
          eq(sources.id, result.job.sourceId),
          eq(sources.organizationId, result.job.organizationId),
          eq(sources.agentId, result.job.agentId),
        ),
      )
      .limit(1);

    if (!source || source.type !== "website" || !source.url) {
      throw new Error("Website source not found or invalid.");
    }

    // 3. Mark the ingestion job as processing.
    await updateIngestionStatus(
      jobId,
      result.job.sourceId,
      "processing",
      undefined,
      10,
    );

    // 4. Crawl the website.
    const crawlResult = await crawlWebsite(source.url, {
      maxPages: 50,
      maxDepth: 3,
    });

    if (crawlResult.pages.length === 0) {
      throw new Error(
        `No pages were extracted from the website. Failed URLs: ${crawlResult.failedUrls.length}`,
      );
    }

    // 5. Persist the extracted pages as documents.
    const persistenceResult = await persistWebsiteDocuments({
      organizationId: result.job.organizationId,
      agentId: result.job.agentId,
      sourceId: result.job.sourceId,
      pages: crawlResult.pages,
    });

    if (persistenceResult.totalPages === 0) {
      throw new Error("The crawl produced no valid documents.");
    }

    // 6. Update progress after document persistence.
    await updateIngestionStatus(
      jobId,
      result.job.sourceId,
      "processing",
      undefined,
      50,
    );

    // 7. Trigger document chunking and embedding.
    const processRunId = await triggerSourceIngestion(jobId);

    return {
      success: true,
      jobId,
      sourceId: result.job.sourceId,
      crawledPages: crawlResult.pages.length,
      failedPages: crawlResult.failedUrls.length,
      ...persistenceResult,
      processRunId,
    };
  },

  // Called after all retry attempts have failed.
  onFailure: async ({ payload, error }) => {
    const result = await getIngestionJob(payload.jobId);

    if (!result || result.job.status === "completed") {
      return;
    }

    await updateIngestionStatus(
      payload.jobId,
      result.job.sourceId,
      "failed",
      error?.message || "An unknown error occurred during website crawling.",
    );
  },
});
