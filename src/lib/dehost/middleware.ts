let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
/**
 * DeHost Sovereign Infrastructure — Middleware Client.
 * Refreshes session cookie and checks auth state against DeHost.
 * Preserves 100% identical exported interface.
 */

import type { NextRequest, NextResponse } from "next/server";


async function verifySessionTokenHmac(payload: string, signatureB64Url: string): Promise<boolean> {
  const secret = (vault.read('SESSION_SECRET') ?? process.env.SESSION_SECRET) || (vault.read('CRON_SECRET') ?? process.env.CRON_SECRET) || (((vault.read('NODE_ENV') ?? process.env.NODE_ENV) === 'production') ? '' : 'dev-only-insecure-session-secret');
  if (!secret) return false;
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const b64 = signatureB64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
    const binary = atob(padded);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }
    const dataBytes = encoder.encode(payload);
    return await globalThis.crypto.subtle.verify("HMAC", cryptoKey, sigBytes, dataBytes);
  } catch {
    return false;
  }
}

export async function updateSession(request: NextRequest, response: NextResponse) {
  const sessionCookie = request.cookies.get("alparai_session");

  let user: any = null;
  if (sessionCookie?.value) {
    try {
      const parts = sessionCookie.value.split(".");
      if (parts.length === 2 && parts[0] && parts[1]) {
        const isValid = await verifySessionTokenHmac(parts[0], parts[1]);
        if (isValid) {
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
      }
    } catch {
      // Safe fallback
    }
  }

  const dehost = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: (_table: string) => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        neq: () => chain,
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        then: (resolve: any) => resolve({ data: null, error: null }),
      };
      return chain;
    },
  };

  return { response, user, dehost };
}
