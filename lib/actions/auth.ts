"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { serializeTags } from "@/lib/utils";
import type { FormState } from "@/lib/form-state";

export type { FormState };

const ACCENTS = [
  "#ceff1a",
  "#ffb020",
  "#7cc4ff",
  "#ff8da8",
  "#b0e57c",
  "#e0c3fc",
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function csv(form: FormData, key: string): string[] {
  return String(form.get(key) ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Please tell us your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "That email doesn't look right." };
  if (password.length < 8)
    return { error: "Use a password with at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${SITE_URL}/dashboard`,
    },
  });

  if (error) {
    if (/registered|exists/i.test(error.message))
      return { error: "An account with that email already exists." };
    return { error: error.message };
  }
  if (!data.user) return { error: "Could not create the account. Try again." };

  // The handle_new_user trigger has created the public.users row; give it a
  // random accent and make sure the name is stored.
  await supabase
    .from("users")
    .update({
      name,
      avatar_color: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
    })
    .eq("id", data.user.id);

  track("user_signed_up", { userId: data.user.id });
  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function logInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user)
    return { error: "Email or password is incorrect." };

  const { data: profile } = await supabase
    .from("users")
    .select("onboarded, suspended")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.suspended) {
    await supabase.auth.signOut();
    return { error: "This account is suspended. Contact the market team." };
  }

  revalidatePath("/", "layout");
  redirect(
    next && next.startsWith("/")
      ? next
      : profile?.onboarded
        ? "/dashboard"
        : "/onboarding",
  );
}

export async function logOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function completeOnboardingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      name: String(formData.get("name") ?? "").trim() || user.name,
      city: String(formData.get("city") ?? "").trim() || null,
      country: String(formData.get("country") ?? "").trim() || null,
      headline: String(formData.get("headline") ?? "").trim() || null,
      give_tags: serializeTags(csv(formData, "giveTags")),
      need_tags: serializeTags(csv(formData, "needTags")),
      onboarded: true,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Name can't be empty." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      name,
      headline: String(formData.get("headline") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      country: String(formData.get("country") ?? "").trim() || null,
      give_tags: serializeTags(csv(formData, "giveTags")),
      need_tags: serializeTags(csv(formData, "needTags")),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath(`/u/${user.handle}`);
  return { ok: "Profile saved." };
}
