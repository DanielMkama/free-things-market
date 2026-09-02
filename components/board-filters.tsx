"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { OFFER_TYPES, CATEGORIES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function BoardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = {
    type: params.get("type") ?? "All",
    category: params.get("category") ?? "All",
    q: params.get("q") ?? "",
    online: params.get("online") === "1",
  };

  const push = useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (!v || v === "All") sp.delete(k);
        else sp.set(k, v);
      }
      startTransition(() =>
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false }),
      );
    },
    [params, pathname, router],
  );

  return (
    <div
      className={cn("space-y-4", pending && "opacity-60")}
      aria-busy={pending}
    >
      <form
        action={(fd) => push({ q: String(fd.get("q") ?? "") })}
        className="flex gap-2"
      >
        <input
          name="q"
          defaultValue={current.q}
          placeholder="Search the board…"
          className="u-field flex-1"
          aria-label="Search"
        />
        <button className="border border-ink px-4 text-sm font-bold tracking-wide hover:bg-ink hover:text-paper">
          Go
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {["All", ...OFFER_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => push({ type: t })}
            className={cn(
              "border border-ink px-3 py-1.5 text-xs font-bold tracking-widest transition",
              current.type === t
                ? "bg-ink text-paper"
                : "hover:bg-ink hover:text-paper",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => push({ category: c })}
            className={cn(
              "border px-3 py-1.5 text-xs font-semibold tracking-widest transition",
              current.category === c
                ? "border-ink bg-accent text-ink"
                : "border-line text-muted hover:border-ink hover:text-ink",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-bold tracking-widest text-muted">
        <input
          type="checkbox"
          checked={current.online}
          onChange={(e) => push({ online: e.target.checked ? "1" : null })}
          className="size-4 accent-[var(--color-accent-ink)]"
        />
        Online only
      </label>
    </div>
  );
}
