"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { User } from "@/lib/models";
import { logOutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/give", label: "Give" },
  { href: "/need", label: "Need" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About" },
  { href: "/guidelines", label: "Guidelines" },
];

export function MobileNav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center border border-ink"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 top-[57px] z-50 flex flex-col gap-1 bg-paper px-5 py-6"
          onClick={() => setOpen(false)}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-display text-4xl leading-none tracking-tight"
            >
              {l.label}
            </Link>
          ))}
          <hr className="u-rule my-4" />
          {user ? (
            <>
              <Link href="/dashboard" className="text-lg font-bold">
                Dashboard
              </Link>
              <Link href={`/u/${user.handle}`} className="text-lg font-bold">
                My profile
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="text-lg font-bold">
                  Admin
                </Link>
              )}
              <form action={logOutAction}>
                <button className="text-lg font-bold text-muted">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-lg font-bold">
                Log in
              </Link>
              <Link href="/signup" className="text-lg font-bold">
                Join the market
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
