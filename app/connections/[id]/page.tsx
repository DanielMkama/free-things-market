import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapConnection, mapUser } from "@/lib/models";
import { getActByConnection } from "@/lib/queries";
import { Avatar, Eyebrow } from "@/components/ui/primitives";
import { Notice } from "@/components/ui/notice";
import { CompleteActForm } from "@/components/forms/complete-act-form";
import { CreateGiveForwardForm } from "@/components/forms/give-forward-forms";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connection" };

export default async function ConnectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const user = await requireUser();
  if (!user.onboarded) redirect("/onboarding");
  const { id } = await params;
  const { done } = await searchParams;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("connections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();
  const conn = mapConnection(row as Record<string, unknown>);
  if (conn.giverId !== user.id && conn.receiverId !== user.id) notFound();

  const [giverRes, receiverRes, offerRes, requestRes, act] = await Promise.all([
    supabase.from("users").select("*").eq("id", conn.giverId).single(),
    supabase.from("users").select("*").eq("id", conn.receiverId).single(),
    conn.offerId
      ? supabase.from("offers").select("slug, title").eq("id", conn.offerId).maybeSingle()
      : Promise.resolve({ data: null }),
    conn.requestId
      ? supabase.from("requests").select("slug, title").eq("id", conn.requestId).maybeSingle()
      : Promise.resolve({ data: null }),
    getActByConnection(conn.id),
  ]);

  const giver = mapUser(giverRes.data as Record<string, unknown>);
  const receiver = mapUser(receiverRes.data as Record<string, unknown>);
  const other = conn.giverId === user.id ? receiver : giver;
  const iAmReceiver = conn.receiverId === user.id;
  const offer = offerRes.data as { slug: string; title: string } | null;
  const request = requestRes.data as { slug: string; title: string } | null;

  const existingCommitment = act
    ? ((
        await supabase
          .from("give_forward_commitments")
          .select("id, commitment_text, deadline, status")
          .eq("trigger_act_id", act.id)
          .maybeSingle()
      ).data as
        | { id: string; commitment_text: string; deadline: string; status: string }
        | null)
    : null;

  const thing = offer?.title ?? request?.title ?? "generosity";

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/connections"
          className="text-xs font-bold uppercase tracking-widest text-muted u-link"
        >
          ← All connections
        </Link>

        <Eyebrow className="mt-6">
          {conn.giverId === user.id ? "You are giving" : "You are receiving"}
        </Eyebrow>
        <h1 className="mt-3 u-headline">{thing}</h1>

        <div className="mt-6 flex items-center gap-3 border border-line bg-white/40 p-4">
          <Avatar
            name={other.name}
            color={other.avatarColor}
            url={other.avatarUrl}
            size={44}
          />
          <div>
            <Link href={`/u/${other.handle}`} className="font-bold u-link">
              {other.name}
            </Link>
            <p className="text-sm text-muted">
              {other.headline ?? "Member of the market"}
            </p>
          </div>
        </div>

        {conn.message ? (
          <p className="mt-4 border-l-2 border-ink pl-4 text-muted">
            “{conn.message}”
          </p>
        ) : null}

        {/* Status-driven body */}
        <div className="mt-8">
          {conn.status === "pending" && (
            <Notice>
              {conn.initiatorId === user.id
                ? `Waiting for ${other.name} to accept.`
                : `${other.name} wants to connect. Respond from your connections list.`}
            </Notice>
          )}

          {conn.status === "declined" && (
            <Notice>This connection was declined.</Notice>
          )}

          {conn.status === "accepted" && (
            <div className="space-y-6">
              <div className="border border-ink bg-accent p-5">
                <p className="text-xs font-bold uppercase tracking-widest">
                  You&apos;re connected
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Reach {other.name} at{" "}
                  <a href={`mailto:${other.email}`} className="u-link">
                    {other.email}
                  </a>
                </p>
                <p className="mt-2 text-xs text-muted">
                  Meet in a safe public place if you don&apos;t know each other.
                  No money changes hands.
                </p>
              </div>
              <CompleteActForm
                connectionId={conn.id}
                defaultType={offer ? undefined : null}
              />
            </div>
          )}

          {conn.status === "completed" && act && (
            <div className="space-y-6">
              {done && (
                <div className="border border-ink bg-accent p-6 text-center">
                  <p className="font-display text-3xl uppercase tracking-tight">
                    You just created an act of generosity ❤️
                  </p>
                </div>
              )}

              <div className="border border-line bg-white/40 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                  The act · {formatDate(act.createdAt)}
                </p>
                <p className="mt-2 font-semibold">“{act.description}”</p>
                {act.hours ? (
                  <p className="mt-1 text-sm text-muted">
                    {act.hours} {act.hours === 1 ? "hour" : "hours"} given
                  </p>
                ) : null}
              </div>

              {iAmReceiver ? (
                existingCommitment ? (
                  <div className="border border-ink bg-white/50 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-accent-ink">
                      Your Give Forward
                    </p>
                    <p className="mt-2 font-semibold">
                      “{existingCommitment.commitment_text}”
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {existingCommitment.status === "pending"
                        ? `Due ${formatDate(existingCommitment.deadline)}`
                        : existingCommitment.status}
                    </p>
                    <Link
                      href="/dashboard"
                      className="mt-3 inline-block text-xs font-bold uppercase tracking-widest u-link"
                    >
                      Track it on your dashboard →
                    </Link>
                  </div>
                ) : (
                  <CreateGiveForwardForm triggerActId={act.id} />
                )
              ) : (
                <Notice>
                  {other.name} received your generosity. If they give forward, a
                  chain begins.
                </Notice>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
