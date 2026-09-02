"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOnboardedUser, requireAdmin } from "@/lib/auth";
import { REPORT_REASONS } from "@/lib/taxonomy";
import type { FormState } from "@/lib/form-state";

export type { FormState };

export async function reportContentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requireOnboardedUser();
  const contentType = String(formData.get("contentType") ?? "");
  const contentId = String(formData.get("contentId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const detail = String(formData.get("detail") ?? "").trim() || null;

  if (!["offer", "request", "user"].includes(contentType))
    return { error: "Unknown content." };
  if (!REPORT_REASONS.includes(reason as never))
    return { error: "Pick a reason." };
  if (!contentId) return { error: "Nothing to report." };

  const supabase = await createClient();
  const { data: already } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", me.id)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("status", "open")
    .maybeSingle();
  if (already) return { ok: "Thanks — you've already flagged this." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: me.id,
    content_type: contentType,
    content_id: contentId,
    reason,
    detail,
    status: "open",
  });
  if (error) return { error: error.message };

  return { ok: "Thanks for keeping the market safe. The team will review it." };
}

/* ---------------- Admin (service-role client; route is requireAdmin-gated) --- */

export async function adminSetOfferHidden(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("offerId") ?? "");
  const hidden = String(formData.get("hidden") ?? "1") === "1";
  await createAdminClient()
    .from("offers")
    .update({ hidden_by_admin: hidden })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/give");
}

export async function adminRemoveOffer(formData: FormData): Promise<void> {
  await requireAdmin();
  await createAdminClient()
    .from("offers")
    .update({ status: "removed" })
    .eq("id", String(formData.get("offerId") ?? ""));
  revalidatePath("/admin");
  revalidatePath("/give");
}

export async function adminSetRequestHidden(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("requestId") ?? "");
  const hidden = String(formData.get("hidden") ?? "1") === "1";
  await createAdminClient()
    .from("requests")
    .update({ hidden_by_admin: hidden })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/need");
}

export async function adminRemoveRequest(formData: FormData): Promise<void> {
  await requireAdmin();
  await createAdminClient()
    .from("requests")
    .update({ status: "removed" })
    .eq("id", String(formData.get("requestId") ?? ""));
  revalidatePath("/admin");
  revalidatePath("/need");
}

export async function adminSetUserSuspended(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("userId") ?? "");
  const suspended = String(formData.get("suspended") ?? "1") === "1";
  await createAdminClient()
    .from("users")
    .update({ suspended })
    .eq("id", id)
    .neq("role", "admin");
  revalidatePath("/admin");
}

export async function adminResolveReport(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("reportId") ?? "");
  const raw = String(formData.get("status") ?? "reviewed");
  const status = ["reviewed", "dismissed"].includes(raw) ? raw : "reviewed";
  await createAdminClient().from("reports").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function adminRunReminders(): Promise<void> {
  await requireAdmin();
  const { runGiveForwardReminders } = await import("@/lib/reminders");
  await runGiveForwardReminders();
  revalidatePath("/admin");
  redirect("/admin?reminders=1");
}
