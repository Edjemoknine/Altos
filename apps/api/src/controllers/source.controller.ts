import { and, desc, eq } from "drizzle-orm";
import type { Context } from "hono";

import { db } from "../db/index.ts";
import { sources } from "../db/schema.ts";
import {
  createSourceWithIngestion,
  getAgent,
} from "../helpers/source.service.ts";
import type { OrganizationEnv } from "../middlewares/organization.middleware.ts";
import { parseCreateSourceBody } from "../validators/source.validation.ts";

type SourceContext = Context<OrganizationEnv>;

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

  const validation = parseCreateSourceBody(body);

  if (!validation.success) {
    return c.json(
      { success: false, message: validation.message },
      validation.status,
    );
  }

  try {
    const result = await createSourceWithIngestion({
      organizationId,
      agentId,
      input: validation.data,
    });

    if (!result.success) {
      return c.json(
        {
          success: false,
          message:
            "Source was created, but its ingestion job could not be queued",
          data: { sourceId: result.sourceId, jobId: result.jobId },
        },
        503,
      );
    }

    return c.json(
      {
        success: true,
        message: "Source created and ingestion job queued",
        data: {
          source: result.source,
          job: {
            id: result.job.id,
            status: result.job.status,
          },
        },
      },
      201,
    );
  } catch (error) {
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
