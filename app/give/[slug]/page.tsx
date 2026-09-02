import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOfferBySlug, matchRequestsForOffer } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { Avatar, Tag, Eyebrow } from "@/components/ui/primitives";
import { Notice } from "@/components/ui/notice";
import { ConnectForm } from "@/components/forms/connect-form";
import { ReportDialog } from "@/components/forms/report-dialog";
import { ShareRow } from "@/components/share-row";
import { locationLabel, formatDate } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);
  if (!offer) return { title: "Offer not found" };
  return {
    title: offer.title,
    description: offer.description.slice(0, 160),
    openGraph: {
      title: `${offer.title} — free on The Free Things Market`,
      description: offer.description.slice(0, 160),
    },
  };
}

export default async function OfferDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ connected?: string }>;
}) {
  const { slug } = await params;
  const { connected } = await searchParams;
  const offer = await getOfferBySlug(slug);
  if (!offer || offer.status === "removed" || offer.hiddenByAdmin) notFound();

  const [me, matches] = await Promise.all([
    getCurrentUser(),
    matchRequestsForOffer(offer),
  ]);
  await track("offer_viewed", { userId: me?.id, meta: { slug } });

  const isOwner = me?.id === offer.userId;

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Link
            href="/give"
            className="text-xs font-bold tracking-widest text-muted u-link"
          >
            ← Give board
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl">
              {CATEGORY_EMOJI[offer.category] ?? "✨"}
            </span>
            <div className="flex flex-wrap gap-2">
              <Tag tone="ink">{offer.type}</Tag>
              <Tag>{offer.category}</Tag>
            </div>
          </div>

          <h1 className="mt-5 u-headline">{offer.title}</h1>

          {connected && (
            <div className="mt-6">
              <Notice tone="success">
                Request sent. We&apos;ll let {offer.author.name} know.
              </Notice>
            </div>
          )}

          <p className="mt-6 whitespace-pre-wrap u-lead text-muted">
            {offer.description}
          </p>

          <dl className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            <Detail label="Location" value={locationLabel(offer)} />
            <Detail
              label="Availability"
              value={offer.availability ?? "Flexible"}
            />
            {offer.capacity ? (
              <Detail label="Capacity" value={offer.capacity} />
            ) : null}
            <Detail label="Posted" value={formatDate(offer.createdAt)} />
          </dl>

          {matches.length > 0 && (
            <section className="mt-14">
              <Eyebrow>People this could help</Eyebrow>
              <h2 className="mt-3 font-display text-2xl tracking-tight">
                We found people who may need this
              </h2>
              <div className="mt-5 space-y-3">
                {matches.map((r) => (
                  <Link
                    key={r.id}
                    href={`/need/${r.slug}`}
                    className="u-card block p-4"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold tracking-widest text-muted">
                      <span>{r.type}</span>
                      <span>{locationLabel(r)}</span>
                    </div>
                    <p className="mt-1 font-display text-lg tracking-tight">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12">
            <ReportDialog contentType="offer" contentId={offer.id} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="border border-ink bg-white/50 p-6">
            <Link
              href={`/u/${offer.author.handle}`}
              className="flex items-center gap-3"
            >
              <Avatar
                name={offer.author.name}
                color={offer.author.avatarColor}
                url={offer.author.avatarUrl}
                size={48}
              />
              <span>
                <span className="block font-bold">{offer.author.name}</span>
                <span className="block text-sm text-muted">
                  {offer.author.headline ?? "Member of the market"}
                </span>
              </span>
            </Link>

            <div className="mt-6">
              {isOwner ? (
                <Notice>
                  This is your offer. Watch your connections for requests.
                </Notice>
              ) : me ? (
                <ConnectForm kind="offer" offerId={offer.id} />
              ) : (
                <Link
                  href={`/login?next=/give/${offer.slug}`}
                  className="block w-full bg-ink px-5 py-4 text-center text-sm font-bold tracking-wide text-paper hover:bg-black"
                >
                  Log in to connect
                </Link>
              )}
            </div>

            <p className="mt-4 text-xs text-muted">
              No money changes hands. Arrange the details together after
              connecting.
            </p>
          </div>

          <div className="mt-4">
            <ShareRow path={`/give/${offer.slug}`} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-4">
      <dt className="text-xs font-bold tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
