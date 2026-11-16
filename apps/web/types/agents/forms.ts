import type { z } from "zod";
import type {
  agentConfigurationSchema,
  createAgentSchema,
  scrapeWebsiteSchema,
  testAgentMessageSchema,
} from "@/schemas/agents";

export type CreateAgentFormValues = z.infer<typeof createAgentSchema>;
export type AgentConfigurationFormValues = z.infer<
  typeof agentConfigurationSchema
>;
export type ScrapeWebsiteFormValues = z.infer<typeof scrapeWebsiteSchema>;
export type TestAgentFormValues = z.infer<typeof testAgentMessageSchema>;
