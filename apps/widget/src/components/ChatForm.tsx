import { useState, type FormEvent } from "react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";

export function ChatForm({
  disabled,
  onSendMessage,
}: {
  disabled: boolean;
  onSendMessage: (message: string) => void;
}) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || disabled) return;

    onSendMessage(message);
    setInput("");
  }

  return (
    <form
      className="flex gap-2 border-t border-[#eff1ec] p-4"
      onSubmit={handleSubmit}
    >
      <Input
        aria-label="Type a message"
        className="h-10 flex-1 rounded-xl border-[#e2e7de] bg-white px-3.5 text-sm text-[#28352b] placeholder:text-[#a0a99f] focus-visible:border-[#90ac68] focus-visible:ring-[#c5ef70]/20"
        disabled={disabled}
        maxLength={4000}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Ask us a question..."
        value={input}
      />
      <Button
        aria-label="Send message"
        className="size-10 rounded-xl bg-[#17221b] px-0 text-white hover:bg-[#304536]"
        disabled={!input.trim() || disabled}
        type="submit"
      >
        <span aria-hidden="true">↑</span>
      </Button>
    </form>
  );
}