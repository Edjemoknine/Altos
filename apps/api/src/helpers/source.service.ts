import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";

import type { CreateSourceInput } from "../types/source.ts";
import { db } from "../db/index.ts";
import { agents, documents, sources } from "../db/schema.ts";

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

type CreateSourceOptions = {
  organizationId: string;
  agentId: string;
  input: CreateSourceInput;
};

export const createSource = async ({
  organizationId,
  agentId,
  input,
}: CreateSourceOptions) => {
  const [source] = await db
    .insert(sources)
    .values({
      organizationId,
      agentId,
      name: input.name,
      type: input.type,
      url: input.url,
      metadata: input.metadata,
    })
    .returning();

  if (!source) {
    throw new Error("Failed to create source");
  }

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

  return source;
};
