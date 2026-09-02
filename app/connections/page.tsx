import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConnectionsForUser, type ConnectionView } from "@/lib/queries";
import { Avatar, Eyebrow, EmptyState } from "@/components/ui/primitives";
import { ConnectionRespond } from "@/components/forms/connection-respond";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connections" };

export default async function ConnectionsPage() {
  const user = await requireUser("/connections");
  if (!user.onboarded) redirect("/onboarding");

  const all = await getConnectionsForUser(user.id);
  const responder = (c: ConnectionView) =>
    c.initiatorId === c.giverId ? c.receiverId : c.giverId;

  const inbox = all.filter(
    (c) => c.status === "pending" && responder(c) === user.id,
  );
  const waiting = all.filter(
    (c) => c.status === "pending" && responder(c) !== user.id,
  );
  const active = all.filter((c) => c.status === "accepted");
  const done = all.filter((c) => c.status === "completed");
  const closed = all.filter((c) => c.status === "declined");

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-[1000px]">
        <Eyebrow>Your connections</Eyebrow>
        <h1 className="mt-3 u-headline">Who you&apos;re helping.</h1>

        {all.length === 0 && (
          <div className="mt-10">
            <EmptyState
              title="No connections yet."
              action={{ href: "/give", label: "Explore the market" }}
            >
              Reach out on the give or need board and your connections will show
              up here.
            </EmptyState>
          </div>
        )}

        <Group title="Waiting for you" items={inbox} me={user.id}>
          {(c) => <ConnectionRespond connectionId={c.id} />}
        </Group>

        <Group title="Ready — did it happen?" items={active} me={user.id}>
          {(c) => (
            <Link
              href={`/connections/${c.id}`}
              className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper"
            >
              Mark it done
            </Link>
          )}
        </Group>

        <Group title="Waiting on them" items={waiting} me={user.id}>
          {() => (
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              Pending
            </span>
          )}
        </Group>

        <Group title="Completed" items={done} me={user.id}>
          {(c) => (
            <Link
              href={`/connections/${c.id}`}
              className="text-xs font-bold uppercase tracking-widest text-accent-ink u-link"
            >
              View act →
            </Link>
          )}
        </Group>

        <Group title="Declined" items={closed} me={user.id} muted>
          {() => null}
        </Group>
      </div>
    </main>
  );
}

function Group({
  title,
  items,
  me,
  muted = false,
  children,
}: {
  title: string;
  items: ConnectionView[];
  me: string;
  muted?: boolean;
  children: (c: ConnectionView) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className={`mt-10 ${muted ? "opacity-60" : ""}`}>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
        {title} · {items.length}
      </h2>
      <ul className="mt-3">
        {items.map((c) => {
          const other = c.giverId === me ? c.receiver : c.giver;
          const iAmGiver = c.giverId === me;
          const thing = c.offer?.title ?? c.request?.title ?? "generosity";
          return (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-5"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  name={other.name}
                  color={other.avatarColor}
                  url={other.avatarUrl}
                  size={40}
                />
                <div>
                  <p className="font-semibold">
                    {iAmGiver ? "You give · " : "You receive · "}
                    <Link href={`/u/${other.handle}`} className="u-link">
                      {other.name}
                    </Link>
                  </p>
                  <p className="text-sm text-muted">
                    {thing} · {timeAgo(c.createdAt)}
                  </p>
                  {c.message ? (
                    <p className="mt-1 text-sm text-muted">“{c.message}”</p>
                  ) : null}
                </div>
              </div>
              <div>{children(c)}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
