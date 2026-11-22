"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type CreatedWidgetKey = {
  id: string;
  name: string;
  key: string;
};

type AgentApiKeyContextValue = {
  createdKey: CreatedWidgetKey | null;
  setCreatedKey: (key: CreatedWidgetKey | null) => void;
};

const AgentApiKeyContext = createContext<AgentApiKeyContextValue | null>(null);

export function AgentApiKeyProvider({ children }: { children: ReactNode }) {
  const [createdKey, setCreatedKey] = useState<CreatedWidgetKey | null>(null);

  return (
    <AgentApiKeyContext.Provider value={{ createdKey, setCreatedKey }}>
      {children}
    </AgentApiKeyContext.Provider>
  );
}

export function useAgentApiKey() {
  const context = useContext(AgentApiKeyContext);

  if (!context) {
    throw new Error("useAgentApiKey must be used within AgentApiKeyProvider");
  }

  return context;
}
