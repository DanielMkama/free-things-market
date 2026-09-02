import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestBySlug, matchOffersForRequest } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { Avatar, Tag, Eyebrow } from "@/components/ui/primitives";
import { Notice } from "@/components/ui/notice";
import { ConnectForm } from "@/components/forms/connect-form";
import { ReportDialog } from "@/components/forms/report-dialog";
import { ShareRow } from "@/components/share-row";
import { OfferCard } from "@/components/offer-card";
import { locationLabel, formatDate } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const req = await getRequestBySlug(slug);
  if (!req) return { title: "Request not found" };
  return {
    title: req.title,
    description: req.description.slice(0, 160),
    openGraph: {
      title: `${req.title} — on The Free Things Market`,
      description: req.description.slice(0, 160),
    },
  };
}

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ connected?: string }>;
}) {
  const { slug } = await params;
  const { connected } = await searchParams;
  const req = await getRequestBySlug(slug);
  if (!req || req.status === "removed" || req.hiddenByAdmin) notFound();

  const [me, matches] = await Promise.all([
    getCurrentUser(),
    matchOffersForRequest(req),
  ]);
  await track("request_viewed", { userId: me?.id, meta: { slug } });

  const isOwner = me?.id === req.userId;
  const fulfilled = req.status === "fulfilled";

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Link
            href="/need"
            className="text-xs font-bold uppercase tracking-widest text-muted u-link"
          >
            ← Need board
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl">
              {CATEGORY_EMOJI[req.category] ?? "✨"}
            </span>
            <div className="flex flex-wrap gap-2">
              <Tag tone="ink">{req.type}</Tag>
              <Tag>{req.category}</Tag>
              <Tag>{req.urgency}</Tag>
            </div>
          </div>

          <h1 className="mt-5 u-headline">{req.title}</h1>

          {connected && (
            <div className="mt-6">
              <Notice tone="success">
                You offered to help. We&apos;ll let {req.author.name} know.
              </Notice>
            </div>
          )}
          {fulfilled && (
            <div className="mt-6">
              <Notice>This request has been fulfilled. 🎉</Notice>
            </div>
          )}

          <p className="mt-6 whitespace-pre-wrap u-lead text-muted">
            {req.description}
          </p>

          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            <Detail label="Location" value={locationLabel(req)} />
            <Detail label="Urgency" value={req.urgency} />
            <Detail label="Posted" value={formatDate(req.createdAt)} />
          </dl>

          {matches.length > 0 && (
            <section className="mt-14">
              <Eyebrow>Possible matches</Eyebrow>
              <h2 className="mt-3 font-display text-2xl uppercase tracking-tight">
                We found people who may help
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {matches.map((o) => (
                  <OfferCard key={o.id} offer={o} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-12">
            <ReportDialog contentType="request" contentId={req.id} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="border border-ink bg-white/50 p-6">
            <Link
              href={`/u/${req.author.handle}`}
              className="flex items-center gap-3"
            >
              <Avatar
                name={req.author.name}
                color={req.author.avatarColor}
                url={req.author.avatarUrl}
                size={48}
              />
              <span>
                <span className="block font-bold">{req.author.name}</span>
                <span className="block text-sm text-muted">
                  {req.author.headline ?? "Member of the market"}
                </span>
              </span>
            </Link>

            <div className="mt-6">
              {isOwner ? (
                <Notice>This is your request. Watch your connections.</Notice>
              ) : fulfilled ? (
                <Notice>Already fulfilled — nothing needed here.</Notice>
              ) : me ? (
                <ConnectForm kind="request" requestId={req.id} />
              ) : (
                <Link
                  href={`/login?next=/need/${req.slug}`}
                  className="block w-full bg-ink px-5 py-4 text-center text-sm font-bold uppercase tracking-wide text-paper hover:bg-black"
                >
                  Log in to help
                </Link>
              )}
            </div>

            <p className="mt-4 text-xs text-muted">
              Offering help creates a connection — not an obligation.
            </p>
          </div>

          <div className="mt-4">
            <ShareRow path={`/need/${req.slug}`} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-4">
      <dt className="text-xs font-bold uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
