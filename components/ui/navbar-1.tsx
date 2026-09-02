"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { User } from "@/lib/models";

const LINKS = [
  { href: "/give", label: "Give" },
  { href: "/need", label: "Need" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About" },
  { href: "/guidelines", label: "Guidelines" },
];

type Props = {
  user: User | null;
  logout: (formData: FormData) => void | Promise<void>;
};

export function Navbar1({ user, logout }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  // Lock body scroll + close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <div className="sticky top-0 z-40 flex w-full justify-center px-4 py-4">
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-line bg-white/85 px-4 py-2.5 shadow-lg backdrop-blur md:px-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2" onClick={close}>
          <motion.span
            aria-hidden
            className="block size-4 bg-accent"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 12 }}
            transition={{ duration: 0.3 }}
          />
          <span className="font-display text-lg leading-none tracking-tight">
            Free Things
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.slice(0, 4).map((item) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href={item.href}
                className="text-sm font-bold tracking-wide text-ink transition-colors hover:text-muted"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop auth / CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-bold tracking-wide text-ink transition-colors hover:text-muted"
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-bold tracking-wide text-ink transition-colors hover:text-muted"
                >
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button className="text-sm font-bold tracking-wide text-muted transition-colors hover:text-ink">
                  Log out
                </button>
              </form>
              <Link href={`/u/${user.handle}`} aria-label="Your profile">
                <Avatar user={user} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold tracking-wide text-ink transition-colors hover:text-muted"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-bold tracking-wide text-[color:var(--color-on-accent)] transition hover:brightness-105"
              >
                Join
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <motion.button
          className="flex items-center md:hidden"
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.9 }}
          aria-label="Open menu"
        >
          <Menu className="size-6 text-ink" />
        </motion.button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-paper px-6 pb-10 pt-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={close}
                className="font-display text-lg leading-none tracking-tight"
              >
                Free Things<span className="text-accent-ink">.</span>
              </Link>
              <button onClick={close} aria-label="Close menu" className="p-2">
                <X className="size-6 text-ink" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-1 overflow-y-auto">
              {LINKS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    className="block py-1 font-display text-4xl leading-tight tracking-tight"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <hr className="u-rule my-5" />

              {user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="text-lg font-bold"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/u/${user.handle}`}
                    onClick={close}
                    className="text-lg font-bold"
                  >
                    My profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={close}
                      className="text-lg font-bold"
                    >
                      Admin
                    </Link>
                  )}
                  <form action={logout}>
                    <button className="text-lg font-bold text-muted">
                      Log out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/login"
                    onClick={close}
                    className="text-lg font-bold"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-base font-bold tracking-wide text-[color:var(--color-on-accent)]"
                  >
                    Join the market
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Avatar({ user }: { user: User }) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className="size-9 rounded-full border border-ink object-cover"
      />
    );
  }
  return (
    <span
      className="flex size-9 items-center justify-center rounded-full border border-ink font-display text-sm"
      style={{ background: user.avatarColor, color: "var(--color-on-accent)" }}
    >
      {user.name.slice(0, 1)}
    </span>
  );
}
