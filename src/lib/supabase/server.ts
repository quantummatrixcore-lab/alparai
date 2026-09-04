/**
 * Supabase — Server client (RSC, Route Handlers, Server Actions).
 * Reads/writes auth cookies via next/headers.
 */

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const client = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              sameSite: options?.sameSite ?? "lax",
              secure: options?.secure ?? isProduction,
              httpOnly: options?.httpOnly ?? true,
              path: options?.path ?? "/",
            }),
          );
        } catch {
          // Called from a Server Component; safe to ignore if middleware refreshes sessions.
        }
      },
    },
  });

  const sessionCookie = cookieStore.get("alparai_session");
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
    } catch {}
  }

  return client;
}

export { createClient as createServerClient };
