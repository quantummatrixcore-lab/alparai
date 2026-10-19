let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/dehost/server";
type EmailOtpType = any;
type DeHostClient = any;
import { logger } from "@/lib/utils/logger";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/constants";
import type { Database } from "@/types/database";

async function sha256Hex(text: string) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  dehost: any,
  userId: string,
  request: NextRequest,
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const ipHash = await sha256Hex(ip);
  await logAdminLoginAction(userId, ipHash);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "alparai.com";
  const proto = request.headers.get("x-forwarded-proto") ?? (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const origin = `${proto}://${host}`;
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
    (vault.read('NODE_ENV') ?? process.env.NODE_ENV) === "production" ||
    (!request.url.startsWith("http://localhost") && !request.url.startsWith("http://127.0.0.1"));

  const dehost = await createServerClient();

  try {
    if (code) {
      // 1. Primary: Exchange DeHost Auth code for session
      const { data: sessionData, error: sessionError } = await dehost.auth.exchangeCodeForSession(code);
      if (!sessionError && sessionData?.user) {
        const user = sessionData.user;
        const role = (user.app_metadata?.role as "user" | "moderator" | "admin" | "ceo" | "instructor") || "user";
        const email = user.email || "";
        const isCeoOrAdmin =
          role === "admin" ||
          role === "ceo" ||
          [
            "ercument@alparai.com",
            "ercumenterden@gmail.com",
            "ercument.erden@alparai.com",
            "quantum.matrix.core@gmail.com",
          ].includes(email.toLowerCase());

        if (isCeoOrAdmin) {
          try {
            await logAdminLogin(dehost, user.id, request);
          } catch (e) {
            logger.warn("Failed to log admin login", { error: e });
          }
        }

        const { createSessionCookieHeader } = await import("@/lib/auth/session");
        const cookie = await createSessionCookieHeader({
          id: user.id,
          email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
          picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          role,
        });

        response.cookies.set(cookie.name, cookie.value, cookie.options);
        return response;
      }

      const envClientId = (vault.read('GOOGLE_CLIENT_ID') ?? process.env.GOOGLE_CLIENT_ID);
      const clientId =
        envClientId && !envClientId.includes("SENSITIVE") && envClientId.includes(".apps.googleusercontent.com")
          ? envClientId
          : "341717447635-hsdu69hk692lkveikkpc8398v8rhu40b.apps.googleusercontent.com";
      const redirectUri = `${origin}/auth/callback`;
      let clientSecret = (vault.read('GOOGLE_CLIENT_SECRET') ?? process.env.GOOGLE_CLIENT_SECRET) || "";
      if (!clientSecret) {
        try {
          if (typeof require !== "undefined") {
            const loadVault = require("D:\\00_MATRIX\\vault_loader.js");
            loadVault(process.cwd());
            clientSecret = (vault.read('GOOGLE_CLIENT_SECRET') ?? process.env.GOOGLE_CLIENT_SECRET) || "";
          }
        } catch (_vErr) {
          // Vault loader fallback
        }
      }

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
        const cookie = await createSessionCookieHeader({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name || googleUser.email?.split("@")[0] || "User",
          picture: googleUser.picture || "",
          role: "user",
        });

        const gEmail = (googleUser.email || "").toLowerCase();
        if (
          [
            "ercument@alparai.com",
            "ercumenterden@gmail.com",
            "ercument.erden@alparai.com",
            "quantum.matrix.core@gmail.com",
          ].includes(gEmail)
        ) {
          try {
            await logAdminLogin(dehost, googleUser.id, request);
          } catch (e) {
            logger.warn("Failed to log admin login for Google user", { error: e });
          }
        }

        response.cookies.set(cookie.name, cookie.value, cookie.options);
        return response;
      }

      logger.warn("OAuth code exchange failed", { sessionError, tokenData });
      return NextResponse.redirect(
        `${origin}/${locale}/auth/signin?error=oauth&reason=${encodeURIComponent(sessionError?.message || tokenData.error || "exchange_failed")}`,
      );
    }

    if (tokenHash && type) {
      const { error } = await dehost.auth.verifyOtp({
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
export const runtime = "nodejs";
