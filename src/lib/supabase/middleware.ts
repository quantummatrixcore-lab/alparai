/**
 * Supabase — Middleware client.
 * Refreshes the session cookie on every request.
 */

import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest, response: NextResponse) {
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
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: must be called to keep the session alive
  await supabase.auth.getUser();

  return response;
}
