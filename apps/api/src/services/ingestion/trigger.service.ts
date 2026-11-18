import { tasks } from "@trigger.dev/sdk";
import type { processSource } from "../../trigger/process-source.ts";

export async function triggerSourceIngestion(jobId: string) {
  const run = await tasks.trigger<typeof processSource>("process-source", {
    jobId,
  });

  return run.id;
}
