import { and, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { ingestionJobs } from "../../db/schema.ts";
import { triggerSourceIngestion } from "./trigger.service.ts";

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
  if (latestJob?.status === "completed") {
    return latestJob;
  }

  if (latestJob?.status === "processing") {
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

  const triggerRunId = await triggerSourceIngestion(job.id);

  await db
    .update(ingestionJobs)
    .set({ triggerRunId })
    .where(eq(ingestionJobs.id, job.id));

  return {
    ...job,
    triggerRunId,
  };
}

async function createIngestionJob({
  organizationId,
  agentId,
  sourceId,
}: CreateIngestionJobOptions) {
  const [job] = await db
    .insert(ingestionJobs)
    .values({
      organizationId,
      agentId,
      sourceId,
      jobType: "file_processing",
      status: "pending",
      progress: 0,
    })
    .returning();

  if (!job) {
    throw new Error("Failed to create ingestion job");
  }

  return job;
}
