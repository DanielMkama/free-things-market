import type { Metadata } from "next";
import Link from "next/link";
import { getImpactStats } from "@/lib/stats";
import { listChains } from "@/lib/chains";
import { Stat, SectionHeading, Flow } from "@/components/ui/primitives";
import { ChainViz } from "@/components/chain-viz";
import { Marquee } from "@/components/ui/marquee";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Community impact",
  description: "Generosity generated — not money raised.",
};

export default async function ImpactPage() {
  const [stats, chains] = await Promise.all([getImpactStats(), listChains(8)]);
  const pct = Math.round(stats.giveForwardRate * 100);

  return (
    <main>
      <section className="border-b border-line px-5 py-16 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading
            eyebrow="Community impact"
            title="Look what we're giving."
          >
            We don&apos;t measure money moved. We measure generosity generated.
          </SectionHeading>
          <div className="mt-10">
            <Flow steps={["Give", "Connect", "Receive", "Give forward"]} />
          </div>
        </div>
      </section>

      <Marquee
        dark
        items={[
          `${stats.actsCompleted} acts of generosity`,
          `${stats.peopleGiving} people giving`,
          `${stats.chains} chains`,
          `${stats.hoursGiven} hours given`,
        ]}
      />

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <Stat value={stats.peopleParticipating} label="People participating" accent />
            <Stat value={stats.offers} label="Offers created" />
            <Stat value={stats.requests} label="Requests created" />
            <Stat value={stats.connectionsMade} label="Connections made" />
            <Stat value={stats.actsCompleted} label="Acts completed" />
            <Stat value={stats.thingsGiven} label="Things given" />
            <Stat value={stats.skillsShared} label="Skills shared" />
            <Stat value={stats.hoursGiven} label="Hours given" />
            <Stat
              value={stats.giveForwardCommitments}
              label="Give-forward commitments"
            />
            <Stat
              value={stats.giveForwardCompleted}
              label="Give-forward acts completed"
            />
            <Stat value={`${pct}%`} label="Give-forward completion rate" />
            <Stat value={stats.chains} label="Generosity chains" />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-deep px-5 py-16 md:px-10">
        <div className="mx-auto max-w-[1000px]">
          <SectionHeading
            eyebrow="Generosity chains"
            title="One act can start a chain."
          >
            When someone gives, receives, and gives forward — and the next person
            does too — a chain forms.
          </SectionHeading>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {chains.length === 0 && (
              <p className="text-muted">
                No chains yet. The first one starts when someone completes a Give
                Forward.
              </p>
            )}
            {chains.map((c) => (
              <Link key={c.id} href={`/chain/${c.id}`} className="block">
                <ChainViz chain={c} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
