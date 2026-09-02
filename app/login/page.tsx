import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms/auth-forms";
import { Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const me = await getCurrentUser();
  if (me) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <main className="px-5 py-16 md:px-10">
      <div className="mx-auto max-w-md">
        <Eyebrow>Welcome back</Eyebrow>
        <h1 className="mt-3 u-headline">Keep it moving.</h1>
        <div className="mt-10">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
