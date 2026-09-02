import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listRequests } from "@/lib/queries";
import { BoardFilters } from "@/components/board-filters";
import { RequestRow } from "@/components/offer-card";
import { EmptyState, Eyebrow } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People need something",
  description: "See what people are asking for. You might already have it.",
};

export default async function NeedBoardPage({
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
  const requests = await listRequests(filters);

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 md:flex-row md:items-end">
          <div>
            <Eyebrow>Need board</Eyebrow>
            <h1 className="mt-3 u-headline">People need something.</h1>
            <p className="mt-4 max-w-lg u-lead text-muted">
              Ask for something. Someone might already have it.
            </p>
          </div>
          <Link
            href="/need/new"
            className="inline-flex w-fit items-center gap-2 bg-ink px-5 py-3 text-sm font-bold uppercase tracking-wide text-paper hover:bg-black"
          >
            <Plus size={16} /> Post a need
          </Link>
        </div>

        <div className="mt-8">
          <BoardFilters />
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-muted">
          {requests.length} {requests.length === 1 ? "request" : "requests"} open
        </p>

        <div className="mt-2">
          {requests.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
        </div>

        {requests.length === 0 && (
          <div className="mt-6">
            <EmptyState
              title="Nobody's asked yet."
              action={{ href: "/need/new", label: "I need something" }}
            >
              Maybe you&apos;re the first. Post what would help you.
            </EmptyState>
          </div>
        )}
      </div>
    </main>
  );
}
