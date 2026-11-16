import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { Context } from "hono";

import { db } from "../db/index.ts";
import { agents, sources, documents, ingestionJobs } from "../db/schema.ts";
import type { OrganizationEnv } from "../middlewares/organization.middleware.ts";
import { publishIngestionJob } from "../services/ingestion/queue.service.ts";

type SourceContext = Context<OrganizationEnv>;

type SourceType = "website" | "file" | "text";

type CreateSourceBody = {
  name: string;
  type: SourceType;
  url?: string;
  storageKey?: string;
  originalFilename?: string;
  content?: string;
  metadata?: Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getText = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const getSourceType = (value: unknown): SourceType | null => {
  if (value === "website" || value === "file" || value === "text") {
    return value;
  }

  return null;
};

const getAgent = async (agentId: string, organizationId: string) => {
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  return agent ?? null;
};

const getJobType = (type: SourceType) => {
  switch (type) {
    case "website":
      return "website_crawl" as const;
    case "file":
      return "file_processing" as const;
    case "text":
      return "text_processing" as const;
  }
};

// GET /organizations/:organizationId/agents/:agentId/sources
export const listSources = async (c: SourceContext) => {
  const { organizationId, agentId } = c.req.param();

  if (!organizationId || !agentId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  const agent = await getAgent(agentId, organizationId);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  const result = await db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.organizationId, organizationId),
        eq(sources.agentId, agentId),
      ),
    )
    .orderBy(desc(sources.createdAt));

  return c.json({
    success: true,
    data: result,
  });
};

// GET /organizations/:organizationId/agents/:agentId/sources/:sourceId
export const getSource = async (c: SourceContext) => {
  const { organizationId, agentId, sourceId } = c.req.param();

  if (!organizationId || !agentId || !sourceId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  const [source] = await db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.organizationId, organizationId),
        eq(sources.agentId, agentId),
      ),
    )
    .limit(1);

  if (!source) {
    return c.json({ success: false, message: "Source not found" }, 404);
  }

  return c.json({
    success: true,
    data: source,
  });
};

// POST /organizations/:organizationId/agents/:agentId/sources
export const createSource = async (c: SourceContext) => {
  const { organizationId, agentId } = c.req.param();

  if (!organizationId || !agentId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  const agent = await getAgent(agentId, organizationId);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: "Invalid JSON body" }, 400);
  }

  if (!isRecord(body)) {
    return c.json({ success: false, message: "Invalid request body" }, 400);
  }

  const name = getText(body.name);
  const type = getSourceType(body.type);

  if (!name || !type) {
    return c.json(
      { success: false, message: "A valid name and source type are required" },
      400,
    );
  }

  const metadata = isRecord(body.metadata) ? body.metadata : {};

  let url: string | null = null;
  let storageKey: string | null = null;
  let originalFilename: string | null = null;
  let content: string | null = null;

  if (type === "website") {
    const rawUrl = getText(body.url);

    if (!rawUrl) {
      return c.json(
        { success: false, message: "Website URL is required" },
        400,
      );
    }

    try {
      const parsedUrl = new URL(rawUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return c.json(
          { success: false, message: "Only HTTP and HTTPS URLs are supported" },
          400,
        );
      }

      url = parsedUrl.toString();
    } catch {
      return c.json({ success: false, message: "Invalid website URL" }, 400);
    }
  }

  if (type === "file") {
    storageKey = getText(body.storageKey);
    originalFilename = getText(body.originalFilename);

    if (!storageKey || !originalFilename) {
      return c.json(
        {
          success: false,
          message:
            "storageKey and originalFilename are required for file sources",
        },
        400,
      );
    }
  }

  if (type === "text") {
    content = getText(body.content);

    if (!content) {
      return c.json(
        { success: false, message: "Text content is required" },
        400,
      );
    }

    if (content.length > 1_000_000) {
      return c.json(
        { success: false, message: "Text content exceeds the 1 MB limit" },
        413,
      );
    }
  }

  // Neon HTTP does not support transactions. If a later insert fails,
  // clean up the source so we don't leave incomplete ingestion records.
  let sourceId: string | undefined;

  try {
    const [source] = await db
      .insert(sources)
      .values({
        organizationId,
        agentId,
        name,
        type,
        url,
        storageKey,
        originalFilename,
        metadata,
      })
      .returning();

    if (!source) {
      throw new Error("Failed to create source");
    }

    sourceId = source.id;

    // Pasted text is stored as a document.
    // The worker will split it into chunks and generate embeddings.
    if (type === "text" && content) {
      const contentHash = createHash("sha256").update(content).digest("hex");

      await db.insert(documents).values({
        organizationId,
        agentId,
        sourceId: source.id,
        title: name,
        content,
        contentHash,
        metadata,
      });
    }

    const [job] = await db
      .insert(ingestionJobs)
      .values({
        organizationId,
        agentId,
        sourceId: source.id,
        jobType: getJobType(type),
      })
      .returning();

    if (!job) {
      throw new Error("Failed to create ingestion job");
    }

    try {
      const queueJobId = await publishIngestionJob(job.id);

      await db
        .update(ingestionJobs)
        .set({ queueJobId })
        .where(eq(ingestionJobs.id, job.id));
    } catch {
      // Keep the job record for inspection or a future retry.
      await db
        .update(ingestionJobs)
        .set({
          status: "failed",
          errorMessage: "Failed to dispatch ingestion job",
          completedAt: new Date(),
        })
        .where(eq(ingestionJobs.id, job.id));

      await db
        .update(sources)
        .set({ status: "failed" })
        .where(eq(sources.id, source.id));

      return c.json(
        {
          success: false,
          message:
            "Source was created, but its ingestion job could not be queued",
          data: { sourceId: source.id, jobId: job.id },
        },
        503,
      );
    }

    return c.json(
      {
        success: true,
        message: "Source created and ingestion job queued",
        data: {
          source,
          job: {
            id: job.id,
            status: job.status,
          },
        },
      },
      201,
    );
  } catch (error) {
    if (sourceId) {
      await db
        .delete(sources)
        .where(eq(sources.id, sourceId))
        .catch(() => {});
    }

    console.error("Create source error:", error);

    return c.json({ success: false, message: "Failed to create source" }, 500);
  }
};

// DELETE /organizations/:organizationId/agents/:agentId/sources/:sourceId
export const deleteSource = async (c: SourceContext) => {
  const { organizationId, agentId, sourceId } = c.req.param();

  if (!organizationId || !agentId || !sourceId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  const [deletedSource] = await db
    .delete(sources)
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.organizationId, organizationId),
        eq(sources.agentId, agentId),
      ),
    )
    .returning({ id: sources.id });

  if (!deletedSource) {
    return c.json({ success: false, message: "Source not found" }, 404);
  }

  return c.json({
    success: true,
    message: "Source deleted successfully",
  });
};
