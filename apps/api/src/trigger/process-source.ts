import { task } from "@trigger.dev/sdk";

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

    // Next:
    // 1. Load ingestion job from PostgreSQL.
    // 2. Validate job and source.
    // 3. Update status to processing.
    // 4. Load source content.
    // 5. Extract, chunk and embed documents.
    // 6. Persist documents and chunks.
    // 7. Mark job and source as completed.

    return {
      success: true,
      jobId,
    };
  },
});
