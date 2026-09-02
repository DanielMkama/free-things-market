// Give Forward reminders — run on a schedule (cron) or manually.
//   npm run reminders
// Sends a nudge for commitments within 48h of their deadline and expires
// commitments that are past due. Uses Resend if RESEND_API_KEY is set,
// otherwise logs the emails to the console.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const nowIso = new Date().toISOString();
const soon = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

async function send(to, subject, body) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n✉️  (dev) To: ${to}\nSubject: ${subject}\n\n${body}\n`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.MAIL_FROM ??
        "The Free Things Market <hello@freethings.market>",
      to,
      subject,
      text: body,
    }),
  });
}

const { data: due, error } = await db
  .from("give_forward_commitments")
  .select("id, commitment_text, user:users!give_forward_commitments_user_id_fkey(email)")
  .eq("status", "pending")
  .is("reminder_sent_at", null)
  .lte("deadline", soon);

if (error) {
  console.error(error);
  process.exit(1);
}

for (const row of due ?? []) {
  const user = Array.isArray(row.user) ? row.user[0] : row.user;
  const to = user?.email;
  if (!to) continue;
  await send(
    to,
    "Keep the generosity moving ❤️",
    `You said you'd give something forward:\n\n"${row.commitment_text}"\n\nReady to make it happen?\n\n${base}/dashboard`,
  );
  await db
    .from("give_forward_commitments")
    .update({ reminder_sent_at: nowIso })
    .eq("id", row.id);
}

const { data: expired } = await db
  .from("give_forward_commitments")
  .update({ status: "expired" })
  .eq("status", "pending")
  .lt("deadline", nowIso)
  .select("id");

console.log(
  `Reminders sent: ${(due ?? []).length}. Commitments expired: ${(expired ?? []).length}.`,
);
