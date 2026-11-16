"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type AgentApiKeyContextValue = {
  apiKey: string;
  setApiKey: Dispatch<SetStateAction<string>>;
};

const AgentApiKeyContext = createContext<AgentApiKeyContextValue | null>(null);

export function AgentApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState("");

  return (
    <AgentApiKeyContext.Provider value={{ apiKey, setApiKey }}>
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
