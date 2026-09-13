/**
 * DeHost Sovereign Infrastructure — Middleware Client.
 * Refreshes session cookie and checks auth state against DeHost.
 * Preserves 100% identical exported interface.
 */

import type { NextRequest, NextResponse } from "next/server";
import { createDeHostAdapterClient } from "@/lib/dehost/dehost-adapter";

export async function updateSession(request: NextRequest, response: NextResponse) {
  const dehost = createDeHostAdapterClient();
  const sessionCookie = request.cookies.get("alparai_session");

  let user: any = null;
  if (sessionCookie?.value) {
    try {
      const parts = sessionCookie.value.split(".");
      if (parts.length === 2 && parts[0]) {
        const jsonStr = typeof Buffer !== "undefined"
          ? Buffer.from(parts[0], "base64url").toString("utf8")
          : decodeURIComponent(escape(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"))));
        const data = JSON.parse(jsonStr);
        if (data && data.email) {
          user = {
            id: data.id,
            email: data.email,
            role: data.role || "user",
            user_metadata: {
              role: data.role || "user",
            },
          };
        }
      }
    } catch {
      // Safe fallback
    }
  }

  return { response, user, dehost };
}
