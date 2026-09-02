import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserGenerosity } from "@/lib/stats";
import {
  getCommitmentsForUser,
  getRecentActivityForUser,
  getConnectionsForUser,
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { mapOffer, mapRequest } from "@/lib/models";
import { Stat, Eyebrow, EmptyState } from "@/components/ui/primitives";
import { Notice } from "@/components/ui/notice";
import { CompleteGiveForwardForm } from "@/components/forms/give-forward-forms";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your generosity" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ committed?: string; rippled?: string }>;
}) {
  const user = await requireUser("/dashboard");
  if (!user.onboarded) redirect("/onboarding");
  const { committed, rippled } = await searchParams;

  const supabase = await createClient();
  const [g, commitments, activity, connections, offersRes, requestsRes] =
    await Promise.all([
      getUserGenerosity(user.id),
      getCommitmentsForUser(user.id),
      getRecentActivityForUser(user.id),
      getConnectionsForUser(user.id),
      supabase
        .from("offers")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "removed")
        .order("created_at", { ascending: false }),
      supabase
        .from("requests")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "removed")
        .order("created_at", { ascending: false }),
    ]);

  const openCommitments = commitments.filter((c) => c.status === "pending");
  const pendingForMe = connections.filter(
    (c) =>
      c.status === "pending" &&
      c.initiatorId !== user.id &&
      (c.giverId === user.id || c.receiverId === user.id),
  ).length;
  const toComplete = connections.filter((c) => c.status === "accepted").length;

  const myOffers = (offersRes.data ?? []).map((r) =>
    mapOffer(r as Record<string, unknown>),
  );
  const myRequests = (requestsRes.data ?? []).map((r) =>
    mapRequest(r as Record<string, unknown>),
  );

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="border-b border-line pb-8">
          <Eyebrow>Your generosity</Eyebrow>
          <h1 className="mt-3 u-headline">Hello, {user.name.split(" ")[0]}.</h1>
        </div>

        {committed && (
          <div className="mt-6">
            <Notice tone="success">
              Give Forward locked in. We&apos;ll nudge you before the deadline.
            </Notice>
          </div>
        )}
        {rippled && (
          <div className="mt-6">
            <Notice tone="success">That&apos;s another ripple. Thank you.</Notice>
          </div>
        )}

        {(pendingForMe > 0 || toComplete > 0) && (
          <div className="mt-6">
            <Notice>
              {pendingForMe > 0 && (
                <>
                  {pendingForMe} connection {pendingForMe === 1 ? "request" : "requests"} waiting for you.{" "}
                </>
              )}
              {toComplete > 0 && (
                <>
                  {toComplete} {toComplete === 1 ? "connection is" : "connections are"} ready to mark done.{" "}
                </>
              )}
              <Link href="/connections" className="font-bold u-link">
                Open connections →
              </Link>
            </Notice>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat value={g.actsGiven} label="Acts given" accent />
          <Stat value={g.actsReceived} label="Acts received" />
          <Stat value={g.giveForwardActs} label="Given forward" />
          <Stat value={g.peopleHelped} label="People helped" />
          <Stat value={g.chains} label="Chains" />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Give forward */}
          <section>
            <h2 className="font-display text-2xl uppercase tracking-tight">
              Give Forward
            </h2>
            <div className="mt-4 space-y-3">
              {openCommitments.length === 0 && (
                <p className="border border-dashed border-line bg-white/30 p-5 text-sm text-muted">
                  No open commitments. When you receive generosity, you&apos;ll
                  be asked what you&apos;ll give forward.
                </p>
              )}
              {openCommitments.map((c) => (
                <div key={c.id} className="border border-ink bg-accent p-5">
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {c.type} · due {formatDate(c.deadline)}
                  </p>
                  <p className="mt-2 font-semibold">“{c.commitmentText}”</p>
                  <div className="mt-4">
                    <CompleteGiveForwardForm commitmentId={c.id} />
                  </div>
                </div>
              ))}
              {commitments
                .filter((c) => c.status !== "pending")
                .slice(0, 3)
                .map((c) => (
                  <div
                    key={c.id}
                    className="border border-line bg-white/40 p-4 text-sm"
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${
                        c.status === "completed"
                          ? "text-accent-ink"
                          : "text-muted"
                      }`}
                    >
                      {c.status}
                    </span>
                    <p className="mt-1 text-muted">“{c.commitmentText}”</p>
                  </div>
                ))}
            </div>
          </section>

          {/* Recent activity */}
          <section>
            <h2 className="font-display text-2xl uppercase tracking-tight">
              Recent activity
            </h2>
            <div className="mt-4">
              {activity.length === 0 ? (
                <EmptyState title="Your story starts here.">
                  Post something to give, or ask for what you need.
                </EmptyState>
              ) : (
                <ul className="space-y-0">
                  {activity.map((a) => (
                    <li
                      key={a.id}
                      className="border-t border-line py-4 first:border-t-0"
                    >
                      <p className="text-sm font-semibold">
                        {a.giverId === user.id ? "You gave" : "You received"}
                        {a.type ? ` ${a.type.toLowerCase()}` : " generosity"}
                      </p>
                      <p className="mt-1 text-sm text-muted">“{a.description}”</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                        {timeAgo(a.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* My posts */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <MyPosts
            title="My offers"
            href="/give/new"
            cta="Post a gift"
            items={myOffers.map((o) => ({
              id: o.id,
              slug: o.slug,
              title: o.title,
              status: o.status,
              base: "/give",
            }))}
          />
          <MyPosts
            title="My requests"
            href="/need/new"
            cta="Post a need"
            items={myRequests.map((r) => ({
              id: r.id,
              slug: r.slug,
              title: r.title,
              status: r.status,
              base: "/need",
            }))}
          />
        </div>
      </div>
    </main>
  );
}

function MyPosts({
  title,
  href,
  cta,
  items,
}: {
  title: string;
  href: string;
  cta: string;
  items: {
    id: string;
    slug: string;
    title: string;
    status: string;
    base: string;
  }[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl uppercase tracking-tight">{title}</h2>
        <Link href={href} className="text-xs font-bold uppercase tracking-widest u-link">
          {cta} +
        </Link>
      </div>
      <ul className="mt-4 space-y-0">
        {items.length === 0 && (
          <li className="border-t border-line py-4 text-sm text-muted">
            Nothing yet.
          </li>
        )}
        {items.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between border-t border-line py-3"
          >
            <Link href={`${i.base}/${i.slug}`} className="font-semibold u-link">
              {i.title}
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              {i.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
