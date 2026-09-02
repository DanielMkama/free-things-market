import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OfferForm } from "@/components/forms/post-forms";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "What can you give?" };
export const dynamic = "force-dynamic";

export default async function NewGivePage() {
  const user = await requireUser("/give/new");
  if (!user.onboarded) redirect("/onboarding");

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Give something</Eyebrow>
        <h1 className="mt-3 u-headline">What can you give?</h1>
        <p className="mt-4 u-lead text-muted">
          You probably have more to give than you think.
        </p>
        <div className="mt-10">
          <OfferForm />
        </div>
      </div>
    </main>
  );
}
