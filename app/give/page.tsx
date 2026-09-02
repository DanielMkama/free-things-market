import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listOffers } from "@/lib/queries";
import { BoardFilters } from "@/components/board-filters";
import { OfferCard } from "@/components/offer-card";
import { EmptyState, Eyebrow } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People are giving",
  description: "Browse everything people are offering — no money, no strings.",
};

export default async function GiveBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    type: typeof sp.type === "string" ? sp.type : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    online: sp.online === "1",
  };
  const offers = await listOffers(filters);

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
          <div>
            <Eyebrow>Give board</Eyebrow>
            <h1 className="mt-3 u-headline">People are giving.</h1>
            <p className="mt-4 max-w-lg u-lead text-muted">
              Everything here is free. Find something you need and reach out.
            </p>
          </div>
          <Link
            href="/give/new"
            className="inline-flex w-fit items-center gap-2 bg-ink px-5 py-3 text-sm font-bold tracking-wide text-paper hover:bg-black"
          >
            <Plus size={16} /> Post something
          </Link>
        </div>

        <div className="mt-8">
          <BoardFilters />
        </div>

        <p className="mt-8 text-xs font-bold tracking-widest text-muted">
          {offers.length} {offers.length === 1 ? "gift" : "gifts"} on the board
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
        </div>

        {offers.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="Nothing matches — yet."
              action={{ href: "/give/new", label: "I have something to give" }}
            >
              Try clearing the filters, or be the first person to give something
              here.
            </EmptyState>
          </div>
        )}
      </div>
    </main>
  );
}
