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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azszpzyvxjduhemkjsdh.supabase.co";
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!rawKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required but not defined in environment variables.");
    }
    const key = rawKey;
    adminClient = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
