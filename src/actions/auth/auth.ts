"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export interface AuthResult {
  ok: boolean;
  error?: string;
  url?: string;
}

function getOrigin(hdrs: Headers) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return "https://alparai.com";
  }
  const origin = hdrs.get("origin");
  if (origin) return origin;
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  const protocol = hdrs.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function signInWithGoogleIdToken(token: string, nonce: string): Promise<AuthResult> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.auth_signin}:${ip}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many attempts. Try again in ${rl.retryAfter}s.` };
    }

    // Direct Google Token Verification
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (!verifyRes.ok) {
      console.error("[signInWithGoogleIdToken] Google verification returned status:", verifyRes.status);
      return { ok: false, error: "Google ID Token verification failed" };
    }

    const payload = await verifyRes.json();
    const expectedClientId = process.env.GOOGLE_CLIENT_ID || "341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com";
    if (payload.aud !== expectedClientId) {
      console.error("[signInWithGoogleIdToken] Audience mismatch:", payload.aud, expectedClientId);
      return { ok: false, error: "Invalid Google Client ID audience" };
    }

    const { setSessionUser } = await import("@/lib/auth/session");
    await setSessionUser({
      id: payload.sub,
      email: payload.email || "",
      name: payload.name || payload.email?.split("@")[0] || "User",
      picture: payload.picture || "",
      role: "user",
    });

    return { ok: true };
  } catch (err) {
    console.error("[signInWithGoogleIdToken] Error:", err);
    throw err;
  }
}

export async function signInWithGoogle(next = "/profile"): Promise<AuthResult> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.auth_signin}:${ip}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many attempts. Try again in ${rl.retryAfter}s.` };
    }
    const supabase = await createServerClient();
    const originUrl = getOrigin(hdrs);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${originUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      logger.error("signInWithGoogle failed", { action: "signInWithGoogle" }, error);
      return { ok: false, error: error.message };
    }
    return { ok: true, url: data.url };
  } catch (err) {
    console.error("[signInWithGoogle] Error:", err);
    throw err;
  }
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.auth_magiclink}:${ip}`);
    if (!rl.ok) {
      return { ok: false, error: `Too many attempts. Try again in ${rl.retryAfter}s.` };
    }
    const supabase = await createServerClient();
    const originUrl = getOrigin(hdrs);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${originUrl}/auth/callback` },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    console.error("[signInWithMagicLink] Error:", err);
    throw err;
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    redirect("/");
  } catch (err) {
    console.error("[signOut] Error:", err);
    throw err;
  }
}

export interface MeResult {
  ok: boolean;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: "user" | "moderator" | "admin" | "ceo" | "advisor" | "instructor";
  } | null;
}

export async function getMe(): Promise<MeResult> {
  try {
    const u = await getCurrentUser();
    if (!u) return { ok: true, user: null };
    return {
      ok: true,
      user: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        role: u.role,
      },
    };
  } catch (err) {
    console.error("[getMe] Error:", err);
    throw err;
  }
}
