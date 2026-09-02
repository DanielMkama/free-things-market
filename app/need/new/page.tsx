import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { RequestForm } from "@/components/forms/post-forms";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "What do you need?" };
export const dynamic = "force-dynamic";

export default async function NewNeedPage() {
  const user = await requireUser("/need/new");
  if (!user.onboarded) redirect("/onboarding");

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Ask for something</Eyebrow>
        <h1 className="mt-3 u-headline">What do you need?</h1>
        <p className="mt-4 u-lead text-muted">
          Ask for something. Someone might already have it.
        </p>
        <div className="mt-10">
          <RequestForm />
        </div>
      </div>
    </main>
  );
}
