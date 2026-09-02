import Link from "next/link";

const RULES = [
  "No buying. No selling. No prices.",
  "Everyone can give. Everyone can receive.",
  "Giving does not create debt.",
  "Generosity is never measured in money.",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10">
        <p className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.85] tracking-tight">
          Keep it
          <br />
          moving<span className="text-accent-ink">.</span>
        </p>

        <div className="mt-14 grid gap-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="u-eyebrow mb-4 text-muted">The Market</p>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link href="/give" className="u-link">
                  Give board
                </Link>
              </li>
              <li>
                <Link href="/need" className="u-link">
                  Need board
                </Link>
              </li>
              <li>
                <Link href="/impact" className="u-link">
                  Community impact
                </Link>
              </li>
              <li>
                <Link href="/market" className="u-link">
                  Physical market
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="u-eyebrow mb-4 text-muted">Getting started</p>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link href="/about" className="u-link">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/signup" className="u-link">
                  Join the market
                </Link>
              </li>
              <li>
                <Link href="/give/new" className="u-link">
                  Post a gift
                </Link>
              </li>
              <li>
                <Link href="/need/new" className="u-link">
                  Post a need
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="u-eyebrow mb-4 text-muted">Safe & sound</p>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link href="/guidelines" className="u-link">
                  Community guidelines
                </Link>
              </li>
              <li>
                <Link href="/guidelines#safety" className="u-link">
                  Meeting safely
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="u-eyebrow mb-4 text-muted">The rules</p>
            <ul className="space-y-2 text-sm text-muted">
              {RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <span>
            The Free Things Market — a generosity experiment. Nothing for sale.
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
