import { useEffect, useState } from "react";
import { Button } from "@repo/ui/components/button";

// The loader passes the key in the iframe URL: /?apiKey=...
const apiKey = new URLSearchParams(window.location.search).get("apiKey") ?? "";

export default function App() {
  const [open, setOpen] = useState(false);

  // Tell the loader script to resize the iframe
  useEffect(() => {
    window.parent.postMessage({ type: "ai-widget:toggle", open }, "*");
  }, [open]);

  if (!open) {
    return (
      <div className="p-1">
        <Button
          variant="destructive"
          size="icon"
          className="size-14 rounded-full"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          💬
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <span className="font-semibold">Support</span>
        <Button variant="destructive" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>

      {/* Replace this with your real chat UI. apiKey is available here. */}
      <div className="flex-1 overflow-y-auto p-3 text-sm text-muted-foreground">
        Chat messages go here. (key: {apiKey || "none"})
      </div>

      <div className="flex gap-2 border-t p-3">
        <input
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Type a message..."
        />
        <Button>Send</Button>
      </div>
    </div>
  );
}
