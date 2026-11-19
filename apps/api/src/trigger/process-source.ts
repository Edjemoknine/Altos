import { task } from "@trigger.dev/sdk";
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

  run: async ({ jobId }: ProcessSourcePayload) => {
    console.log(`Starting ingestion job: ${jobId}`);

    const result = await getIngestionJob(jobId);

    if (!result) {
      throw new Error(`Ingestion job not found: ${jobId}`);
    }

    const { job, source } = result;

    if (job.status === "completed") {
      return {
        success: true,
        skipped: true,
        jobId,
      };
    }

    try {
      await updateIngestionStatus(job.id, source.id, "processing");

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

      const result = await ingestDocument({
        documentId: document.id,
        organizationId: source.organizationId,
        agentId: source.agentId,
        sourceId: source.id,
      });

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
