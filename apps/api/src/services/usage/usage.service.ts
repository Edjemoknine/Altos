import { db } from "../../db/index.ts";
import { usageEvents } from "../../db/schema.ts";

export type RecordUsageInput = {
  organizationId: string;
  agentId: string;

  source: "widget" | "playground" | "system";
  operation: "chat" | "crawl" | "embedding" | "transcription";
  status: "success" | "failed";

  provider?: string | null;
  model?: string | null;

  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;

  pagesProcessed?: number | null;
  chunksProcessed?: number | null;
  audioDurationSeconds?: number | null;

  costMicros?: number | null;
  measurement?: "measured" | "estimated" | "unavailable";

  requestId?: string | null;
  idempotencyKey?: string | null;

  metadata?: Record<string, unknown>;
};

export async function recordUsage(input: RecordUsageInput) {
  const { inputTokens, outputTokens, totalTokens, metadata, ...usage } = input;

  const calculatedTotalTokens =
    totalTokens ??
    (inputTokens != null && outputTokens != null
      ? inputTokens + outputTokens
      : null);

  const [event] = await db
    .insert(usageEvents)
    .values({
      ...usage,
      inputTokens: inputTokens ?? null,
      outputTokens: outputTokens ?? null,
      totalTokens: calculatedTotalTokens,
      metadata: metadata ?? {},
    })
    .onConflictDoNothing({
      target: usageEvents.idempotencyKey,
    })
    .returning({
      id: usageEvents.id,
    });

  if (!event) {
    return {
      recorded: false,
      reason: "duplicate",
    } as const;
  }

  return {
    recorded: true,
    id: event.id,
  } as const;
}
