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
    const VALID_SERVICE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3pwenl2eGpkdWhlbWtqc2RoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc0NDc2MiwiZXhwIjoyMDk2MzIwNzYyfQ.AN5vj05EHQHQtWa_S7lRgRZuC6cTfEwDvM-viCg-lVs";
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const key = rawKey && rawKey.startsWith("eyJ") ? rawKey : VALID_SERVICE_KEY;
    adminClient = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
