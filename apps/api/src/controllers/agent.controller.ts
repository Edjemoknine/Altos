import type { Context } from "hono";
import { db } from "../db/index.ts";
import { agents } from "../db/schemas/agent.ts";
import type { OrganizationEnv } from "../middlewares/organization.middleware.ts";
import type { AgentSettings, AgentTone } from "../db/schema.ts";
import { and, desc, eq } from "drizzle-orm";
import { agentWidgetKeys } from "../db/schema.ts";
import { generateWidgetKey, hashWidgetKey } from "../utils/widget-key.ts";

import { randomUUID } from "node:crypto";
import {
  uploadObject,
  getPublicObjectUrl,
  deleteUploadedObject,
} from "../services/storage/r2.service.ts";

const AGENT_TONES: AgentTone[] = [
  "professional",
  "friendly",
  "casual",
  "formal",
];

function normalizeWebsiteUrl(value: string): string {
  const trimmed = value.trim();

  // An empty URL is allowed during initial agent configuration.
  if (!trimmed) return "";

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Invalid target website URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Target website URL must use HTTP or HTTPS");
  }

  // Store the origin only: protocol + hostname + port.
  return url.origin;
}

function parseAgentSettings(settings: Record<string, unknown>): AgentSettings {
  const tone = settings.tone ?? "professional";
  const targetWebsiteUrl = settings.targetWebsiteUrl ?? "";

  if (typeof tone !== "string" || !AGENT_TONES.includes(tone as AgentTone)) {
    throw new Error("Invalid agent tone");
  }

  if (typeof targetWebsiteUrl !== "string") {
    throw new Error("Invalid target website URL");
  }

  return {
    tone: tone as AgentTone,
    targetWebsiteUrl: normalizeWebsiteUrl(targetWebsiteUrl),
  };
}

function parseLogoUrl(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Logo URL must be a string or null");
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      throw new Error("Logo URL must use HTTPS");
    }

    return url.toString();
  } catch (error) {
    if (error instanceof Error && error.message === "Logo URL must use HTTPS") {
      throw error;
    }

    throw new Error("Invalid logo URL");
  }
}

const getAgentId = (c: AgentContext): string | null => {
  const agentId = c.req.param("agentId");

  if (!agentId) return null;

  return agentId;
};
type AgentContext = Context<OrganizationEnv>;

type AgentBody = {
  name?: unknown;
  description?: unknown;
  instructions?: unknown;
  status?: unknown;
  logoUrl?: unknown;
  settings?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

// Create agent
export const createAgent = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;

  const body: unknown = await c.req.json();

  if (!isRecord(body)) {
    return c.json({ success: false, message: "Invalid request body" }, 400);
  }

  const { name, description, instructions, settings } = body as AgentBody;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof instructions !== "string" ||
    !instructions.trim()
  ) {
    return c.json(
      {
        success: false,
        message: "Name, description, and instructions are required",
      },
      400,
    );
  }

  let parsedSettings: AgentSettings;
  let logoUrl: string | null;

  try {
    parsedSettings = parseAgentSettings(isRecord(settings) ? settings : {});

    logoUrl = parseLogoUrl(body.logoUrl);
  } catch (error) {
    return c.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Invalid agent configuration",
      },
      400,
    );
  }

  const [agent] = await db
    .insert(agents)
    .values({
      organizationId,
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      logoUrl,
      settings: parsedSettings,
    })
    .returning();

  return c.json(
    {
      success: true,
      message: "Agent created successfully",
      data: agent,
    },
    201,
  );
};

// Get all organization agents
export const getAgents = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;

  const organizationAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.organizationId, organizationId));

  return c.json({
    success: true,
    data: organizationAgents,
  });
};

// Get single agent
export const getAgentById = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);

  if (!agentId) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  const [agent] = await db
    .select()
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  return c.json({
    success: true,
    data: agent,
  });
};

// Update agent
export const updateAgent = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);

  if (!agentId) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  const body: unknown = await c.req.json();

  if (!isRecord(body)) {
    return c.json({ success: false, message: "Invalid request body" }, 400);
  }

  const updates: Partial<typeof agents.$inferInsert> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return c.json(
        { success: false, message: "Name must be a non-empty string" },
        400,
      );
    }

    updates.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string" || !body.description.trim()) {
      return c.json(
        { success: false, message: "Description must be a non-empty string" },
        400,
      );
    }

    updates.description = body.description.trim();
  }

  if (body.instructions !== undefined) {
    if (typeof body.instructions !== "string" || !body.instructions.trim()) {
      return c.json(
        { success: false, message: "Instructions must be a non-empty string" },
        400,
      );
    }

    updates.instructions = body.instructions.trim();
  }

  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "inactive") {
      return c.json(
        { success: false, message: "Status must be active or inactive" },
        400,
      );
    }

    updates.status = body.status;
  }

  if (body.logoUrl !== undefined) {
    try {
      updates.logoUrl = parseLogoUrl(body.logoUrl);
    } catch (error) {
      return c.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Invalid logo URL",
        },
        400,
      );
    }
  }

  if (body.settings !== undefined) {
    if (!isRecord(body.settings)) {
      return c.json(
        { success: false, message: "Settings must be an object" },
        400,
      );
    }

    try {
      updates.settings = parseAgentSettings(body.settings);
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Invalid agent settings",
        },
        400,
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json(
      { success: false, message: "No valid fields provided for update" },
      400,
    );
  }

  updates.updatedAt = new Date();

  const [agent] = await db
    .update(agents)
    .set(updates)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .returning();

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  return c.json({
    success: true,
    message: "Agent updated successfully",
    data: agent,
  });
};

// Delete agent
export const deleteAgent = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);

  if (!agentId) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  const [agent] = await db
    .delete(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .returning();

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  return c.json({
    success: true,
    message: "Agent deleted successfully",
  });
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export const createAgentWidgetKey = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);

  if (!agentId || !isValidUuid(agentId)) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  const body: unknown = await c.req.json().catch(() => null);

  if (!isRecord(body) || typeof body.name !== "string") {
    return c.json(
      { success: false, message: "A valid key name is required" },
      400,
    );
  }

  const name = body.name.trim();

  if (!name || name.length > 100) {
    return c.json(
      {
        success: false,
        message: "Key name must be between 1 and 100 characters",
      },
      400,
    );
  }

  const [agent] = await db
    .select({
      id: agents.id,
      settings: agents.settings,
    })
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  if (!agent.settings.targetWebsiteUrl) {
    return c.json(
      {
        success: false,
        message:
          "Configure the target website URL before creating a widget key",
      },
      400,
    );
  }

  const key = generateWidgetKey();
  const keyHash = hashWidgetKey(key);

  const [createdKey] = await db
    .insert(agentWidgetKeys)
    .values({
      agentId,
      name,
      keyHash,
    })
    .returning({
      id: agentWidgetKeys.id,
      name: agentWidgetKeys.name,
      createdAt: agentWidgetKeys.createdAt,
    });

  if (!createdKey) {
    return c.json(
      { success: false, message: "Unable to create widget key" },
      500,
    );
  }

  return c.json(
    {
      success: true,
      message: "Widget API key created successfully",
      data: {
        ...createdKey,
        key,
      },
    },
    201,
  );
};
export const getAgentWidgetKeys = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);

  if (!agentId || !isValidUuid(agentId)) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  const keys = await db
    .select({
      id: agentWidgetKeys.id,
      name: agentWidgetKeys.name,
      createdAt: agentWidgetKeys.createdAt,
      lastUsedAt: agentWidgetKeys.lastUsedAt,
    })
    .from(agentWidgetKeys)
    .where(eq(agentWidgetKeys.agentId, agentId))
    .orderBy(desc(agentWidgetKeys.createdAt));

  return c.json({
    success: true,
    data: keys,
  });
};
export const deleteAgentWidgetKey = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);
  const keyId = c.req.param("keyId");

  if (!agentId || !isValidUuid(agentId)) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  if (!keyId || !isValidUuid(keyId)) {
    return c.json({ success: false, message: "Invalid widget key ID" }, 400);
  }

  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  const [deletedKey] = await db
    .delete(agentWidgetKeys)
    .where(
      and(eq(agentWidgetKeys.id, keyId), eq(agentWidgetKeys.agentId, agentId)),
    )
    .returning({
      id: agentWidgetKeys.id,
    });

  if (!deletedKey) {
    return c.json({ success: false, message: "Widget API key not found" }, 404);
  }

  return c.json({
    success: true,
    message: "Widget API key deleted successfully",
  });
};

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB

const LOGO_TYPES = {
  "image/png": {
    extension: "png",
    matches: (bytes: Buffer) =>
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/jpeg": {
    extension: "jpg",
    matches: (bytes: Buffer) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
  "image/webp": {
    extension: "webp",
    matches: (bytes: Buffer) =>
      bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP",
  },
} as const;

function getR2StorageKeyFromPublicUrl(url: string | null): string | null {
  const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");

  if (!publicBaseUrl || !url?.startsWith(`${publicBaseUrl}/`)) {
    return null;
  }

  try {
    return decodeURIComponent(url.slice(publicBaseUrl.length + 1));
  } catch {
    return null;
  }
}

export const uploadAgentLogo = async (c: AgentContext) => {
  const organizationId = c.get("organizationMembership").organizationId;
  const agentId = getAgentId(c);

  if (!agentId || !isValidUuid(agentId)) {
    return c.json({ success: false, message: "Invalid agent ID" }, 400);
  }

  // Confirm that this agent belongs to the current organization.
  const [agent] = await db
    .select({
      id: agents.id,
      logoUrl: agents.logoUrl,
    })
    .from(agents)
    .where(
      and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
    )
    .limit(1);

  if (!agent) {
    return c.json({ success: false, message: "Agent not found" }, 404);
  }

  let formData: FormData;

  try {
    formData = await c.req.formData();
  } catch {
    return c.json(
      { success: false, message: "Invalid multipart form data" },
      400,
    );
  }

  const file = formData.get("logo");

  if (!(file instanceof File)) {
    return c.json(
      { success: false, message: "A logo image file is required" },
      400,
    );
  }

  if (file.size === 0 || file.size > MAX_LOGO_SIZE) {
    return c.json(
      { success: false, message: "Logo must be between 1 byte and 2 MB" },
      400,
    );
  }

  const imageType = LOGO_TYPES[file.type as keyof typeof LOGO_TYPES];

  if (!imageType) {
    return c.json(
      {
        success: false,
        message: "Only PNG, JPEG, and WebP images are allowed",
      },
      400,
    );
  }

  const body = Buffer.from(await file.arrayBuffer());

  // Verify the actual file signature instead of trusting its MIME type.
  if (!imageType.matches(body)) {
    return c.json(
      { success: false, message: "The uploaded file is not a valid image" },
      400,
    );
  }

  const storageKey = `organizations/${organizationId}/agents/${agentId}/logo/${randomUUID()}.${imageType.extension}`;

  let uploaded = false;

  try {
    await uploadObject({
      storageKey,
      contentType: file.type,
      body,
    });

    uploaded = true;

    const logoUrl = getPublicObjectUrl(storageKey);

    const [updatedAgent] = await db
      .update(agents)
      .set({
        logoUrl,
        updatedAt: new Date(),
      })
      .where(
        and(eq(agents.id, agentId), eq(agents.organizationId, organizationId)),
      )
      .returning();

    if (!updatedAgent) {
      await deleteUploadedObject(storageKey);

      return c.json({ success: false, message: "Agent not found" }, 404);
    }

    // Delete the previous logo only after the new URL is saved.
    const previousStorageKey = getR2StorageKeyFromPublicUrl(agent.logoUrl);

    if (previousStorageKey) {
      try {
        await deleteUploadedObject(previousStorageKey);
      } catch (error) {
        // A cleanup failure should not invalidate the successful upload.
        console.error("Failed to delete previous agent logo:", error);
      }
    }

    return c.json({
      success: true,
      message: "Agent logo uploaded successfully",
      data: updatedAgent,
    });
  } catch (error) {
    // Avoid leaving an uploaded object behind if the database update fails.
    if (uploaded) {
      try {
        await deleteUploadedObject(storageKey);
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded agent logo:", cleanupError);
      }
    }

    console.error("Failed to upload agent logo:", error);

    return c.json(
      { success: false, message: "Failed to upload agent logo" },
      500,
    );
  }
};
