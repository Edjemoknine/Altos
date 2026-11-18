import type { AgentSource } from "@/services/source.service";
import { agentTones, type Agent, type AgentTone } from "@/types/agents";
import { FileSpreadsheet, FileText, Globe2 } from "lucide-react";
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
function getSourceFileType(source: AgentSource) {
  if (source.type === "website") return "Website";
  if (source.type === "text") return "Text";

  const filename = source.originalFilename ?? source.name;
  const extension = filename.split(".").pop()?.toUpperCase();
  return extension && extension !== filename.toUpperCase() ? extension : "File";
}

function getSourceIcon(source: AgentSource) {
  if (source.type === "website") return Globe2;
  if (getSourceFileType(source) === "CSV") return FileSpreadsheet;
  return FileText;
}

function getSourceStatus(status: AgentSource["status"]) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-[#f5f2e8] text-[#927d45]",
      };
    case "processing":
      return {
        label: "Processing",
        className: "bg-[#eef1f8] text-[#677493]",
      };
    case "completed":
      return {
        label: "Ready",
        className: "bg-[#eff5e9] text-[#67834d]",
      };
    case "failed":
      return {
        label: "Failed",
        className: "bg-[#fff1ee] text-[#a94336]",
      };
  }
}

function formatSourceDate(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : formatCreatedDate(createdAt);
}
export {
  toneStyles,
  tones,
  getAgentTone,
  getAgentWebsite,
  formatCreatedDate,
  getSourceFileType,
  getSourceIcon,
  getSourceStatus,
  formatSourceDate,
};
