import { tasks } from "@trigger.dev/sdk";

import type { processSource } from "../../trigger/process-source.ts";
import type { crawlWebsiteTask } from "../../trigger/crawl-website.ts";

export async function triggerSourceIngestion(jobId: string) {
  const run = await tasks.trigger<typeof processSource>(
    "process-source",
    { jobId },
    {
      idempotencyKey: `ingestion-${jobId}`,
    },
  );

  return run.id;
}

export async function triggerWebsiteCrawl(jobId: string) {
  const run = await tasks.trigger<typeof crawlWebsiteTask>(
    "crawl-website",
    { jobId },
    {
      idempotencyKey: `website-crawl-${jobId}`,
    },
  );

  return run.id;
}
