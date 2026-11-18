import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";

import type { CreateSourceInput } from "../types/source.ts";
import { db } from "../db/index.ts";
import { agents, documents, ingestionJobs, sources } from "../db/schema.ts";
import { triggerSourceIngestion } from "../services/ingestion/trigger.service.ts";

export const getAgent = async (agentId: string, organizationId: string) => {
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  return agent ?? null;
};

const getJobType = (type: CreateSourceInput["type"]) => {
  switch (type) {
    case "website":
      return "website_crawl" as const;
    case "file":
      return "file_processing" as const;
    case "text":
      return "text_processing" as const;
  }
};

type CreateSourceOptions = {
  organizationId: string;
  agentId: string;
  input: CreateSourceInput;
};

export const createSourceWithIngestion = async ({
  organizationId,
  agentId,
  input,
}: CreateSourceOptions) => {
  let sourceId: string | undefined;

  try {
    const [source] = await db
      .insert(sources)
      .values({
        organizationId,
        agentId,
        name: input.name,
        type: input.type,
        url: input.url,
        storageKey: input.storageKey,
        originalFilename: input.originalFilename,
        metadata: input.metadata,
      })
      .returning();

    if (!source) {
      throw new Error("Failed to create source");
    }

    sourceId = source.id;

    if (input.type === "text" && input.content) {
      const contentHash = createHash("sha256")
        .update(input.content)
        .digest("hex");

      await db.insert(documents).values({
        organizationId,
        agentId,
        sourceId: source.id,
        title: input.name,
        content: input.content,
        contentHash,
        metadata: input.metadata,
      });
    }

    const [job] = await db
      .insert(ingestionJobs)
      .values({
        organizationId,
        agentId,
        sourceId: source.id,
        jobType: getJobType(input.type),
      })
      .returning();

    if (!job) {
      throw new Error("Failed to create ingestion job");
    }

    // Trigger.dev: start background ingestion
    let triggerRunId: string;

    try {
      triggerRunId = await triggerSourceIngestion(job.id);
    } catch (error) {
      console.error("Failed to trigger ingestion:", error);

      await db
        .update(ingestionJobs)
        .set({
          status: "failed",
          errorMessage: "Failed to dispatch ingestion task",
          completedAt: new Date(),
        })
        .where(eq(ingestionJobs.id, job.id));

      await db
        .update(sources)
        .set({ status: "failed" })
        .where(eq(sources.id, source.id));

      return {
        success: false as const,
        sourceId: source.id,
        jobId: job.id,
      };
    }

    // Save Trigger.dev run ID separately.
    // The task may already be running if this update fails.
    try {
      await db
        .update(ingestionJobs)
        .set({ triggerRunId })
        .where(eq(ingestionJobs.id, job.id));
    } catch (error) {
      console.error("Failed to save Trigger.dev run ID:", error);
    }

    return {
      success: true as const,
      source,
      job: {
        ...job,
        triggerRunId,
      },
    };
  } catch (error) {
    if (sourceId) {
      try {
        await db.delete(sources).where(eq(sources.id, sourceId));
      } catch (cleanupError) {
        console.error(
          "Failed to clean up source after creation error:",
          cleanupError,
        );
      }
    }

    throw error;
  }
};
