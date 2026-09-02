import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "The physical market",
  description:
    "Every few months, the market comes to life in person — no money.",
};

type EventRow = {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  status: string;
};

export default async function MarketPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  const events = (data ?? []) as EventRow[];
  const upcoming = events.filter((e) => e.status !== "past");

  return (
    <main className="px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="The physical market"
          title="The market comes to life."
        >
          Every few months, people meet in person to exchange things, skills,
          time and knowledge — without money. Then the relationships continue
          here.
        </SectionHeading>

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">Next markets</h2>
          <div className="mt-4">
            {upcoming.length === 0 ? (
              <p className="border border-dashed border-line bg-white/30 p-6 text-muted">
                No dates announced yet. Join the market online and you&apos;ll
                be the first to know.
              </p>
            ) : (
              <ul className="grid gap-px border border-line bg-line">
                {upcoming.map((e) => (
                  <li key={e.id} className="bg-paper p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-xl tracking-tight">
                        {e.name}
                      </p>
                      <span className="text-xs font-bold tracking-widest text-accent-ink">
                        {formatDate(e.date)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-muted">
                      {e.location}
                    </p>
                    <p className="mt-3 text-sm text-muted">{e.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">
            How the day works
          </h2>
          <ol className="mt-4 space-y-3 text-muted">
            <li>1. Scan a QR code at the door to join the market.</li>
            <li>
              2. Post what you brought to give, and what you&apos;re after.
            </li>
            <li>3. Wander. Meet people. Exchange.</li>
            <li>4. Keep giving forward online after you leave.</li>
          </ol>
          <p className="mt-6 text-sm text-muted">
            The physical event isn&apos;t the whole project — it&apos;s the
            real-world layer of the digital generosity network.
          </p>
        </section>

        <Link
          href="/signup"
          className="mt-12 inline-flex items-center gap-2 border-2 border-ink px-6 py-4 font-bold tracking-wide hover:bg-ink hover:text-paper"
        >
          Join the market
        </Link>
      </div>
    </main>
  );
}
