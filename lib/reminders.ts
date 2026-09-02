import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail, emails } from "@/lib/mailer";

/**
 * Give Forward reminders (brief §17).
 * - Sends a nudge when a pending commitment is within 48h of its deadline
 *   (and no reminder has gone out yet).
 * - Marks commitments past their deadline as "expired".
 *
 * Run from the admin dashboard button, or `npm run reminders` on a schedule.
 */
export async function runGiveForwardReminders(): Promise<{
  reminded: number;
  expired: number;
}> {
  const supabase = createAdminClient();
  const now = new Date();
  const soon = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  const { data: dueSoon } = await supabase
    .from("give_forward_commitments")
    .select(
      "id, commitment_text, user:users!give_forward_commitments_user_id_fkey(email)",
    )
    .eq("status", "pending")
    .is("reminder_sent_at", null)
    .lte("deadline", soon);

  for (const row of dueSoon ?? []) {
    const user = Array.isArray(row.user) ? row.user[0] : row.user;
    const to = (user as { email?: string } | null)?.email;
    if (!to) continue;
    await sendMail({
      to,
      ...emails.giveForwardReminder(String(row.commitment_text)),
    });
    await supabase
      .from("give_forward_commitments")
      .update({ reminder_sent_at: nowIso })
      .eq("id", row.id);
  }

  const { data: expiredRows } = await supabase
    .from("give_forward_commitments")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("deadline", nowIso)
    .select("id");

  return {
    reminded: (dueSoon ?? []).length,
    expired: (expiredRows ?? []).length,
  };
}
