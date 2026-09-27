/**
 * DeHost Sovereign Infrastructure — Browser Client.
 * Migrated from vendor SDK to DeHost adapter. Preserves 100% identical exported interface.
 */

import { createDeHostAdapterClient, type DeHostAdapterClient } from "@/lib/dehost/dehost-adapter";

let cachedClient: DeHostAdapterClient | undefined;

export function getDeHostBrowserClient(): DeHostAdapterClient {
  if (!cachedClient) {
    cachedClient = createDeHostAdapterClient();
  }
  return cachedClient;
}

export function createClient(_url?: string, _key?: string, _options?: Record<string, unknown>): DeHostAdapterClient {
  return createDeHostAdapterClient();
}

export function createBrowserClient(): DeHostAdapterClient {
  return getDeHostBrowserClient();
}

export const dehost = typeof window !== "undefined"
  ? (cachedClient ?? (cachedClient = createDeHostAdapterClient()))
  : createDeHostAdapterClient();
