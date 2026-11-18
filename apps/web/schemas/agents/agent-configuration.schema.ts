import { z } from "zod";
import { agentToneSchema } from "./agent.schema";

export const agentConfigurationSchema = z.object({
  name: z.string().trim().min(1, "Enter an agent name."),
  tone: agentToneSchema,
  description: z.string().trim().min(1, "Enter a description."),
  website: z.string().trim().refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !!url.hostname;
    } catch {
      return false;
    }
  }, "Enter a valid HTTP or HTTPS website URL."),
  prompt: z.string().trim().min(1, "Enter a base system prompt."),
});
