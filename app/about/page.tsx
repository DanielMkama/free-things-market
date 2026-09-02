import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading, Flow } from "@/components/ui/primitives";
import { Marquee } from "@/components/ui/marquee";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The Free Things Market is a place to give what you have and ask for what you need — without money.",
};

const STEPS = [
  ["01 — Give", "Share something you can give: a thing, a skill, an hour, something you know, an introduction."],
  ["02 — Connect", "Find someone who needs it. Or post what you need and let someone find you."],
  ["03 — Receive", "Someone helps you. No money changes hands. Receiving here doesn't make you a beneficiary — it makes you a participant."],
  ["04 — Give forward", "Pass the generosity on. Not back to the person who helped you — forward, to someone else."],
];

const RULES = [
  "No buying. No selling. No monetary prices.",
  "Everyone can give. Everyone can receive.",
  "Giving does not create debt.",
  "Receiving encourages giving forward.",
  "Generosity is never measured in money.",
  "Nobody is ranked by how much they give.",
  "The platform exists to create connections, not transactions.",
];

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-line px-5 py-16 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading
            eyebrow="About the experiment"
            title="A market where money isn't the medium."
          >
            The Free Things Market is a digital generosity platform. People offer
            things, skills, time, knowledge and connections — and ask for what
            they need — without money being involved.
          </SectionHeading>
        </div>
      </section>

      <Marquee items={["Give", "Connect", "Receive", "Give forward"]} />

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-px border border-line bg-line md:grid-cols-2">
          {STEPS.map(([title, body]) => (
            <div key={title} className="bg-paper p-8">
              <h3 className="font-display text-2xl uppercase tracking-tight">
                {title}
              </h3>
              <p className="mt-3 text-muted">{body}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[1500px]">
          <Flow steps={["Give", "Connect", "Receive", "Give forward"]} />
        </div>
      </section>

      <section className="border-y border-line bg-paper-deep px-5 py-16 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading eyebrow="What we hold to" title="The rules." />
          <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
            {RULES.map((r, i) => (
              <li key={r} className="flex gap-4 bg-paper-deep p-6">
                <span className="font-display text-xl text-accent-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-semibold">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Not charity"
              title="Everyone is a participant."
            >
              A student gives a book. A designer gives a logo consultation. A
              developer gives an hour of coding help. A parent gives a homemade
              meal. A mechanic fixes a bicycle. Someone gives one hour of their
              time. Everyone has something to give — and everyone is allowed to
              ask.
            </SectionHeading>
          </div>
          <div className="border border-ink bg-white/50 p-6">
            <p className="font-display text-xl uppercase tracking-tight">
              The market comes to life
            </p>
            <p className="mt-3 text-sm text-muted">
              Every few months, people meet in person to exchange things, skills,
              time and knowledge — without money. The physical market is the
              real-world layer of this network.
            </p>
            <Link
              href="/market"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide u-link"
            >
              See the next market <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-accent px-5 py-16 md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="u-eyebrow">The question</p>
            <h2 className="mt-3 u-headline max-w-2xl">
              What happens when we make generosity easier?
            </h2>
          </div>
          <Link
            href="/signup"
            className="inline-flex w-fit items-center gap-2 border-2 border-ink px-6 py-4 font-bold uppercase tracking-wide hover:bg-ink hover:text-paper"
          >
            Join the market <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
