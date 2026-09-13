/**
 * DeHost Sovereign Infrastructure — Admin Client.
 * SERVER ONLY — Service Role equivalent for DeHost dedicated Xeon.
 * Preserves 100% identical exported interface.
 */

import { createDeHostAdapterClient, DeHostAdapterClient } from "@/lib/dehost/dehost-adapter";

let adminClient: DeHostAdapterClient | null = null;

export function createAdminClient(): DeHostAdapterClient {
  if (!adminClient) {
    adminClient = createDeHostAdapterClient();
  }
  return adminClient;
}
