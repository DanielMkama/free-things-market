import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/forms/auth-forms";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Join the market" };
export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const me = await getCurrentUser();
  if (me) redirect(me.onboarded ? "/dashboard" : "/onboarding");
  const { email } = await searchParams;

  return (
    <main className="px-5 py-16 md:px-10">
      <div className="mx-auto grid max-w-[1100px] gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>Join the market</Eyebrow>
          <h1 className="mt-3 u-display text-[clamp(3rem,9vw,6rem)]">
            Give
            <br />
            something.
            <br />
            Start
            <br />
            something.
          </h1>
          <p className="mt-6 max-w-sm u-lead text-muted">
            No prices, no selling, no donors, no beneficiaries. Everyone here
            both gives and receives.
          </p>
        </div>
        <div className="border border-ink bg-white/50 p-6 md:p-8">
          <SignupForm defaultEmail={email} />
        </div>
      </div>
    </main>
  );
}
