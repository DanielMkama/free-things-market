import type { Metadata } from "next";
import { Store, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/primitives";
import { EventCard } from "@/components/ui/event-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
          <div className="mt-5">
            {upcoming.length === 0 ? (
              <p className="border border-dashed border-line bg-white/30 p-6 text-muted">
                No dates announced yet. Join the market online and you&apos;ll
                be the first to know.
              </p>
            ) : (
              <div className="grid gap-4">
                {upcoming.map((e) => (
                  <EventCard
                    key={e.id}
                    icon={<Store className="size-5" />}
                    title={e.name}
                    description={e.description}
                    date={shortDate(e.date)}
                    locationIcon={<MapPin className="size-4 text-accent-ink" />}
                    location={e.location}
                    frequency="A few months"
                  />
                ))}
              </div>
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

        <div className="mt-12">
          <ShimmerButton href="/signup" className="w-fit">
            Join the market
          </ShimmerButton>
        </div>
      </div>
    </main>
  );
}
