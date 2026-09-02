"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { slugify, randomSuffix } from "@/lib/utils";
import {
  OFFER_TYPES,
  CATEGORIES,
  AVAILABILITY,
  URGENCY,
} from "@/lib/taxonomy";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormState } from "@/lib/form-state";

export type { FormState };

async function uniqueSlug(
  supabase: SupabaseClient,
  table: "offers" | "requests",
  title: string,
): Promise<string> {
  const base = slugify(title) || table.slice(0, -1);
  for (let i = 0; i < 6; i++) {
    const slug = `${base}-${randomSuffix(4)}`;
    const { data } = await supabase
      .from(table)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
  }
  return `${base}-${randomSuffix(8)}`;
}

export async function createOfferAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireOnboardedUser("/give/new");

  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const onlineAvailable = formData.get("onlineAvailable") != null;
  const availabilityRaw = String(formData.get("availability") ?? "");
  const capacity = String(formData.get("capacity") ?? "").trim() || null;

  if (!OFFER_TYPES.includes(type as never))
    return { error: "Choose what kind of gift this is." };
  if (title.length < 4) return { error: "Give your offer a clear title." };
  if (description.length < 10)
    return { error: "Add a sentence or two describing what you're giving." };
  if (!CATEGORIES.includes(category as never))
    return { error: "Pick a category." };
  if (!city && !onlineAvailable)
    return { error: "Add a location, or mark it as available online." };

  const availability = AVAILABILITY.includes(availabilityRaw as never)
    ? availabilityRaw
    : null;

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, "offers", title);
  const { error } = await supabase.from("offers").insert({
    slug,
    user_id: user.id,
    type,
    title,
    description,
    category,
    city,
    country,
    online_available: onlineAvailable,
    availability,
    capacity,
    status: "active",
  });
  if (error) return { error: error.message };

  await track("offer_created", { userId: user.id, meta: { type, category } });
  revalidatePath("/give");
  revalidatePath("/impact");
  redirect(`/give/${slug}`);
}

export async function createRequestAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireOnboardedUser("/need/new");

  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const onlineAvailable = formData.get("onlineAvailable") != null;
  const urgencyRaw = String(formData.get("urgency") ?? "Whenever");

  if (!OFFER_TYPES.includes(type as never))
    return { error: "Choose what kind of thing you need." };
  if (title.length < 4) return { error: "Give your request a clear title." };
  if (description.length < 10)
    return { error: "Add a sentence or two about what would help." };
  if (!CATEGORIES.includes(category as never))
    return { error: "Pick a category." };
  if (!city && !onlineAvailable)
    return { error: "Add a location, or mark it as fine online." };

  const urgency = URGENCY.includes(urgencyRaw as never) ? urgencyRaw : "Whenever";

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, "requests", title);
  const { error } = await supabase.from("requests").insert({
    slug,
    user_id: user.id,
    type,
    title,
    description,
    category,
    city,
    country,
    online_available: onlineAvailable,
    urgency,
    status: "active",
  });
  if (error) return { error: error.message };

  await track("request_created", { userId: user.id, meta: { type, category } });
  revalidatePath("/need");
  revalidatePath("/impact");
  redirect(`/need/${slug}`);
}

export async function pauseOfferAction(formData: FormData): Promise<void> {
  const user = await requireOnboardedUser();
  const id = String(formData.get("offerId") ?? "");
  const target = String(formData.get("status") ?? "paused");
  const allowed = ["active", "paused", "completed"];
  if (!allowed.includes(target)) return;

  const supabase = await createClient();
  // RLS (offers_update: auth.uid() = user_id) also guards this.
  await supabase
    .from("offers")
    .update({ status: target })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/give");
  revalidatePath("/dashboard");
}
