import { z } from "zod";

export const testAgentMessageSchema = z.object({
  message: z.string().trim().min(1, "Enter a message."),
});
