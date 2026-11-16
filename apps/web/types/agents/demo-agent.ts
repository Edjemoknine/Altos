import type { AgentTone } from "./agent";

export type DemoAgent = {
  id: string;
  name: string;
  description: string;
  website: string;
  tone: AgentTone;
  createdAt: string;
  status: "Active" | "Training";
};
