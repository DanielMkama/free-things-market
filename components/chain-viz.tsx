import Link from "next/link";
import type { ChainView } from "@/lib/chains";
import { formatDate } from "@/lib/utils";

export function ChainViz({ chain }: { chain: ChainView }) {
  const people: { name: string; handle: string }[] = [];
  chain.steps.forEach((s, i) => {
    if (i === 0) people.push({ name: s.giverName, handle: s.giverHandle });
    if (s.receiverName) people.push({ name: s.receiverName, handle: "" });
  });

  return (
    <div className="border border-line bg-white/40 p-6">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="font-display text-xl tracking-tight">
          This generosity is moving
        </p>
        <span className="text-xs font-semibold tracking-widest text-muted">
          {formatDate(chain.createdAt)}
        </span>
      </div>

      <ol className="space-y-0">
        {chain.steps.map((step, i) => (
          <li key={step.actId} className="relative pl-6">
            <span className="absolute left-0 top-1.5 size-2.5 rounded-full bg-accent-ink" />
            {i < chain.steps.length - 1 && (
              <span className="absolute left-[4px] top-4 h-full w-px bg-line" />
            )}
            <div className="pb-6">
              <p className="text-sm">
                <Link
                  href={`/u/${step.giverHandle}`}
                  className="font-bold u-link"
                >
                  {step.giverName}
                </Link>
                {""}
                <span className="text-muted">
                  gave {step.type ? step.type.toLowerCase() : "generosity"}
                  {step.receiverName ? ` to ${step.receiverName}` : ""}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted">“{step.description}”</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-2 flex gap-6 border-t border-line pt-4 text-xs font-bold tracking-widest text-muted">
        <span>{people.length} people</span>
        <span>{chain.steps.length} acts</span>
        <span>1 ripple</span>
      </div>
    </div>
  );
}
