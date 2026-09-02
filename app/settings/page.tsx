import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/forms/profile-form";
import { AvatarForm } from "@/components/forms/avatar-form";
import { Eyebrow } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  if (!user.onboarded) redirect("/onboarding");

  return (
    <main className="px-5 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Your account</Eyebrow>
        <h1 className="mt-3 u-headline">Profile settings.</h1>
        <p className="mt-4 text-sm text-muted">
          Your public profile lives at{" "}
          <Link href={`/u/${user.handle}`} className="font-bold u-link">
            /u/{user.handle}
          </Link>
        </p>
        <div className="mt-10 space-y-8">
          <AvatarForm
            name={user.name}
            color={user.avatarColor}
            url={user.avatarUrl}
          />
          <ProfileForm user={user} />
        </div>
      </div>
    </main>
  );
}
