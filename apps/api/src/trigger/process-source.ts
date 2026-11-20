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

    tasks.onCancel(async () => {
      console.warn(`Ingestion job cancelled: ${jobId}`);

      const result = await getIngestionJob(jobId);

      if (result && result.job.status !== "completed") {
        await updateIngestionStatus(
          result.job.id,
          result.source.id,
          "failed",
          "Ingestion task was cancelled",
        );
      }
    });

    const result = await getIngestionJob(jobId);

    if (!result) {
      throw new Error(`Ingestion job not found: ${jobId}`);
    }

    const { job, source } = result;

    if (job.status === "completed") {
      return { success: true, skipped: true, jobId };
    }

    try {
      await updateIngestionStatus(
        job.id,
        source.id,
        "processing",
        undefined,
        0,
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

      const results = [];

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
          organizationId: source.organizationId,
          agentId: source.agentId,
          sourceId: source.id,
        });

        results.push(ingestionResult);

        const progress = Math.round(((i + 1) / sourceDocuments.length) * 100);

        // Update progress without resetting startedAt.
        await db
          .update(ingestionJobs)
          .set({ progress })
          .where(eq(ingestionJobs.id, job.id));

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
        totalChunks: results.reduce(
          (total, item) => total + item.totalChunks,
          0,
        ),
        totalEmbeddings: results.reduce(
          (total, item) => total + item.totalEmbeddings,
          0,
        ),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown ingestion error";

      try {
        await updateIngestionStatus(job.id, source.id, "failed", message);
      } catch (statusError) {
        console.error("Failed to update ingestion status:", statusError);
      }

      throw error;
    }
  },
});
