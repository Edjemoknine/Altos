export type AgentTone = "Professional" | "Friendly" | "Casual" | "Empathic";

export type Agent = {
  id: string;
  name: string;
  description: string;
  website: string;
  tone: AgentTone;
  createdAt: string;
  status: "Active" | "Training";
};

export const seedAgents: [Agent, ...Agent[]] = [
  {
    id: "support-assistant",
    name: "Support Assistant",
    description: "Answers common product and account questions.",
    website: "acme.com",
    tone: "Friendly",
    createdAt: "Oct 12, 2025",
    status: "Active",
  },
  {
    id: "billing-guide",
    name: "Billing Guide",
    description: "Helps customers understand plans and invoices.",
    website: "acme.com/pricing",
    tone: "Professional",
    createdAt: "Oct 08, 2025",
    status: "Active",
  },
  {
    id: "onboarding-coach",
    name: "Onboarding Coach",
    description: "Guides new users through getting started.",
    website: "help.acme.com",
    tone: "Casual",
    createdAt: "Oct 02, 2025",
    status: "Training",
  },
];

export const activityRows = [
  { agent: "Support Assistant", mode: "Text chat", detail: "Website widget", time: "2 min ago", tokens: "1,248", status: "Completed" },
  { agent: "Billing Guide", mode: "Audio stream", detail: "Voice assistant", time: "14 min ago", tokens: "3,682", status: "Completed" },
  { agent: "Support Assistant", mode: "Website crawler", detail: "Knowledge sync", time: "38 min ago", tokens: "842", status: "Completed" },
  { agent: "Onboarding Coach", mode: "Text chat", detail: "Playground", time: "1 hr ago", tokens: "2,106", status: "Completed" },
  { agent: "Support Assistant", mode: "Text chat", detail: "Website widget", time: "2 hr ago", tokens: "1,532", status: "Completed" },
];

export const usageRows = [
  { date: "Oct 18, 2025", event: "Embedded widget", agent: "Support Assistant", tokens: "12,480", cost: "$0.19" },
  { date: "Oct 18, 2025", event: "Playground test", agent: "Billing Guide", tokens: "4,820", cost: "$0.08" },
  { date: "Oct 17, 2025", event: "Audio transcription", agent: "Support Assistant", tokens: "3,210", cost: "$0.11" },
  { date: "Oct 17, 2025", event: "Vector embeddings", agent: "Knowledge base", tokens: "8,640", cost: "$0.04" },
  { date: "Oct 16, 2025", event: "Embedded widget", agent: "Onboarding Coach", tokens: "9,380", cost: "$0.14" },
];
