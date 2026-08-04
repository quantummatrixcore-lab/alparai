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

// @deprecated Unused after removing GIS OAuth redirect fallback
export async function signInWithGoogle(next = "/profile"): Promise<AuthResult> {
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
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
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
}

export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
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
}
