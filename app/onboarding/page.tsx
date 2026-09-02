import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  if (user.onboarded) redirect("/dashboard");

  return (
    <main className="px-5 py-16 md:px-10">
      <div className="mx-auto max-w-xl">
        <Eyebrow>Welcome to the market</Eyebrow>
        <h1 className="mt-3 u-headline">Let&apos;s set you up.</h1>
        <p className="mt-4 u-lead text-muted">
          Four quick questions. Then you&apos;re in.
        </p>
        <div className="mt-10">
          <OnboardingForm defaultName={user.name} />
        </div>
      </div>
    </main>
  );
}
