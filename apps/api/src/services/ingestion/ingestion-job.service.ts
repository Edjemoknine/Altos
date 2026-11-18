import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { ingestionJobs, sources } from "../../db/schema.ts";

export async function getIngestionJob(jobId: string) {
  const [result] = await db
    .select({
      job: ingestionJobs,
      source: sources,
    })
    .from(ingestionJobs)
    .innerJoin(
      sources,
      and(
        eq(sources.id, ingestionJobs.sourceId),
        eq(sources.organizationId, ingestionJobs.organizationId),
        eq(sources.agentId, ingestionJobs.agentId),
      ),
    )
    .where(eq(ingestionJobs.id, jobId))
    .limit(1);

  return result ?? null;
}

export async function updateIngestionStatus(
  jobId: string,
  sourceId: string,
  status: "processing" | "completed" | "failed",
  errorMessage?: string,
) {
  const now = new Date();

  await db
    .update(ingestionJobs)
    .set({
      status,
      ...(status === "processing"
        ? { startedAt: now, errorMessage: null, completedAt: null }
        : {}),
      ...(status === "completed" || status === "failed"
        ? { completedAt: now }
        : {}),
      ...(status === "failed" ? { errorMessage } : {}),
    })
    .where(eq(ingestionJobs.id, jobId));

  await db.update(sources).set({ status }).where(eq(sources.id, sourceId));
}
