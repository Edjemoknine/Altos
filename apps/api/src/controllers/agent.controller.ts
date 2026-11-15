import type { Context } from "hono";
import { and, eq } from "drizzle-orm";

import { db } from "../db/index.ts";
import { agents } from "../db/schemas/agent.ts";
import type { OrganizationEnv } from "../middlewares/organization.middleware.ts";
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

  if (settings !== undefined && !isRecord(settings)) {
    return c.json(
      { success: false, message: "Settings must be an object" },
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
      settings: settings ?? {},
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

  if (body.settings !== undefined) {
    if (!isRecord(body.settings)) {
      return c.json(
        { success: false, message: "Settings must be an object" },
        400,
      );
    }

    updates.settings = body.settings;
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
