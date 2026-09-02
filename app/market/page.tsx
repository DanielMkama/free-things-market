import type { Metadata } from "next";
import {
  CalendarClock,
  MapPin,
  PlusCircle,
  QrCode,
  Repeat,
  Store,
  Users,
} from "lucide-react";
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

const DAY = [
  {
    Icon: QrCode,
    title: "Arrive & scan",
    body: "Scan the QR code at the door to join the market for the day.",
  },
  {
    Icon: PlusCircle,
    title: "Post what you brought",
    body: "Add what you can give, and what you're hoping to find.",
  },
  {
    Icon: Users,
    title: "Wander & meet",
    body: "Walk the tables, swap things and skills, start conversations.",
  },
  {
    Icon: Repeat,
    title: "Keep it moving",
    body: "Carry the connections home and give forward online.",
  },
];

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

        {/* Next markets */}
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">Next markets</h2>
          <div className="mt-5 grid gap-4">
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white/30 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent-ink">
                    <CalendarClock className="size-5" />
                  </div>
                  <h3 className="font-display text-xl leading-tight tracking-tight">
                    Dates coming soon
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  No markets on the calendar yet. Join online and you&apos;ll be
                  the first to hear when the next one lands.
                </p>
              </div>
            ) : (
              upcoming.map((e) => (
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
              ))
            )}
          </div>
        </section>

        {/* Schedule — how the day works, as cards */}
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">
            How the day works
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {DAY.map(({ Icon, title, body }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent-ink">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-display text-sm text-muted">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight tracking-tight">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {body}
                </p>
              </div>
            ))}
          </div>
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
