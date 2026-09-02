"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOnboardedUser } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { sendMail, emails } from "@/lib/mailer";
import { linkActToChain } from "@/lib/chains";
import { userName, userEmail } from "@/lib/queries";
import { daysFromNow } from "@/lib/utils";
import { GIVE_FORWARD_TYPES, OFFER_TYPES } from "@/lib/taxonomy";
import type { FormState } from "@/lib/form-state";

export type { FormState };

const nowIso = () => new Date().toISOString();

/* ---------------- Request a connection ---------------- */

export async function requestConnectionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requireOnboardedUser();
  const offerId = String(formData.get("offerId") ?? "") || null;
  const requestId = String(formData.get("requestId") ?? "") || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!offerId && !requestId) return { error: "Nothing to connect to." };

  const supabase = await createClient();
  let giverId: string;
  let receiverId: string;
  let subjectThing: string;
  let redirectTo = "/connections";

  if (offerId) {
    const { data: offer } = await supabase
      .from("offers")
      .select("user_id, title, slug, status")
      .eq("id", offerId)
      .maybeSingle();
    if (!offer || offer.status !== "active")
      return { error: "That offer is no longer available." };
    if (offer.user_id === me.id) return { error: "That's your own offer." };
    giverId = offer.user_id;
    receiverId = me.id;
    subjectThing = offer.title;
    redirectTo = `/give/${offer.slug}`;
  } else {
    const { data: req } = await supabase
      .from("requests")
      .select("user_id, title, slug, status")
      .eq("id", requestId)
      .maybeSingle();
    if (!req || req.status !== "active")
      return { error: "That request is no longer open." };
    if (req.user_id === me.id) return { error: "That's your own request." };
    giverId = me.id;
    receiverId = req.user_id;
    subjectThing = req.title;
    redirectTo = `/need/${req.slug}`;
  }

  const { data: dupe } = await supabase
    .from("connections")
    .select("id")
    .eq("giver_id", giverId)
    .eq("receiver_id", receiverId)
    .in("status", ["pending", "accepted", "completed"])
    .limit(1)
    .maybeSingle();
  if (dupe) return { error: "You've already reached out about this." };

  const { error } = await supabase.from("connections").insert({
    offer_id: offerId,
    request_id: requestId,
    giver_id: giverId,
    receiver_id: receiverId,
    initiator_id: me.id,
    message,
    status: "pending",
  });
  if (error) return { error: error.message };

  const responderId = me.id === giverId ? receiverId : giverId;
  const to = await userEmail(responderId);
  if (to)
    await sendMail({ to, ...emails.connectionRequest(me.name, subjectThing) });

  await track("connection_requested", { userId: me.id });
  revalidatePath("/connections");
  redirect(redirectTo + "?connected=1");
}

/* ---------------- Accept / decline ---------------- */

export async function respondConnectionAction(
  formData: FormData,
): Promise<void> {
  const me = await requireOnboardedUser();
  const id = String(formData.get("connectionId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const supabase = await createClient();
  const { data: conn } = await supabase
    .from("connections")
    .select("id, giver_id, receiver_id, initiator_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!conn || conn.status !== "pending") return;

  const responderId =
    conn.initiator_id === conn.giver_id ? conn.receiver_id : conn.giver_id;
  if (responderId !== me.id) return;

  if (decision === "accept") {
    await supabase
      .from("connections")
      .update({ status: "accepted", accepted_at: nowIso() })
      .eq("id", id);
    const to = await userEmail(conn.initiator_id);
    if (to) await sendMail({ to, ...emails.connectionAccepted(me.name) });
    await track("connection_accepted", { userId: me.id });
  } else {
    await supabase
      .from("connections")
      .update({ status: "declined" })
      .eq("id", id);
    await track("connection_declined", { userId: me.id });
  }
  revalidatePath("/connections");
}

/* ---------------- Complete -> generosity act ---------------- */

export async function completeConnectionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requireOnboardedUser();
  const id = String(formData.get("connectionId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "");
  const hoursRaw = String(formData.get("hours") ?? "").trim();
  const isPublic = formData.get("isPublic") != null;

  const admin = createAdminClient();
  const { data: conn } = await admin
    .from("connections")
    .select("id, giver_id, receiver_id, request_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!conn) return { error: "Connection not found." };
  if (conn.giver_id !== me.id && conn.receiver_id !== me.id)
    return { error: "That's not your connection." };
  if (conn.status === "completed")
    return { error: "This one is already marked done." };
  if (conn.status !== "accepted")
    return { error: "Accept the connection before marking it done." };
  if (description.length < 4)
    return { error: "Add a short note about what happened." };

  const type = OFFER_TYPES.includes(typeRaw as never) ? typeRaw : null;
  const hours = hoursRaw ? Math.max(0, Number(hoursRaw)) || null : null;

  const { data: act, error: actErr } = await admin
    .from("generosity_acts")
    .insert({
      giver_id: conn.giver_id,
      receiver_id: conn.receiver_id,
      connection_id: conn.id,
      type,
      description,
      hours,
      is_public: isPublic,
    })
    .select("id")
    .single();
  if (actErr || !act)
    return { error: actErr?.message ?? "Could not record the act." };

  await admin
    .from("connections")
    .update({ status: "completed", completed_at: nowIso() })
    .eq("id", conn.id);

  if (conn.request_id) {
    await admin
      .from("requests")
      .update({ status: "fulfilled" })
      .eq("id", conn.request_id);
  }

  // If the giver was fulfilling a Give Forward commitment, close it + extend the chain.
  const { data: commitment } = await admin
    .from("give_forward_commitments")
    .select("id, trigger_act_id")
    .eq("user_id", conn.giver_id)
    .eq("status", "pending")
    .order("deadline", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (commitment?.trigger_act_id) {
    await admin
      .from("give_forward_commitments")
      .update({
        status: "completed",
        completed_at: nowIso(),
        fulfilled_act_id: act.id,
      })
      .eq("id", commitment.id);
    await linkActToChain(act.id, commitment.trigger_act_id);
    await track("give_forward_completed", { userId: conn.giver_id });
  }

  await track("connection_completed", { userId: me.id });
  await track("generosity_act_created", { userId: conn.giver_id });

  const to = await userEmail(conn.receiver_id);
  if (to)
    await sendMail({
      to,
      ...emails.didItHappen(await userName(conn.giver_id)),
    });

  revalidatePath("/connections");
  revalidatePath("/impact");
  revalidatePath("/dashboard");
  redirect(`/connections/${conn.id}?done=1`);
}

/* ---------------- Give Forward ---------------- */

export async function createGiveForwardAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requireOnboardedUser();
  const triggerActId = String(formData.get("triggerActId") ?? "") || null;
  const type = String(formData.get("type") ?? "");
  const commitmentText = String(formData.get("commitmentText") ?? "").trim();
  const days = Math.min(
    60,
    Math.max(1, Number(formData.get("days") ?? 7) || 7),
  );

  if (!GIVE_FORWARD_TYPES.includes(type as never))
    return { error: "Pick how you'll give forward." };
  if (commitmentText.length < 6)
    return { error: "Say what you'll do — even one line." };

  const supabase = await createClient();

  if (triggerActId) {
    const { data: act } = await supabase
      .from("generosity_acts")
      .select("id")
      .eq("id", triggerActId)
      .eq("receiver_id", me.id)
      .maybeSingle();
    if (!act) return { error: "We couldn't link that act to you." };

    const { data: existing } = await supabase
      .from("give_forward_commitments")
      .select("id")
      .eq("trigger_act_id", triggerActId)
      .maybeSingle();
    if (existing) return { error: "You've already made this commitment." };
  }

  const { error } = await supabase.from("give_forward_commitments").insert({
    user_id: me.id,
    trigger_act_id: triggerActId,
    type,
    commitment_text: commitmentText,
    deadline: daysFromNow(days).toISOString(),
    status: "pending",
  });
  if (error) return { error: error.message };

  await track("give_forward_created", { userId: me.id });
  revalidatePath("/dashboard");
  redirect("/dashboard?committed=1");
}

/**
 * Completing a Give Forward directly (not through a tracked connection) —
 * e.g. "I helped someone offline". Creates a standalone act and extends the
 * generosity chain.
 */
export async function completeGiveForwardAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await requireOnboardedUser();
  const commitmentId = String(formData.get("commitmentId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const hoursRaw = String(formData.get("hours") ?? "").trim();

  const supabase = await createClient();
  const { data: commitment } = await supabase
    .from("give_forward_commitments")
    .select("id, user_id, trigger_act_id, status, type")
    .eq("id", commitmentId)
    .maybeSingle();

  if (!commitment || commitment.user_id !== me.id)
    return { error: "Commitment not found." };
  if (commitment.status !== "pending")
    return { error: "This commitment is already closed." };
  if (description.length < 4)
    return { error: "Add a short note about what you did." };

  const hours = hoursRaw ? Math.max(0, Number(hoursRaw)) || null : null;
  const typeMap: Record<string, string> = {
    "Give a thing": "Thing",
    "Give your time": "Time",
    "Give a skill": "Skill",
    "Help someone": "Knowledge",
    "Make an introduction": "Connection",
  };

  const { data: act, error: actErr } = await supabase
    .from("generosity_acts")
    .insert({
      giver_id: me.id,
      receiver_id: null,
      connection_id: null,
      type: typeMap[commitment.type] ?? null,
      description,
      hours,
      is_public: true,
    })
    .select("id")
    .single();
  if (actErr || !act)
    return { error: actErr?.message ?? "Could not record it." };

  await supabase
    .from("give_forward_commitments")
    .update({
      status: "completed",
      completed_at: nowIso(),
      fulfilled_act_id: act.id,
    })
    .eq("id", commitment.id);

  if (commitment.trigger_act_id)
    await linkActToChain(act.id, commitment.trigger_act_id);

  await track("give_forward_completed", { userId: me.id });
  await track("generosity_act_created", { userId: me.id });

  const to = await userEmail(me.id);
  if (to) await sendMail({ to, ...emails.giveForwardDone() });

  revalidatePath("/dashboard");
  revalidatePath("/impact");
  redirect("/dashboard?rippled=1");
}
