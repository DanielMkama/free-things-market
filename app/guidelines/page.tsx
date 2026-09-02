import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "How to keep The Free Things Market safe and kind.",
};

const NOT_ALLOWED = [
  "Illegal goods",
  "Dangerous goods",
  "Weapons",
  "Drugs",
  "Hate or harassment",
  "Sexual services",
  "Fraud or scams",
  "Asking for money in exchange",
  "Anything clearly unsafe",
];

export default function GuidelinesPage() {
  return (
    <main className="px-5 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Community guidelines"
          title="Be generous. Be safe. Be kind."
        >
          The market only works if people can trust it. A few simple rules keep
          it that way.
        </SectionHeading>

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">
            What&apos;s not allowed
          </h2>
          <ul className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2">
            {NOT_ALLOWED.map((x) => (
              <li key={x} className="bg-paper p-4 font-semibold">
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            See something that breaks these rules? Use the{""}
            <strong>Report</strong> link on any offer, request or profile. The
            team reviews every report.
          </p>
        </section>

        <section id="safety" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-2xl tracking-tight">
            Meeting safely
          </h2>
          <div className="mt-4 space-y-3 text-muted">
            <p>
              <strong className="text-ink">Meet in safe public places</strong>
              {""}
              when meeting someone you don&apos;t know — a café, a library, a
              busy street.
            </p>
            <p>Tell a friend where you&apos;re going and when.</p>
            <p>
              Trust your instincts. If something feels off, you can always walk
              away — no explanation owed.
            </p>
            <p>
              Keep the first conversation on the platform or over email until
              you feel comfortable.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-tight">
            The spirit of it
          </h2>
          <p className="mt-4 text-muted">
            Nobody here is a donor and nobody is a beneficiary. If someone helps
            you, you don&apos;t owe them anything — you just have the chance to
            help someone else. Giving does not create debt.
          </p>
        </section>
      </div>
    </main>
  );
}
