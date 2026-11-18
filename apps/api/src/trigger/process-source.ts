import { task } from "@trigger.dev/sdk";

import {
  getIngestionJob,
  updateIngestionStatus,
} from "../services/ingestion/ingestion-job.service.ts";

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

    // A completed job should never be processed again.
    if (job.status === "completed") {
      console.log(`Job ${jobId} is already completed`);

      return {
        success: true,
        skipped: true,
        jobId,
      };
    }

    try {
      await updateIngestionStatus(job.id, source.id, "processing");

      console.log("Processing source:", {
        sourceId: source.id,
        sourceType: source.type,
        organizationId: source.organizationId,
        agentId: source.agentId,
      });

      // Source processing will be implemented next:
      // website -> website loader
      // file    -> file loader
      // text    -> existing document content

      return {
        success: true,
        jobId,
        sourceId: source.id,
        status: "processing",
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
