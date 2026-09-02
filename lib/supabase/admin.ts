import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY on the server for:
 *   - analytics inserts
 *   - multi-party writes (connections, generosity acts, chain links) where the
 *     row touches a user other than the caller (app-level authz is enforced
 *     explicitly at each call site)
 *   - the admin dashboard (route is `requireAdmin`-gated)
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export function createAdminClient(): SupabaseClient {
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}
