import { useState } from "react";
import type { PublicChatSource } from "../types/widget";
import { SourceChip } from "./SourceChip";
import { Button } from "@repo/ui/components/button";

function MessageSources({ sources }: { sources: PublicChatSource[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleSources = expanded ? sources : sources.slice(0, 1);

  return (
    <div
      aria-label="Sources for this response"
      className="mt-1 flex flex-wrap items-center gap-1.5"
    >
      <span className="text-[10px] text-[#879087]">Sources</span>
      {visibleSources.map((source) => (
        <SourceChip key={source.documentId} source={source} />
      ))}
      {sources.length > 1 && (
        <Button
          aria-expanded={expanded}
          className="h-6 cursor-pointer rounded-full border px-2 text-[10px] leading-4 text-[#63775b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8aaa55]"
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          type="button"
          variant="default"
        >
          {expanded ? "Show less" : `+${sources.length - 1} more`}
        </Button>
      )}
    </div>
  );
}
export default MessageSources;
