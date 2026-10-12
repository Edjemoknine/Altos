import { useState } from "react";
/* import { ToggleButton } from "./components/ToggleButton";
import { ChatWindow } from "./components/ChatWindow"; */
import { Button } from "@repo/ui/components/button";

// 1. Define the expected props interface
interface AppProps {
  apiKey: string;
}

export default function App({ apiKey }: AppProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ai-widget-container font-sans antialiased  p-8">
      Chat Widget Placeholder - API Key: {apiKey}
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
        Tailwind works
      </Button>
      {/*  {isOpen && (
        <ChatWindow apiKey={apiKey} onClose={() => setIsOpen(false)} />
      )}
      <ToggleButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} /> */}
    </div>
  );
}
