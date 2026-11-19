import { task, tasks } from "@trigger.dev/sdk";
import { and, eq } from "drizzle-orm";

import { db } from "../db/index.ts";
import { documents } from "../db/schema.ts";

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

  retry: {
    maxAttempts: 3,
  },

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

    console.log("Loading ingestion job");
    const result = await getIngestionJob(jobId);

    if (!result) {
      throw new Error(`Ingestion job not found: ${jobId}`);
    }

    const { job, source } = result;
    console.log("Loaded ingestion job", { status: job.status });

    if (job.status === "completed") {
      return {
        success: true,
        skipped: true,
        jobId,
      };
    }

    try {
      console.log("Marking ingestion job as processing");
      await updateIngestionStatus(job.id, source.id, "processing");

      console.log("Loading extracted document");
      const [document] = await db
        .select({ id: documents.id })
        .from(documents)
        .where(
          and(
            eq(documents.sourceId, source.id),
            eq(documents.organizationId, job.organizationId),
            eq(documents.agentId, job.agentId),
          ),
        )
        .limit(1);

      if (!document) {
        throw new Error(`No extracted document found for source ${source.id}`);
      }

      console.log("Loaded extracted document", { documentId: document.id });
      const result = await ingestDocument({
        documentId: document.id,
        organizationId: source.organizationId,
        agentId: source.agentId,
        sourceId: source.id,
      });

      console.log("Marking ingestion job as completed");
      await updateIngestionStatus(job.id, source.id, "completed");

      console.log("Document ingestion completed:", result);

      return {
        success: true,
        jobId,
        sourceId: source.id,
        ...result,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown ingestion error";

      console.error("Ingestion failed:", message);

      try {
        await updateIngestionStatus(job.id, source.id, "failed", message);
      } catch (statusError) {
        console.error("Failed to update ingestion status:", statusError);
      }

      throw error;
    }
  },
});
