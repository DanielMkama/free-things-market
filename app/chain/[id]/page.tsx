import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChain } from "@/lib/chains";
import { ChainViz } from "@/components/chain-viz";
import { Eyebrow } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A generosity chain" };

export default async function ChainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chain = await getChain(id);
  if (!chain || chain.steps.length < 2) notFound();

  const names = new Set<string>();
  chain.steps.forEach((s) => {
    names.add(s.giverName);
    if (s.receiverName) names.add(s.receiverName);
  });

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/impact"
          className="text-xs font-bold tracking-widest text-muted u-link"
        >
          ← Community impact
        </Link>
        <Eyebrow className="mt-6">A generosity chain</Eyebrow>
        <h1 className="mt-3 u-headline">This generosity is moving.</h1>
        <p className="mt-4 u-lead text-muted">
          One act became {chain.steps.length}. {names.size} people, one ripple.
        </p>
        <div className="mt-8">
          <ChainViz chain={chain} />
        </div>
      </div>
    </main>
  );
}
