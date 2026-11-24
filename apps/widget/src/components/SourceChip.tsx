import type { PublicChatSource } from "../types/widget";

export function SourceChip({ source }: { source: PublicChatSource }) {
  const className =
    "max-w-45 truncate rounded-full border border-[#e5eae0] bg-white px-2 py-0.5 text-[10px] leading-4 text-[#63775b] hover:bg-[#f1f5ed]";

  if (source.url) {
    return (
      <a
        className={className}
        href={source.url}
        rel="noreferrer"
        target="_blank"
        title={source.snippet}
      >
        {source.title}
      </a>
    );
  }

  return (
    <span className={className} title={source.snippet}>
      {source.title}
    </span>
  );
}
