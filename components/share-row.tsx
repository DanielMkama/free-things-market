"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function ShareRow({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url =
      (typeof window !== "undefined" ? window.location.origin : "") + path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  return (
    <button
      onClick={copy}
      className="flex w-full items-center justify-center gap-2 border border-line bg-white/40 px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:border-ink hover:text-ink"
    >
      {copied ? (
        <>
          <Check size={14} /> Link copied
        </>
      ) : (
        <>
          <Link2 size={14} /> Share this
        </>
      )}
    </button>
  );
}
