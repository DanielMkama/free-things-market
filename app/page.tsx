import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { getImpactStats } from "@/lib/stats";
import { listOffers, listRequests } from "@/lib/queries";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { Stat, SectionHeading, Flow, EmptyState } from "@/components/ui/primitives";
import { OfferCard, RequestRow } from "@/components/offer-card";
import { SHOWCASE } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

const HOW = [
  ["01", "Give", "Share something you can give — a thing, a skill, an hour, what you know."],
  ["02", "Connect", "Find someone who needs it, or who has what you're looking for."],
  ["03", "Receive", "Someone helps you. No money changes hands. No debt is created."],
  ["04", "Give forward", "Pass the generosity on. One act can start a chain."],
];

// The front door stays up even if a board query hiccups.
const safe = async <T,>(p: Promise<T[]>): Promise<T[]> => {
  try {
    return await p;
  } catch {
    return [];
  }
};

export default async function HomePage() {
  const [stats, allOffers, allRequests] = await Promise.all([
    getImpactStats(),
    safe(listOffers({})),
    safe(listRequests({})),
  ]);
  const offers = allOffers.slice(0, 3);
  const requests = allRequests.slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-line px-5 pb-10 pt-10 md:px-10 md:pb-16 md:pt-14">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-14">
          <div className="flex items-center justify-between">
            <span className="u-eyebrow text-muted">A generosity experiment</span>
            <span className="hidden text-xs font-bold uppercase tracking-widest text-muted md:block">
              Give → Connect → Receive → Give forward
            </span>
          </div>

          <h1 className="u-display">
            Nothing
            <br />
            for sale.
            <br />
            <span className="text-accent-ink">Everything</span>
            <br />
            to give.
          </h1>

          <div className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl u-lead">
              A place to give what you have, ask for what you need, and keep
              generosity moving. No prices. No payments. Just people sharing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/give/new"
                className="inline-flex items-center gap-2 bg-ink px-5 py-4 text-sm font-bold uppercase tracking-wide text-paper transition hover:-translate-y-0.5"
              >
                I have something to give <ArrowUpRight size={18} />
              </Link>
              <Link
                href="/need/new"
                className="inline-flex items-center gap-2 border border-ink px-5 py-4 text-sm font-bold uppercase tracking-wide transition hover:bg-ink hover:text-paper"
              >
                I need something <ArrowUpRight size={18} />
              </Link>
              <Link
                href="/give"
                className="inline-flex items-center gap-2 px-2 py-4 text-sm font-bold uppercase tracking-wide u-link"
              >
                Explore the market <MoveRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          "Nothing for sale",
          "Everything to give",
          "Keep it moving",
          "Everyone has something to give",
        ]}
      />

      {/* Impact */}
      <section className="border-b border-line px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <SectionHeading eyebrow="Live from the market" title="Look what we're giving.">
              Every number here is generosity that actually happened. Not money
              raised — generosity generated.
            </SectionHeading>
          </Reveal>
          <Reveal className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat value={stats.peopleGiving} label="People giving" accent />
            <Stat value={stats.offers} label="Things & skills offered" />
            <Stat value={stats.requestsFulfilled} label="Requests fulfilled" />
            <Stat value={stats.actsCompleted} label="Acts of generosity" />
            <Stat value={stats.chains} label="Generosity chains" />
          </Reveal>
          <Reveal className="mt-6">
            <Link href="/impact" className="text-sm font-bold uppercase tracking-wide u-link">
              See the full picture <MoveRight size={16} className="inline" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line bg-paper-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Four steps. One loop." />
          </Reveal>
          <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-4">
            {HOW.map(([num, title, body], i) => (
              <Reveal key={num} delay={i * 60} className="bg-paper-deep p-7">
                <span className="font-display text-5xl text-accent-ink">
                  {num}
                </span>
                <h3 className="mt-4 font-display text-2xl uppercase tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <Flow steps={["Give", "Connect", "Receive", "Give forward"]} />
          </Reveal>
        </div>
      </section>

      {/* Give board preview */}
      <section className="border-b border-line px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <SectionHeading eyebrow="Give board" title="People are giving." />
            </Reveal>
            <Link
              href="/give"
              className="hidden shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wide u-link md:flex"
            >
              See all <MoveRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {offers.length ? (
              offers.map((o) => (
                <Reveal key={o.id}>
                  <OfferCard offer={o} />
                </Reveal>
              ))
            ) : (
              <div className="md:col-span-3">
                <EmptyState
                  title="Nothing here yet."
                  action={{ href: "/give/new", label: "Be the first to give" }}
                >
                  Be the first person to give something.
                </EmptyState>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Need board preview */}
      <section className="border-b border-line bg-ink px-5 py-20 text-paper md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="u-eyebrow text-accent">Need board</p>
              <h2 className="mt-4 u-headline">People need something.</h2>
              <p className="mt-6 max-w-md text-paper/60">
                Asking isn&apos;t charity. Someone here may already have exactly
                what you&apos;re looking for.
              </p>
              <Link
                href="/need"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent u-link"
              >
                Browse needs <ArrowUpRight size={16} />
              </Link>
            </div>
            <div>
              {requests.length ? (
                requests.map((r) => (
                  <Link
                    key={r.id}
                    href={`/need/${r.slug}`}
                    className="block border-b border-white/15 py-5 transition hover:pl-2"
                  >
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-paper/50">
                      <span>{r.type}</span>
                      <span>{r.city ?? "Online"}</span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">
                      {r.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-paper/60">
                      {r.description}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-paper/60">
                  Nobody has asked for anything yet. Maybe you&apos;re the first.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What can you give */}
      <section className="border-b border-line px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <SectionHeading
              eyebrow="What can you give?"
              title="You have more than you think."
            />
          </Reveal>
          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(SHOWCASE).map(([group, items]) => (
              <div key={group} className="bg-paper p-6">
                <p className="u-eyebrow text-accent-ink">{group}</p>
                <ul className="mt-4 space-y-1.5 text-sm font-semibold">
                  {items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto / CTA */}
      <section className="px-5 py-24 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="u-eyebrow text-muted">The idea</p>
            <h2 className="mt-5 u-headline">Everyone has something to give.</h2>
            <p className="mx-auto mt-8 max-w-2xl u-lead text-muted">
              It might be a book, an hour of your time, a skill, a meal, an
              introduction, advice, or simply a little help. The point isn&apos;t
              what it&apos;s worth. The point is that it can move.
            </p>
            <Link
              href="/signup"
              className="mt-10 inline-flex items-center gap-2 border-2 border-ink px-7 py-4 font-bold uppercase tracking-wide hover:bg-ink hover:text-paper"
            >
              Join the market <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
