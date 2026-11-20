import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { ingestionJobs } from "../../db/schema.ts";
import {
  triggerSourceIngestion,
  triggerWebsiteCrawl,
} from "./trigger.service.ts";

import type { IngestionJobType } from "../../db/schema.ts";

type CreateIngestionJobOptions = {
  organizationId: string;
  agentId: string;
  sourceId: string;
  jobType: IngestionJobType;
};

export async function createAndDispatchIngestionJob({
  organizationId,
  agentId,
  sourceId,
  jobType,
}: CreateIngestionJobOptions) {
  const [latestJob] = await db
    .select()
    .from(ingestionJobs)
    .where(
      and(
        eq(ingestionJobs.organizationId, organizationId),
        eq(ingestionJobs.agentId, agentId),
        eq(ingestionJobs.sourceId, sourceId),
        eq(ingestionJobs.jobType, jobType),
      ),
    )
    .orderBy(desc(ingestionJobs.createdAt))
    .limit(1);

  // Reuse an existing job instead of creating duplicate work.
  if (latestJob?.status === "completed" || latestJob?.status === "processing") {
    return latestJob;
  }

  const job =
    latestJob?.status === "pending"
      ? latestJob
      : await createIngestionJob({
          organizationId,
          agentId,
          sourceId,
          jobType,
        });

  // Dispatch the correct task for the ingestion type.
  const triggerRunId =
    jobType === "website_crawl"
      ? await triggerWebsiteCrawl(job.id)
      : await triggerSourceIngestion(job.id);

  await db
    .update(ingestionJobs)
    .set({ triggerRunId })
    .where(
      and(
        eq(ingestionJobs.id, job.id),
        eq(ingestionJobs.organizationId, organizationId),
      ),
    );

  return {
    ...job,
    triggerRunId,
  };
}

async function createIngestionJob({
  organizationId,
  agentId,
  sourceId,
  jobType,
}: CreateIngestionJobOptions) {
  const [job] = await db
    .insert(ingestionJobs)
    .values({
      organizationId,
      agentId,
      sourceId,
      jobType,
      status: "pending",
      progress: 0,
    })
    .returning();

  if (!job) {
    throw new Error("Failed to create ingestion job");
  }

  return job;
}
