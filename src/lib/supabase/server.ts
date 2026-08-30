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

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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
}

export { createClient as createServerClient };
