import { and, eq } from "drizzle-orm";
import { db } from "../../../db/index.ts";
import { agents } from "../../../db/schema.ts";

export async function getActiveAgentByPublicId(publicId: string) {
  const [agent] = await db
    .select({
      id: agents.id,
      organizationId: agents.organizationId,
      publicId: agents.publicId,
      name: agents.name,
      description: agents.description,
      instructions: agents.instructions,
      settings: agents.settings,
    })
    .from(agents)
    .where(and(eq(agents.publicId, publicId), eq(agents.status, "active")))
    .limit(1);

  return agent ?? null;
}
