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
        "flex overflow-hidden border-y select-none",
        dark ? "border-white/15 bg-ink text-paper" : "border-line",
        className,
      )}
      aria-hidden="true"
    >
      <div className="u-marquee py-3">
        {row.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="u-eyebrow px-6">{item}</span>
            <span className={dark ? "text-accent" : "text-accent-ink"}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
