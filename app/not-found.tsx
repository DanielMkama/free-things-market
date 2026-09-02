import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center px-5 py-20 md:px-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="u-eyebrow text-muted">Nothing here</p>
        <h1 className="mt-4 u-display text-[clamp(3rem,14vw,7rem)]">
          Gone
          <br />
          for good.
        </h1>
        <p className="mt-6 text-muted">
          This page has moved on. Maybe it was given away.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-bold tracking-wide text-paper hover:brightness-95"
        >
          Back to the market
        </Link>
      </div>
    </main>
  );
}
