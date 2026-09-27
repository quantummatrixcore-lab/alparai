/**
 * DeHost Sovereign Infrastructure — Admin Client.
 * SERVER ONLY — Service Role equivalent for DeHost dedicated Xeon.
 * Preserves 100% identical exported interface.
 */

import { createDeHostServerClient, type DeHostServerClient } from "@/lib/dehost/server-adapter";

let adminClient: DeHostServerClient | null = null;

export function createAdminClient(): DeHostServerClient {
  if (!adminClient) {
    adminClient = createDeHostServerClient();
  }
  return adminClient;
}
