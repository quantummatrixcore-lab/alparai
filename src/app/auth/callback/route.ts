import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { logger } from "@/lib/utils/logger";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/constants";
import type { Database } from "@/types/database";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/profile";
  try {
    const decoded = decodeURIComponent(raw);
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      decoded.includes(":")
    ) {
      return "/profile";
    }
    const url = new URL(decoded, "http://localhost");
    if (url.pathname === "/" || url.pathname === "") return "/profile";
    const pathRegex = /^\/[a-zA-Z0-9_\-/]*$/;
    if (!pathRegex.test(url.pathname)) {
      return "/profile";
    }
    return url.pathname;
  } catch {
    return "/profile";
  }
}

function detectLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (preferred && (SUPPORTED_LOCALES as readonly string[]).includes(preferred)) {
    return preferred;
  }
  return DEFAULT_LOCALE;
}

import { logAdminLoginAction } from "@/actions/auth-audit";

async function logAdminLogin(
  supabase: SupabaseClient<Database>,
  userId: string,
  request: NextRequest,
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  await logAdminLoginAction(userId, ipHash);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "www.alparai.com";
  const origin = host.includes("localhost") ? "https://www.alparai.com" : `https://${host}`;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  let nextParam = searchParams.get("next");
  const stateParam = searchParams.get("state");
  if (!nextParam && stateParam) {
    try {
      const decoded = Buffer.from(stateParam, "base64url").toString();
      const parsed = JSON.parse(decoded);
      if (parsed?.next) nextParam = parsed.next;
    } catch {}
  }
  const next = safeNextPath(nextParam);
  const locale = detectLocale(request);
  const hasLocalePrefix = SUPPORTED_LOCALES.some(
    (l) => next === `/${l}` || next.startsWith(`/${l}/`),
  );
  const redirectTo = hasLocalePrefix ? `${origin}${next}` : `${origin}/${locale}${next}`;

  const response = NextResponse.redirect(redirectTo);

  if (errorParam) {
    logger.warn("OAuth provider returned an error", {
      error: errorParam,
      description: errorDescription,
    });
    return NextResponse.redirect(
      `${origin}/${locale}/auth/signin?error=oauth&reason=${encodeURIComponent(errorDescription || errorParam)}`,
    );
  }

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

  try {
    if (code) {
      // 1. Primary: Exchange Supabase Auth code for session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (!sessionError && sessionData?.user) {
        const user = sessionData.user;
        const { createSessionCookieHeader } = await import("@/lib/auth/session");
        const cookie = createSessionCookieHeader({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
          picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          role: (user.app_metadata?.role as any) || "user",
        });

        response.cookies.set(cookie.name, cookie.value, cookie.options);
        return response;
      }

      const envClientId = process.env.GOOGLE_CLIENT_ID;
      const clientId =
        envClientId && !envClientId.includes("SENSITIVE") && envClientId.includes(".apps.googleusercontent.com")
          ? envClientId
          : "341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com";
      const redirectUri = "https://www.alparai.com/auth/callback";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const googleUser = await userRes.json();

        const { createSessionCookieHeader } = await import("@/lib/auth/session");
        const cookie = createSessionCookieHeader({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name || googleUser.email?.split("@")[0] || "User",
          picture: googleUser.picture || "",
          role: "user",
        });

        response.cookies.set(cookie.name, cookie.value, cookie.options);
        return response;
      }

      logger.warn("OAuth code exchange failed", { sessionError, tokenData });
      return NextResponse.redirect(
        `${origin}/${locale}/auth/signin?error=oauth&reason=${encodeURIComponent(sessionError?.message || tokenData.error || "exchange_failed")}`,
      );
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });
      if (!error) {
        return response;
      }
      logger.error("Token hash verification failed", { type }, error);
      return NextResponse.redirect(
        `${origin}/${locale}/auth/signin?error=oauth&reason=${encodeURIComponent(error.message)}`,
      );
    }

    return NextResponse.redirect(`${origin}/${locale}/auth/signin?error=missing_params`);
  } catch (err) {
    logger.error("Callback handler exception", undefined, err instanceof Error ? err : undefined);
    return NextResponse.redirect(`${origin}/${locale}/auth/signin?error=server_error`);
  }
}

