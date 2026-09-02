import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AnalyticsName =
  | "user_signed_up"
  | "offer_created"
  | "request_created"
  | "connection_requested"
  | "connection_accepted"
  | "connection_declined"
  | "connection_completed"
  | "generosity_act_created"
  | "give_forward_created"
  | "give_forward_completed"
  | "profile_viewed"
  | "offer_viewed"
  | "request_viewed";

/** Fire-and-forget analytics. Never throws into a user flow. */
export async function track(
  name: AnalyticsName,
  opts: { userId?: string | null; meta?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await createAdminClient()
      .from("analytics_events")
      .insert({
        name,
        user_id: opts.userId ?? null,
        meta: opts.meta ?? {},
      });
  } catch {
    // analytics must never break a user flow
  }
}
