import { and, eq } from "drizzle-orm";
import { db } from "../../../db/index.ts";
import { agents } from "../../../db/schema.ts";

export async function getActiveAgentByPublicId(
  publicId: string,
  organizationId?: string,
) {
  const conditions = [
    eq(agents.publicId, publicId),
    eq(agents.status, "active"),
  ];

  if (organizationId) {
    conditions.push(eq(agents.organizationId, organizationId));
  }

  const [agent] = await db
    .select()
    .from(agents)
    .where(and(...conditions))
    .limit(1);

  return agent ?? null;
}
