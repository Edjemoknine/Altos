import { and, desc, eq } from "drizzle-orm";
import type { Context } from "hono";

import { db } from "../db/index.ts";
import { sources } from "../db/schema.ts";
import { getAgent } from "../helpers/source.service.ts";
import type { OrganizationEnv } from "../middlewares/organization.middleware.ts";
import {
  completeFileUpload,
  createFileUpload,
  createSourceUploadUrl,
} from "../services/storage/file-upload.service.ts";
import { deleteUploadedObject } from "../services/storage/r2.service.ts";

import {
  parseCreateFileUploadBody,
  parseCreateSourceBody,
} from "../validators/source.validation.ts";
import { createSource as createSourceService } from "../helpers/source.service.ts";
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

const parseJsonBody = async (c: SourceContext): Promise<unknown | null> => {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
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

  const body = await parseJsonBody(c);

  if (body === null) {
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
    const source = await createSourceService({
      organizationId,
      agentId,
      input: validation.data,
    });

    return c.json(
      {
        success: true,
        message: "Source created successfully",
        data: source,
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

  try {
    if (source.storageKey) {
      await deleteUploadedObject(source.storageKey);
    }

    await db
      .delete(sources)
      .where(
        and(
          eq(sources.id, sourceId),
          eq(sources.organizationId, organizationId),
          eq(sources.agentId, agentId),
        ),
      );

    return c.json({
      success: true,
      message: "Source deleted successfully",
    });
  } catch (error) {
    console.error("Delete source error:", error);

    return c.json({ success: false, message: "Failed to delete source" }, 500);
  }
};

//**** File Upload Endpoints */

// POST /uploads/presign
export const createFileUploadUrl = async (c: SourceContext) => {
  const { organizationId, agentId } = c.req.param();

  if (!organizationId || !agentId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  const agent = await getAgent(agentId, organizationId);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  const body = await parseJsonBody(c);

  if (body === null) {
    return c.json({ success: false, message: "Invalid JSON body" }, 400);
  }

  const validation = parseCreateFileUploadBody(body);

  if (!validation.success) {
    return c.json(
      { success: false, message: validation.message },
      validation.status,
    );
  }

  try {
    const result = await createFileUpload({
      organizationId,
      agentId,
      input: validation.data,
    });

    return c.json(
      {
        success: true,
        message: "Upload URL created successfully",
        data: {
          source: result.source,
          uploadUrl: result.uploadUrl,
          expiresIn: result.expiresIn,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Create file upload URL error:", error);

    return c.json(
      { success: false, message: "Failed to create upload URL" },
      500,
    );
  }
};

// POST /:sourceId/upload-url
export const refreshFileUploadUrl = async (c: SourceContext) => {
  const { organizationId, agentId, sourceId } = c.req.param();

  if (!organizationId || !agentId || !sourceId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  try {
    const result = await createSourceUploadUrl({
      organizationId,
      agentId,
      sourceId,
    });

    if (!result) {
      return c.json(
        { success: false, message: "Pending file source not found" },
        404,
      );
    }

    return c.json({
      success: true,
      data: {
        source: result.source,
        uploadUrl: result.uploadUrl,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    console.error("Refresh upload URL error:", error);

    return c.json(
      { success: false, message: "Failed to refresh upload URL" },
      500,
    );
  }
};

// POST /:sourceId/complete
export const confirmFileUpload = async (c: SourceContext) => {
  const { organizationId, agentId, sourceId } = c.req.param();

  if (!organizationId || !agentId || !sourceId) {
    return c.json({ success: false, message: "Missing route parameters" }, 400);
  }

  try {
    const result = await completeFileUpload({
      organizationId,
      agentId,
      sourceId,
    });

    if (!result.success) {
      if (result.reason === "not_found") {
        return c.json(
          { success: false, message: "File source not found" },
          404,
        );
      }

      if (result.reason === "not_uploaded") {
        return c.json(
          { success: false, message: "File has not been uploaded yet" },
          409,
        );
      }

      if (result.reason === "invalid_status") {
        return c.json(
          {
            success: false,
            message: "File source cannot be completed in its current state",
          },
          409,
        );
      }

      if (result.reason === "extraction_failed") {
        return c.json(
          { success: false, message: result.message },
          422,
        );
      }

      return c.json(
        {
          success: false,
          message: "Uploaded file does not match the expected file details",
        },
        400,
      );
    }

    return c.json({
      success: true,
      message: "File uploaded successfully",
      data: result.source,
    });
  } catch (error) {
    console.error("Confirm file upload error:", error);

    return c.json(
      { success: false, message: "Failed to confirm file upload" },
      500,
    );
  }
};
