import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUserByHandle,
  getPublicOffersForUser,
  getPublicActsForUser,
} from "@/lib/queries";
import { getUserGenerosity } from "@/lib/stats";
import { getCurrentUser } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { Avatar, Stat, Tag, Eyebrow } from "@/components/ui/primitives";
import { ReportDialog } from "@/components/forms/report-dialog";
import { ShareRow } from "@/components/share-row";
import { timeAgo } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const user = await getUserByHandle(handle);
  if (!user) return { title: "Profile not found" };
  return {
    title: `${user.name}${user.headline ? ` — ${user.headline}` : ""}`,
    description: user.bio ?? `${user.name} on The Free Things Market.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const user = await getUserByHandle(handle);
  if (!user || user.suspended) notFound();

  const me = await getCurrentUser();
  await track("profile_viewed", { userId: me?.id, meta: { handle } });

  const [g, offers, acts] = await Promise.all([
    getUserGenerosity(user.id),
    getPublicOffersForUser(user.id),
    getPublicActsForUser(user.id),
  ]);
  const isMe = me?.id === user.id;

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <Avatar
              name={user.name}
              color={user.avatarColor}
              url={user.avatarUrl}
              size={72}
            />
            <div>
              <Eyebrow>Generosity profile</Eyebrow>
              <h1 className="mt-2 u-headline">{user.name}</h1>
              {user.headline ? (
                <p className="mt-2 text-lg font-semibold text-muted">
                  {user.headline}
                </p>
              ) : null}
              {user.city ? (
                <p className="text-sm text-muted">
                  {[user.city, user.country].filter(Boolean).join(",")}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {isMe ? (
              <Link
                href="/settings"
                className="border border-ink px-4 py-2 text-xs font-bold tracking-widest hover:bg-ink hover:text-paper"
              >
                Edit profile
              </Link>
            ) : me ? (
              <ReportDialog contentType="user" contentId={user.id} />
            ) : null}
          </div>
        </div>

        {user.bio ? (
          <p className="mt-8 max-w-2xl u-lead text-muted">“{user.bio}”</p>
        ) : null}

        {/* Generosity */}
        <section className="mt-10">
          <h2 className="text-xs font-bold tracking-widest text-muted">
            My generosity
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat value={g.actsGiven} label="Acts given" accent />
            <Stat value={g.peopleHelped} label="People helped" />
            <Stat value={g.giveForwardActs} label="Give-forward acts" />
            <Stat value={g.chains} label="Generosity chains" />
          </div>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {/* Can give */}
          <section>
            <h2 className="font-display text-2xl tracking-tight">I can give</h2>
            {user.giveTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {user.giveTags.map((t) => (
                  <Tag key={t} tone="accent">
                    {t}
                  </Tag>
                ))}
              </div>
            )}
            <div className="mt-5 space-y-3">
              {offers.length === 0 && (
                <p className="text-sm text-muted">
                  No active offers right now.
                </p>
              )}
              {offers.map((o) => (
                <Link
                  key={o.id}
                  href={`/give/${o.slug}`}
                  className="u-card block p-4"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted">
                    <span>{CATEGORY_EMOJI[o.category] ?? "✨"}</span>
                    <span>
                      {o.type} · {o.category}
                    </span>
                  </div>
                  <p className="mt-1 font-display text-lg tracking-tight">
                    {o.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Public acts */}
          <section>
            <h2 className="font-display text-2xl tracking-tight">
              Generosity, in the open
            </h2>
            <div className="mt-4">
              {acts.length === 0 ? (
                <p className="text-sm text-muted">
                  No public acts yet — but everyone starts somewhere.
                </p>
              ) : (
                <ul>
                  {acts.map((a) => (
                    <li
                      key={a.id}
                      className="border-t border-line py-4 first:border-t-0"
                    >
                      <p className="text-sm font-semibold">
                        {a.giverId === user.id ? "Gave" : "Received"}
                        {a.type ? ` ${a.type.toLowerCase()}` : " generosity"}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        “{a.description}”
                      </p>
                      <p className="mt-1 text-xs tracking-widest text-muted">
                        {timeAgo(a.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="mt-12 max-w-xs">
          <ShareRow path={`/u/${user.handle}`} />
        </div>
      </div>
    </main>
  );
}
