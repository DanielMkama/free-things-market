import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { getImpactStats } from "@/lib/stats";
import { listOffers, listRequests } from "@/lib/queries";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Reveal } from "@/components/ui/reveal";
import {
  Stat,
  SectionHeading,
  Flow,
  EmptyState,
} from "@/components/ui/primitives";
import { OfferCard, RequestRow } from "@/components/offer-card";
import { SHOWCASE } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

// Community-flavoured Unsplash photos for the hero marquee.
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=60", // hands / people
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&auto=format&fit=crop&q=60", // books
  "https://images.unsplash.com/photo-1556910633-5099dc3971e8?w=900&auto=format&fit=crop&q=60", // plant cutting
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=60", // people collaborating
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&auto=format&fit=crop&q=60", // group at table
  "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=900&auto=format&fit=crop&q=60", // vegetables / food
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900&auto=format&fit=crop&q=60", // tools
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=60", // workshop / teaching
];

const HOW = [
  [
    "01",
    "Give",
    "Share something you can give — a thing, a skill, an hour, what you know.",
  ],
  [
    "02",
    "Connect",
    "Find someone who needs it, or who has what you're looking for.",
  ],
  [
    "03",
    "Receive",
    "Someone helps you. No money changes hands. No debt is created.",
  ],
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
      {/* Hero — animated marquee */}
      <AnimatedMarqueeHero
        className="border-b border-line"
        tagline="A generosity experiment"
        title={
          <>
            Nothing for sale.
            <br />
            <span className="text-accent-ink">Everything</span> to give.
          </>
        }
        description="Give what you have, ask for what you need, and keep generosity moving. No prices. No payments. Just people sharing."
        ctaText="I have something to give"
        ctaHref="/give/new"
        secondaryCtaText="Explore the market"
        secondaryCtaHref="/give"
        images={HERO_IMAGES}
      />

      {/* Impact */}
      <section className="border-b border-line px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <SectionHeading
              eyebrow="Live from the market"
              title="Look what we're giving."
            >
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
            <Link
              href="/impact"
              className="text-sm font-bold tracking-wide u-link"
            >
              See the full picture <MoveRight size={16} className="inline" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line bg-paper-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Four steps. One loop."
            />
          </Reveal>
          <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-4">
            {HOW.map(([num, title, body], i) => (
              <Reveal key={num} delay={i * 60} className="bg-paper-deep p-7">
                <span className="font-display text-5xl text-accent-ink">
                  {num}
                </span>
                <h3 className="mt-4 font-display text-2xl tracking-tight">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {body}
                </p>
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
              className="hidden shrink-0 items-center gap-2 text-sm font-bold tracking-wide u-link md:flex"
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
      <section className="border-b border-line bg-paper-deep px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="u-eyebrow text-accent-ink">Need board</p>
              <h2 className="mt-4 u-headline">People need something.</h2>
              <p className="mt-6 max-w-md text-muted">
                Asking isn&apos;t charity. Someone here may already have exactly
                what you&apos;re looking for.
              </p>
              <Link
                href="/need"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-accent-ink u-link"
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
                    className="block border-b border-line py-5 transition hover:pl-2"
                  >
                    <div className="flex justify-between text-xs font-semibold tracking-widest text-muted">
                      <span>{r.type}</span>
                      <span>{r.city ?? "Online"}</span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl tracking-tight">
                      {r.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {r.description}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-muted">
                  Nobody has asked for anything yet. Maybe you&apos;re the
                  first.
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
              introduction, advice, or simply a little help. The point
              isn&apos;t what it&apos;s worth. The point is that it can move.
            </p>
            <div className="mt-10 flex justify-center">
              <ShimmerButton href="/signup">
                Join the market <ArrowUpRight size={18} />
              </ShimmerButton>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
