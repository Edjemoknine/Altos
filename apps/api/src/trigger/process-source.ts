import { task, tasks } from "@trigger.dev/sdk";
import { and, asc, eq } from "drizzle-orm";

import { db } from "../db/index.ts";
import { documents, ingestionJobs } from "../db/schema.ts";

import {
  getIngestionJob,
  updateIngestionStatus,
} from "../services/ingestion/ingestion-job.service.ts";

import { ingestDocument } from "../services/ingestion/docs-ingestion.service.ts";

type ProcessSourcePayload = {
  jobId: string;
};

export const processSource = task({
  id: "process-source",

  retry: { maxAttempts: 3 },

  maxDuration: 3600,

  run: async ({ jobId }: ProcessSourcePayload, { ctx }) => {
    console.log(`Starting ingestion job: ${jobId}`, {
      attempt: ctx.attempt.number,
    });

    const result = await getIngestionJob(jobId);

    if (!result) {
      throw new Error(`Ingestion job not found: ${jobId}`);
    }

    const { job, source } = result;

    if (job.status === "completed") {
      return { success: true, skipped: true, jobId };
    }

    if (
      job.jobType !== "website_crawl" &&
      job.jobType !== "file_processing" &&
      job.jobType !== "text_processing"
    ) {
      throw new Error(`Unsupported ingestion job type: ${job.jobType}`);
    }

    tasks.onCancel(async () => {
      console.warn(`Ingestion job cancelled: ${jobId}`);

      const currentJob = await getIngestionJob(jobId);

      if (currentJob && currentJob.job.status !== "completed") {
        await updateIngestionStatus(
          currentJob.job.id,
          currentJob.source.id,
          "failed",
          "Ingestion task was cancelled",
        );
      }
    });

    try {
      // Website crawling already consumed the first 50% of progress.
      const progressOffset = job.jobType === "website_crawl" ? 50 : 0;
      const progressRange = 100 - progressOffset;

      await updateIngestionStatus(
        job.id,
        source.id,
        "processing",
        undefined,
        progressOffset,
      );

      // Retrieve every document belonging to this source.
      const sourceDocuments = await db
        .select({ id: documents.id })
        .from(documents)
        .where(
          and(
            eq(documents.sourceId, source.id),
            eq(documents.organizationId, job.organizationId),
            eq(documents.agentId, job.agentId),
          ),
        )
        .orderBy(asc(documents.createdAt));

      if (sourceDocuments.length === 0) {
        throw new Error(`No extracted documents found for source ${source.id}`);
      }

      console.log("Found documents for ingestion", {
        sourceId: source.id,
        totalDocuments: sourceDocuments.length,
      });

      let totalChunks = 0;
      let totalEmbeddings = 0;

      // Process documents sequentially.
      for (let i = 0; i < sourceDocuments.length; i++) {
        const document = sourceDocuments[i]!;

        console.log("Processing document", {
          documentId: document.id,
          documentNumber: i + 1,
          totalDocuments: sourceDocuments.length,
        });

        const ingestionResult = await ingestDocument({
          documentId: document.id,
          organizationId: job.organizationId,
          agentId: job.agentId,
          sourceId: source.id,
        });

        totalChunks += ingestionResult.totalChunks;
        totalEmbeddings += ingestionResult.totalEmbeddings;

        const documentProgress = Math.round(
          ((i + 1) / sourceDocuments.length) * progressRange,
        );

        const progress = progressOffset + documentProgress;

        await db
          .update(ingestionJobs)
          .set({ progress })
          .where(
            and(
              eq(ingestionJobs.id, job.id),
              eq(ingestionJobs.organizationId, job.organizationId),
            ),
          );

        console.log("Document ingestion completed", {
          documentId: document.id,
          progress,
        });
      }

      await updateIngestionStatus(job.id, source.id, "completed");

      return {
        success: true,
        jobId,
        sourceId: source.id,
        totalDocuments: sourceDocuments.length,
        totalChunks,
        totalEmbeddings,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown ingestion error";

      console.error("Source ingestion attempt failed", {
        jobId,
        attempt: ctx.attempt.number,
        error: message,
      });

      // Let Trigger.dev retry the task.
      // Final failure status is handled by onFailure.
      throw error;
    }
  },

  // Runs after Trigger.dev exhausts the configured retries.
  onFailure: async ({ payload, error }) => {
    const result = await getIngestionJob(payload.jobId);

    if (!result || result.job.status === "completed") {
      return;
    }

    await updateIngestionStatus(
      result.job.id,
      result.source.id,
      "failed",
      error instanceof Error ? error.message : String(error),
    );
  },
});
