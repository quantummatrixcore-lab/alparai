import { NextRequest, NextResponse } from "next/server";

import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/dehost/middleware";
import { routing } from "@/i18n/routing";
import { logger } from "@/lib/utils/logger";

import { isTestAuthBypassActive, assertTestBypassSafe } from "@/lib/auth/test-bypass";
import { trackBotHit } from "@/lib/geo/bot-tracker";

assertTestBypassSafe();

const intlMiddleware = createIntlMiddleware(routing);

const isDev = process.env.NODE_ENV === "development";

// Zero-GC Precomputed Security Headers
const CSP_CORE_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://*.dehost.internal https://*.sentry.io https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.google.com https://*.gstatic.com https://va.dehost-scripts.internal https://*.posthog.com https://us-assets.i.posthog.com`.replace(
    /\s+/g,
    " ",
  ),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https: https://*.googleusercontent.com https://avatars.githubusercontent.com https://*.dehost.internal https://logo.clearbit.com",
  "connect-src 'self' wss://alparai.com wss://*.alparai.com https://*.dehost.internal https://*.sentry.io wss://*.dehost.internal https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.googleapis.com https://*.posthog.com https://*.upstash.io https://va.dehost-scripts.internal",
  "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com https://*.google.com",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "object-src 'none'",
].join("; ");

const CSP_PROD_STANDARD = `${CSP_CORE_DIRECTIVES}; frame-ancestors 'none'; upgrade-insecure-requests`;
const CSP_PROD_EMBED = `${CSP_CORE_DIRECTIVES}; frame-ancestors 'self' https://*.alparai.com; upgrade-insecure-requests`;
const CSP_TEST_STANDARD = `${CSP_CORE_DIRECTIVES}; frame-ancestors 'none'`;
const CSP_TEST_EMBED = `${CSP_CORE_DIRECTIVES}; frame-ancestors 'self' https://*.alparai.com`;

const PERMISSIONS_POLICY_HEADER =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()";
const HSTS_HEADER = "max-age=63072000; includeSubDomains; preload";

let cachedCeoEmails: Set<string> | null = null;
function isCeoEmail(email?: string | null): boolean {
  if (!email) return false;
  if (!cachedCeoEmails) {
    cachedCeoEmails = new Set(
      (process.env.CEO_EMAILS || "")
        .toLowerCase()
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    );
  }
  return cachedCeoEmails.has(email.toLowerCase());
}

function applySecurityHeaders(
  res: NextResponse,
  req: NextRequest,
  requestId?: string,
): NextResponse {
  const { pathname } = req.nextUrl;
  const isEmbed = pathname.includes("/embed");
  const isTest =
    process.env.NODE_ENV === "test" &&
    process.env.IS_PLAYWRIGHT_TEST === "true" &&
    process.env.NEXT_TEST_AUTH_BYPASS === "true";

  if (requestId) {
    res.headers.set("x-request-id", requestId);
  }

  const csp = isTest
    ? isEmbed
      ? CSP_TEST_EMBED
      : CSP_TEST_STANDARD
    : isEmbed
      ? CSP_PROD_EMBED
      : CSP_PROD_STANDARD;

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", isEmbed ? "SAMEORIGIN" : "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", PERMISSIONS_POLICY_HEADER);
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set("Cross-Origin-Resource-Policy", isEmbed ? "cross-origin" : "same-origin");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  if (!isTest) {
    res.headers.set("Strict-Transport-Security", HSTS_HEADER);
  }

  return res;
}

function getMiddlewareSessionSecret(): string | null {
  return process.env.SESSION_SECRET || process.env.CRON_SECRET || null;
}

function b64UrlToBytes(b64url: string): Uint8Array | null {
  try {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function decodePayloadToJson(payload: string): string | null {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(payload, "base64url").toString("utf8");
    }
    const bytes = b64UrlToBytes(payload);
    if (!bytes) return null;
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

async function verifyMiddlewareHmac(
  payload: string,
  signatureB64Url: string,
  secret: string,
): Promise<boolean> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
      const enc = new TextEncoder();
      const key = await subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      );
      const sigBytes = b64UrlToBytes(signatureB64Url);
      if (!sigBytes) return false;
      // subtle.verify expects BufferSource; copy to ArrayBuffer-backed view
      const sigCopy = new Uint8Array(sigBytes.length);
      sigCopy.set(sigBytes);
      return await subtle.verify("HMAC", key, sigCopy, enc.encode(payload));
    }
  } catch {
    // fall through to Node path
  }
  try {
    const cryptoMod = await import("crypto");
    const expected = cryptoMod.createHmac("sha256", secret).update(payload).digest("base64url");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureB64Url, "utf8");
    if (a.length !== b.length) return false;
    return cryptoMod.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// REV: fail-closed HMAC verification for admin fallback cookie (P0 integrity-break fix).
export async function parseAlparSessionCookie(
  cookieValue?: string,
): Promise<{ id: string; email: string; role: string } | null> {
  if (!cookieValue) return null;
  try {
    const dotIndex = cookieValue.lastIndexOf(".");
    if (dotIndex === -1) return null;
    const part0 = cookieValue.substring(0, dotIndex);
    const sig = cookieValue.substring(dotIndex + 1);
    if (!part0 || !sig) return null;
    const secret = getMiddlewareSessionSecret();
    if (!secret) return null;
    if (!(await verifyMiddlewareHmac(part0, sig, secret))) return null;
    const jsonStr = decodePayloadToJson(part0);
    if (!jsonStr) return null;
    const data = JSON.parse(jsonStr);
    if (!data || !data.email) return null;
    let role = data.role || "user";
    if (isCeoEmail(data.email)) {
      role = "ceo";
    }
    return { id: data.id, email: data.email, role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  // CVE-2025-29927 Mitigation: Reject or strip forged internal Next.js routing headers
  if (
    request.headers.has("x-middleware-subrequest") ||
    request.headers.has("x-middleware-rewrite")
  ) {
    logger.warn("[Security] Forged internal middleware header detected and dropped", {
      ip: request.headers.get("x-forwarded-for") || "unknown",
      path: request.nextUrl.pathname,
    });
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    void trackBotHit(userAgent, request.nextUrl.pathname).catch((err) => {
      logger.error(
        "[Middleware] trackBotHit failed",
        undefined,
        err instanceof Error ? err : undefined,
      );
    });
  }

  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  // Strip dangerous internal headers
  requestHeaders.delete("x-middleware-subrequest");
  requestHeaders.delete("x-middleware-rewrite");
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const unsupportedAdminLocaleMatch = pathname.match(/^\/(de|fr|ru)(\/admin|\/admin\/.*)$/);
  if (unsupportedAdminLocaleMatch) {
    const pref = request.cookies.get("NEXT_LOCALE")?.value === "tr" ? "tr" : "en";
    const target = pathname.replace(/^\/(de|fr|ru)/, `/${pref}`);
    const redirectRes = NextResponse.redirect(
      new URL(target + request.nextUrl.search, request.url),
    );
    return applySecurityHeaders(redirectRes, request, requestId);
  }

  const isAdminPath = pathname.startsWith("/admin") || /^\/[a-z]{2}\/admin(\/|$)/.test(pathname);

  const reqWithHeaders = new NextRequest(request, { headers: requestHeaders });

  let intlResponse: NextResponse;
  try {
    if (pathname.startsWith("/api/")) {
      intlResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } else {
      intlResponse = intlMiddleware(reqWithHeaders);
      // Pass custom request headers to Server Components via response headers
      intlResponse.headers.set("x-middleware-request-x-request-id", requestId);
      intlResponse.headers.set("x-middleware-request-x-pathname", request.nextUrl.pathname);
    }
  } catch (err) {
    logger.error(
      "[middleware] intlMiddleware threw",
      undefined,
      err instanceof Error ? err : undefined,
    );
    const fallbackRes = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return applySecurityHeaders(fallbackRes, request, requestId);
  }

  let response: NextResponse;
  try {
    const sessionResult = await updateSession(reqWithHeaders, intlResponse);
    response = sessionResult.response;
    const user = sessionResult.user;
    const dehost = sessionResult.dehost;

    // Fast-path unauthenticated redirect for admin routes (zero-trust security enforcement)
    if (isAdminPath && !pathname.startsWith("/api/") && !isTestAuthBypassActive()) {
      const urlLocale = request.nextUrl.pathname.match(/^\/(en|tr)\b/)?.[1];
      const locale = urlLocale || request.cookies.get("NEXT_LOCALE")?.value || "en";

      const alparSession = await parseAlparSessionCookie(
        request.cookies.get("alparai_session")?.value,
      );
      const effectiveUser =
        user || (alparSession ? { id: alparSession.id, email: alparSession.email } : null);

      if (!effectiveUser) {
        const currentPath = request.nextUrl.pathname + request.nextUrl.search;
        const signinUrl = new URL(`/${locale}/auth/signin`, request.url);
        signinUrl.searchParams.set("next", currentPath);
        const redirectRes = NextResponse.redirect(signinUrl);
        return applySecurityHeaders(redirectRes, request, requestId);
      } else {
        let role = alparSession?.role || "user";
        if (!alparSession && user) {
          const email = user.email?.toLowerCase();
          const ceoEmails = (process.env.CEO_EMAILS || "")
            .toLowerCase()
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
          if (ceoEmails.length > 0 && email && ceoEmails.includes(email)) {
            role = "ceo";
          } else {
            // OPTİMİZASYON: Edge middleware'de her istekte DB sorgusu yapmak sistemi kilitler (TTFB artar).
            // Zero-roundtrip için JWT (user_metadata) rolüne güveniyoruz.
            role = user.user_metadata?.role || "user";
          }
        }

        // Strict Executive Role-Based Access Control for autonomous company panel
        const isAutonomousCompanyPath = pathname.includes("/admin/autonomous-company");
        if (isAutonomousCompanyPath) {
          if (role !== "admin" && role !== "ceo") {
            const redirectRes = NextResponse.redirect(new URL(`/${locale}/`, request.url));
            return applySecurityHeaders(redirectRes, request, requestId);
          }
        } else if (
          role !== "admin" &&
          role !== "ceo" &&
          role !== "moderator" &&
          role !== "advisor"
        ) {
          const redirectRes = NextResponse.redirect(new URL(`/${locale}/`, request.url));
          return applySecurityHeaders(redirectRes, request, requestId);
        }
      }
    }
  } catch (err) {
    logger.error(
      "[middleware] updateSession threw",
      undefined,
      err instanceof Error ? err : undefined,
    );
    response = intlResponse;
  }

  return applySecurityHeaders(response, request, requestId);
}

export const config = {
  matcher: [
    // Zero-Cost Arbitrage: Statik dosyalar, webhook'lar ve health endpoint'i Edge middleware'e girmeden doğrudan işlenir
    "/((?!api/health|api/cron|api/webhook|_next/static|_next/image|_dehost|auth/callback|auth/v1/|images/|icons/|fonts/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest|pdf|mp4|webm|mp3|ogg|wav)).*)",
    "/api/((?!health|cron|webhook).*)",
  ],
};
