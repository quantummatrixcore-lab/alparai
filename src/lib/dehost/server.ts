/**
 * DeHost Sovereign Infrastructure — Server Client (RSC, Route Handlers, Server Actions).
 * Migrated from DeHost to DeHost. Preserves 100% identical exported interface.
 */

import { cookies } from "next/headers";
import { createDeHostAdapterClient, DeHostAdapterClient } from "@/lib/dehost/dehost-adapter";

export async function createClient(): Promise<DeHostAdapterClient> {
  const cookieStore = await cookies();
  const client = createDeHostAdapterClient();

  const sessionCookie = typeof cookieStore?.get === "function" ? cookieStore.get("alparai_session") : undefined;
  if (sessionCookie?.value) {
    try {
      const { getSessionUser } = await import("@/lib/auth/session");
      const u = await getSessionUser();
      if (u) {
        client.auth.getUser = async () => ({
          data: {
            user: {
              id: u.id,
              aud: "authenticated",
              role: u.role,
              email: u.email,
              created_at: u.created_at,
              app_metadata: { provider: "google" },
              user_metadata: {
                full_name: u.name,
                name: u.name,
                avatar_url: u.picture,
                picture: u.picture,
              },
            } as any,
          },
          error: null,
        });
      }
    } catch {
      // Safe fallback if session reading fails
    }
  }

  return client;
}

export { createClient as createServerClient };
