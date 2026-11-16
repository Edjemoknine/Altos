import { agentTones, type Agent, type AgentTone } from "@/types/agents";

const toneStyles: Record<AgentTone, string> = {
  Professional: "bg-[#eef1f8] text-[#677493]",
  Friendly: "bg-[#eff5e9] text-[#67834d]",
  Casual: "bg-[#f9f1e7] text-[#aa7b4c]",
  Empathic: "bg-[#f5edf4] text-[#9a6f91]",
};

const tones = agentTones;

function getAgentTone(agent: Agent): AgentTone {
  return tones.find((tone) => tone === agent.settings.tone) ?? "Friendly";
}

function getAgentWebsite(agent: Agent) {
  return typeof agent.settings.website === "string"
    ? agent.settings.website
    : "No website configured";
}

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export { toneStyles, tones, getAgentTone, getAgentWebsite, formatCreatedDate };
