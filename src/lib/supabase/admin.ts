/**
 * Supabase — Admin client.
 * Uses the service role key. SERVER ONLY — never import from a client component.
 * Bypasses RLS. Use for moderation actions, takedown processing, audit logging.
 */

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing Supabase admin credentials. Set SUPABASE_SERVICE_ROLE_KEY in .env.local",
      );
    }
    adminClient = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
