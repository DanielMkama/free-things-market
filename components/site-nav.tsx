import Link from "next/link";
import { logOutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/models";
import { MobileNav } from "@/components/mobile-nav";

const LINKS = [
  { href: "/give", label: "Give" },
  { href: "/need", label: "Need" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About" },
];

export function SiteNav({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5 md:px-10">
        <Link
          href="/"
          className="font-display text-xl leading-none tracking-tight"
        >
          Free Things<span className="text-accent-ink">.</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-bold tracking-wide md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="u-link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden px-3 py-2 text-sm font-bold tracking-wide sm:block u-link"
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden px-3 py-2 text-sm font-bold tracking-wide lg:block u-link"
                >
                  Admin
                </Link>
              )}
              <Link
                href={`/u/${user.handle}`}
                aria-label="Your profile"
                className="hidden size-9 overflow-hidden border border-ink font-display text-sm sm:flex sm:items-center sm:justify-center"
                style={
                  user.avatarUrl ? undefined : { background: user.avatarColor }
                }
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  user.name.slice(0, 1)
                )}
              </Link>
              <form action={logOutAction} className="hidden sm:block">
                <button className="px-3 py-2 text-sm font-bold tracking-wide text-muted u-link">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-3 py-2 text-sm font-bold tracking-wide sm:block u-link"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-ink px-4 py-2.5 text-sm font-bold tracking-wide text-paper hover:bg-black"
              >
                Join
              </Link>
            </>
          )}
          <MobileNav user={user} />
        </div>
      </nav>
    </header>
  );
}
