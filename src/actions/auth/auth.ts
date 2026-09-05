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
  const origin = hdrs.get("origin");
  if (origin && !origin.includes("localhost:3000")) return origin;
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  if (host) {
    const proto = hdrs.get("x-forwarded-proto") ?? (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.alparai.com";
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
    const payload = (await verifyRes.json()) as any;

    const envClientId = process.env.GOOGLE_CLIENT_ID;
    const expectedClientId =
      envClientId && !envClientId.includes("SENSITIVE") && envClientId.includes(".apps.googleusercontent.com")
        ? envClientId
        : "341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com";
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

export async function performSignOut(): Promise<void> {
  try {
    const { clearSessionUser } = await import("@/lib/auth/session");
    await clearSessionUser();
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[performSignOut] Error:", err);
  }
  revalidatePath("/", "layout");
}

export async function signOut(): Promise<void> {
  await performSignOut();
  redirect("/");
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

export async function signInWithSupabaseToken(accessToken: string): Promise<AuthResult> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azszpzyvxjduhemkjsdh.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.error("[signInWithSupabaseToken] getUser failed:", error);
      return { ok: false, error: error?.message || "Invalid session token" };
    }
    const { setSessionUser } = await import("@/lib/auth/session");
    await setSessionUser({
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
      picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
      role: (user.app_metadata?.role as any) || "user",
    });
    return { ok: true };
  } catch (err) {
    console.error("[signInWithSupabaseToken] Error:", err);
    return { ok: false, error: "Token login failed" };
  }
}

