"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";
import type { DemoAgent } from "@/types/agents";
import { AgentApiKeyProvider } from "./AgentApiKeyContext";
import { AgentConfigurationTab } from "./AgentConfigurationTab";
import { ApiKeyTab } from "./ApiKeyTab";
import { EmbedWidgetTab } from "./EmbedWidgetTab";
import { KnowledgeBaseTab } from "./KnowledgeBaseTab";
import { TestAgentTab } from "./TestAgentTab";

type AgentTab = "configuration" | "knowledge" | "api-key" | "embed" | "test";

const tabs: { id: AgentTab; label: string }[] = [
  { id: "configuration", label: "Configuration" },
  { id: "knowledge", label: "Knowledge base" },
  { id: "api-key", label: "API key" },
  { id: "embed", label: "Embed widget" },
  { id: "test", label: "Test agent" },
];

export function AgentTabs({ agent }: { agent: DemoAgent }) {
  const [activeTab, setActiveTab] = useState<AgentTab>("configuration");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("test")) {
      setActiveTab("test");
    }
  }, []);

  return (
    <>
      <div className="mb-5 overflow-x-auto border-b border-[#e3e8df]">
        <div
          aria-label="Agent settings"
          className="flex min-w-max gap-6"
          role="tablist"
        >
          {tabs.map((tab) => (
            <Button
              aria-selected={activeTab === tab.id}
              className={`h-auto rounded-none border-b-2 bg-transparent px-0.5 pb-3 pt-1 text-xs font-semibold transition hover:bg-transparent ${
                activeTab === tab.id
                  ? "border-[#6e914c] text-[#456337]"
                  : "border-transparent text-[#849084] hover:text-[#4f5e51]"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
              variant="ghost"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      <AgentApiKeyProvider>
        {activeTab === "configuration" && (
          <AgentConfigurationTab agent={agent} />
        )}
        {activeTab === "knowledge" && <KnowledgeBaseTab />}
        {activeTab === "api-key" && <ApiKeyTab />}
        {activeTab === "embed" && <EmbedWidgetTab />}
        {activeTab === "test" && <TestAgentTab agentName={agent.name} />}
      </AgentApiKeyProvider>
    </>
  );
}
