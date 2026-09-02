import { cn } from "@/lib/utils";

export function Notice({
  children,
  tone = "info",
  className,
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "error";
  className?: string;
}) {
  if (!children) return null;
  const tones = {
    info: "border-ink bg-white/50",
    success: "border-ink bg-accent",
    error: "border-red-500/60 bg-red-500/10 text-red-300",
  };
  return (
    <div
      role="status"
      className={cn(
        "border px-4 py-3 text-sm font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
