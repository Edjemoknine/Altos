export const agentTones = [
  "professional",
  "friendly",
  "casual",
  "formal",
] as const;

export type AgentTone = (typeof agentTones)[number];

export type CreateAgentInput = {
  name: string;
  description: string;
  instructions: string;
  settings: {
    targetWebsiteUrl: string;
    tone: AgentTone;
  };
};

export type Agent = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  instructions: string;
  status: "active" | "inactive";
  publicId: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
