import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfileRedirect() {
  const user = await requireUser("/profile");
  redirect(`/u/${user.handle}`);
}
