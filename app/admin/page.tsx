import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getImpactStats } from "@/lib/stats";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Stat, Eyebrow } from "@/components/ui/primitives";
import { Notice } from "@/components/ui/notice";
import {
  adminSetOfferHidden,
  adminRemoveOffer,
  adminSetRequestHidden,
  adminRemoveRequest,
  adminSetUserSuspended,
  adminResolveReport,
  adminRunReminders,
} from "@/lib/actions/moderation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

type CountQuery = ReturnType<ReturnType<SupabaseClient["from"]>["select"]>;

async function countRows(
  db: SupabaseClient,
  table: string,
  build?: (q: CountQuery) => CountQuery,
): Promise<number> {
  const base = db.from(table).select("*", {
    count: "exact",
    head: true,
  }) as CountQuery;
  const { count } = await (build ? build(base) : base);
  return count ?? 0;
}

const flatAuthor = (r: Record<string, unknown>) => {
  const a = Array.isArray(r.author) ? r.author[0] : r.author;
  return {
    ...r,
    author: (a as { name?: string } | null)?.name ?? "—",
  };
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ reminders?: string }>;
}) {
  await requireAdmin();
  const { reminders } = await searchParams;
  const db = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    stats,
    usersTotal,
    usersOnboarded,
    usersSuspended,
    usersLast7,
    connPending,
    connAccepted,
    connCompleted,
    openReportsRes,
    recentOffersRes,
    recentRequestsRes,
    userRowsRes,
    offersForCatRes,
  ] = await Promise.all([
    getImpactStats(),
    countRows(db, "users"),
    countRows(db, "users", (q) => q.eq("onboarded", true)),
    countRows(db, "users", (q) => q.eq("suspended", true)),
    countRows(db, "users", (q) => q.gte("created_at", sevenDaysAgo)),
    countRows(db, "connections", (q) => q.eq("status", "pending")),
    countRows(db, "connections", (q) => q.eq("status", "accepted")),
    countRows(db, "connections", (q) => q.eq("status", "completed")),
    db
      .from("reports")
      .select("*, author:users!reports_reporter_id_fkey(name)")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    db
      .from("offers")
      .select(
        "id, slug, title, category, status, hidden_by_admin, author:users!offers_user_id_fkey(name)",
      )
      .order("created_at", { ascending: false })
      .limit(15),
    db
      .from("requests")
      .select(
        "id, slug, title, category, status, hidden_by_admin, author:users!requests_user_id_fkey(name)",
      )
      .order("created_at", { ascending: false })
      .limit(15),
    db
      .from("users")
      .select("id, name, email, handle, role, suspended, onboarded, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    db.from("offers").select("category").neq("status", "removed"),
  ]);

  const users = {
    total: usersTotal,
    onboarded: usersOnboarded,
    suspended: usersSuspended,
    last7: usersLast7,
  };
  const conns = {
    pending: connPending,
    accepted: connAccepted,
    completed: connCompleted,
  };

  const openReports = (openReportsRes.data ?? []).map((r) =>
    flatAuthor(r as Record<string, unknown>),
  ) as Record<string, string>[];
  const recentOffers = (recentOffersRes.data ?? []).map((r) =>
    flatAuthor(r as Record<string, unknown>),
  ) as Record<string, string | number>[];
  const recentRequests = (recentRequestsRes.data ?? []).map((r) =>
    flatAuthor(r as Record<string, unknown>),
  ) as Record<string, string | number>[];
  const userRows = (userRowsRes.data ?? []) as Record<
    string,
    string | number
  >[];

  const catCounts = new Map<string, number>();
  for (const row of offersForCatRes.data ?? []) {
    const key = String((row as { category: string }).category);
    catCounts.set(key, (catCounts.get(key) ?? 0) + 1);
  }
  const offersByCat = [...catCounts.entries()]
    .map(([category, cnt]) => ({ category, c: cnt }))
    .sort((a, b) => b.c - a.c);

  const gfPct = Math.round(stats.giveForwardRate * 100);

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1300px]">
        <div className="flex items-end justify-between border-b border-line pb-6">
          <div>
            <Eyebrow>Admin</Eyebrow>
            <h1 className="mt-3 u-headline">The control room.</h1>
          </div>
          <form action={adminRunReminders}>
            <button className="border border-ink px-4 py-2 text-xs font-bold tracking-widest hover:bg-ink hover:text-paper">
              Run give-forward reminders
            </button>
          </form>
        </div>

        {reminders && (
          <div className="mt-6">
            <Notice tone="success">
              Reminders processed. Check the server console for dev emails.
            </Notice>
          </div>
        )}

        {/* Metric groups */}
        <Section title="Users">
          <Stat value={users.total} label="Total users" accent />
          <Stat value={users.last7} label="New (7 days)" />
          <Stat value={users.onboarded} label="Onboarded" />
          <Stat value={users.suspended} label="Suspended" />
        </Section>

        <Section title="Offers & requests">
          <Stat value={stats.offers} label="Offers" accent />
          <Stat value={stats.requests} label="Requests" />
          <Stat value={stats.requestsFulfilled} label="Requests fulfilled" />
          <Stat value={openReports.length} label="Open reports" />
        </Section>

        <Section title="Connections">
          <Stat value={conns.pending} label="Pending" accent />
          <Stat value={conns.accepted} label="Accepted" />
          <Stat value={conns.completed} label="Completed" />
          <Stat value={stats.connectionsMade} label="Made (acc.+comp.)" />
        </Section>

        <Section title="Generosity">
          <Stat value={stats.actsCompleted} label="Total acts" accent />
          <Stat
            value={stats.giveForwardCommitments}
            label="Give-forward commitments"
          />
          <Stat value={`${gfPct}%`} label="Give-forward completion" />
          <Stat value={stats.chains} label="Active chains" />
        </Section>

        <div className="mt-6 border border-line bg-white/40 p-5">
          <p className="text-xs font-bold tracking-widest text-muted">
            Offers by category
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {offersByCat.map((r) => (
              <span key={r.category} className="border border-line px-2 py-1">
                {r.category} · <strong>{r.c}</strong>
              </span>
            ))}
            {offersByCat.length === 0 && (
              <span className="text-muted">No offers yet.</span>
            )}
          </div>
        </div>

        {/* Moderation: reports */}
        <h2 className="mt-14 font-display text-2xl tracking-tight">
          Open reports
        </h2>
        {openReports.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing flagged. 🎉</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {openReports.map((r) => (
              <li key={r.id} className="border border-ink bg-white/50 p-4">
                <div className="flex flex-wrap justify-between gap-2 text-xs font-bold tracking-widest text-muted">
                  <span>
                    {r.content_type} · {r.reason}
                  </span>
                  <span>
                    by {r.reporter_name} · {formatDate(String(r.created_at))}
                  </span>
                </div>
                {r.detail ? <p className="mt-2 text-sm">“{r.detail}”</p> : null}
                <p className="mt-2 text-xs text-muted">
                  Content id: {r.content_id}
                </p>
                <div className="mt-3 flex gap-2">
                  <form action={adminResolveReport}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="status" value="reviewed" />
                    <button className="border border-ink px-3 py-1.5 text-xs font-bold tracking-widest hover:bg-ink hover:text-paper">
                      Mark reviewed
                    </button>
                  </form>
                  <form action={adminResolveReport}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button className="px-3 py-1.5 text-xs font-bold tracking-widest text-muted u-link">
                      Dismiss
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Offers table */}
        <h2 className="mt-14 font-display text-2xl tracking-tight">
          Recent offers
        </h2>
        <ModTable
          rows={recentOffers}
          base="/give"
          hideAction={adminSetOfferHidden}
          removeAction={adminRemoveOffer}
          idField="offerId"
        />

        {/* Requests table */}
        <h2 className="mt-14 font-display text-2xl tracking-tight">
          Recent requests
        </h2>
        <ModTable
          rows={recentRequests}
          base="/need"
          hideAction={adminSetRequestHidden}
          removeAction={adminRemoveRequest}
          idField="requestId"
        />

        {/* Users table */}
        <h2 className="mt-14 font-display text-2xl tracking-tight">Users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink text-left text-xs tracking-widest text-muted">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {userRows.map((u) => (
                <tr key={u.id} className="border-b border-line">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/u/${u.handle}`}
                      className="u-link font-semibold"
                    >
                      {u.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-muted">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4 text-muted">
                    {formatDate(String(u.created_at))}
                  </td>
                  <td className="py-2 pr-4">
                    {u.suspended ? "suspended" : u.onboarded ? "active" : "new"}
                  </td>
                  <td className="py-2">
                    {u.role !== "admin" && (
                      <form action={adminSetUserSuspended}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="suspended"
                          value={u.suspended ? "0" : "1"}
                        />
                        <button className="text-xs font-bold tracking-widest u-link">
                          {u.suspended ? "Unsuspend" : "Suspend"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-bold tracking-widest text-muted">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

function ModTable({
  rows,
  base,
  hideAction,
  removeAction,
  idField,
}: {
  rows: Record<string, string | number>[];
  base: string;
  hideAction: (fd: FormData) => void;
  removeAction: (fd: FormData) => void;
  idField: string;
}) {
  if (rows.length === 0)
    return <p className="mt-3 text-sm text-muted">Nothing yet.</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink text-left text-xs tracking-widest text-muted">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Author</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2">Moderation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line">
              <td className="py-2 pr-4">
                <Link
                  href={`${base}/${r.slug}`}
                  className="u-link font-semibold"
                >
                  {r.title}
                </Link>
              </td>
              <td className="py-2 pr-4 text-muted">{r.author}</td>
              <td className="py-2 pr-4">{r.category}</td>
              <td className="py-2 pr-4">
                {r.status}
                {r.hidden_by_admin ? " · hidden" : ""}
              </td>
              <td className="py-2">
                <div className="flex gap-3">
                  <form action={hideAction}>
                    <input type="hidden" name={idField} value={r.id} />
                    <input
                      type="hidden"
                      name="hidden"
                      value={r.hidden_by_admin ? "0" : "1"}
                    />
                    <button className="text-xs font-bold tracking-widest u-link">
                      {r.hidden_by_admin ? "Unhide" : "Hide"}
                    </button>
                  </form>
                  {r.status !== "removed" && (
                    <form action={removeAction}>
                      <input type="hidden" name={idField} value={r.id} />
                      <button className="text-xs font-bold tracking-widest text-red-700 u-link">
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
