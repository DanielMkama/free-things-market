// Transactional email. Uses Resend when RESEND_API_KEY is present,
// otherwise logs to the server console so the flow is fully testable in dev.

type Mail = {
  to: string;
  subject: string;
  body: string; // plain text
};

const FROM = process.env.MAIL_FROM ?? "The Free Things Market <hello@freethings.market>";

export async function sendMail({ to, subject, body }: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log(
      `\n────────── ✉️  EMAIL (dev, not sent) ──────────\n` +
        `To:      ${to}\n` +
        `Subject: ${subject}\n\n${body}\n` +
        `──────────────────────────────────────────────\n`,
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text: body }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
  } catch (err) {
    console.error("Mailer failed", err);
  }
}

export const emails = {
  connectionRequest: (giverName: string, thing: string) => ({
    subject: "Someone wants to connect with you ❤️",
    body: `${giverName} wants to connect with you about "${thing}".\n\nOpen The Free Things Market to accept or decline:\n${appUrl("/connections")}`,
  }),
  connectionAccepted: (otherName: string) => ({
    subject: "You're connected",
    body: `${otherName} accepted your connection. You can now arrange the details.\n\n${appUrl("/connections")}`,
  }),
  didItHappen: (thing: string) => ({
    subject: "Did it happen?",
    body: `You connected about "${thing}". Once it's done, mark it complete so it counts as an act of generosity.\n\n${appUrl("/connections")}`,
  }),
  giveForwardReminder: (text: string) => ({
    subject: "Keep the generosity moving ❤️",
    body: `You said you'd give something forward:\n\n"${text}"\n\nReady to make it happen?\n\n${appUrl("/dashboard")}`,
  }),
  giveForwardDone: () => ({
    subject: "That's another ripple",
    body: `You completed your Give Forward. The chain keeps moving because of you.\n\n${appUrl("/dashboard")}`,
  }),
};

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}
