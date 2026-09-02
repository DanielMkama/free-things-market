import Link from "next/link";
import { AtSign, MessageCircle, Rss, Send, Share2 } from "lucide-react";

const EXPLORE = [
  { href: "/give", label: "Give board" },
  { href: "/need", label: "Need board" },
  { href: "/impact", label: "Community impact" },
  { href: "/market", label: "Physical market" },
  { href: "/about", label: "How it works" },
];

const SAFE = [
  { href: "/guidelines", label: "Community guidelines" },
  { href: "/guidelines#safety", label: "Meeting safely" },
];

const SOCIAL = [
  { label: "Newsletter", Icon: AtSign },
  { label: "Updates feed", Icon: Rss },
  { label: "Community chat", Icon: MessageCircle },
  { label: "Share the market", Icon: Share2 },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-line bg-paper-deep text-ink">
      <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stay connected */}
          <div className="relative">
            <h2 className="font-display text-3xl leading-none tracking-tight">
              Keep it moving<span className="text-accent-ink">.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Get <em>This Week in Generosity</em> — a short note on what the
              community gave. Opt in when you join.
            </p>
            <form
              action="/signup"
              method="get"
              className="relative mt-5 max-w-xs"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="u-field pr-12"
              />
              <button
                type="submit"
                aria-label="Sign up"
                className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full bg-accent text-[color:var(--color-on-accent)] transition hover:scale-105"
              >
                <Send className="size-4" />
              </button>
            </form>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 top-0 size-24 rounded-full bg-accent/10 blur-2xl"
            />
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <p className="u-eyebrow mb-4 text-muted">Explore</p>
            <ul className="space-y-2 text-sm font-semibold">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="u-link hover:text-accent-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Reach us */}
          <div>
            <p className="u-eyebrow mb-4 text-muted">Reach us</p>
            <address className="space-y-2 text-sm not-italic text-muted">
              <p>The Free Things Market</p>
              <p>Arusha, Tanzania</p>
              <p>
                <a
                  href="mailto:hello@freethings.market"
                  className="u-link text-ink"
                >
                  hello@freethings.market
                </a>
              </p>
            </address>
            <div className="mt-5 flex flex-col gap-2">
              {SAFE.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="u-link text-sm font-semibold hover:text-accent-ink"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Follow us */}
          <div>
            <p className="u-eyebrow mb-4 text-muted">Follow us</p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  title={label}
                  className="flex size-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink hover:text-accent-ink"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              No buying. No selling. No prices. Everyone can give, everyone can
              receive, and giving never creates debt.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-center text-xs text-muted md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} The Free Things Market — a generosity
            experiment. Nothing for sale.
          </p>
          <nav className="flex gap-4">
            <Link href="/guidelines" className="u-link hover:text-accent-ink">
              Guidelines
            </Link>
            <Link href="/about" className="u-link hover:text-accent-ink">
              About
            </Link>
            <Link href="/impact" className="u-link hover:text-accent-ink">
              Impact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
