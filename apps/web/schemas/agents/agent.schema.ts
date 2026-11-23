import { z } from "zod";
import { agentTones } from "@/types/agents/agent";

export const agentToneSchema = z.enum(agentTones);

export const createAgentSchema = z.object({
  name: z.string().trim().min(1, "Enter an agent name.").max(100),
  description: z.string().trim().min(1, "Enter a description.").max(300),
  targetWebsiteUrl: z
    .string()
    .trim()
    .min(1, "Enter a website URL.")
    .refine((value) => {
      try {
        const url = new URL(value);
        return (
          ["http:", "https:"].includes(url.protocol) && url.hostname.length > 0
        );
      } catch {
        return false;
      }
    }, "Enter a valid HTTP or HTTPS website URL."),
  tone: agentToneSchema,
  prompt: z.string().trim().min(1, "Enter a base system prompt."),
});
