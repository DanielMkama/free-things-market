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
    error: "border-red-700 bg-red-50 text-red-800",
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
