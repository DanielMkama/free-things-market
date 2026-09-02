import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapUser, type User } from "@/lib/models";

export type { User };

/**
 * The current member, or null. Backed by Supabase Auth (`auth.users`) joined to
 * their `public.users` profile row. Suspended members are treated as logged out.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    if (!data) return null;

    const user = mapUser({ ...data, email: data.email ?? authUser.email });
    return user.suspended ? null : user;
  } catch {
    // e.g. Supabase env not configured during a build — treat as logged out.
    return null;
  }
}

export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return user;
}

export async function requireOnboardedUser(next?: string): Promise<User> {
  const user = await requireUser(next);
  if (!user.onboarded) redirect("/onboarding");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}
