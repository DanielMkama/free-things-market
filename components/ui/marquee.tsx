import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  dark = false,
}: {
  items: string[];
  className?: string;
  dark?: boolean;
}) {
  const row = [...items, ...items];
  return (
    <div
      className={cn(
        "flex overflow-hidden border-y border-line select-none",
        dark ? "bg-paper-deep" : "bg-transparent",
        className,
      )}
      aria-hidden="true"
    >
      <div className="u-marquee py-3">
        {row.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="u-eyebrow px-6">{item}</span>
            <span className="text-accent-ink">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
