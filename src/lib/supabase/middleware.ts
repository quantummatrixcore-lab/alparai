/**
 * Supabase — Middleware client.
 * Refreshes the session cookie on every request.
 */

import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest, response: NextResponse) {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (!request.url.startsWith("http://localhost") && !request.url.startsWith("http://127.0.0.1"));

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              sameSite: options?.sameSite ?? "lax",
              secure: options?.secure ?? isProduction,
              httpOnly: options?.httpOnly ?? true,
              path: options?.path ?? "/",
            }),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: must be called to keep the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
