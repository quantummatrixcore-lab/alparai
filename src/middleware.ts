import { NextRequest, NextResponse } from "next/server";

import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";
import { logger } from "@/lib/utils/logger";

import { isTestAuthBypassActive, assertTestBypassSafe } from "@/lib/auth/test-bypass";
import { trackBotHit } from "@/lib/geo/bot-tracker";

assertTestBypassSafe();

const intlMiddleware = createIntlMiddleware(routing);

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

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.google.com https://*.gstatic.com https://va.vercel-scripts.com https://*.posthog.com https://us-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: https://*.googleusercontent.com https://avatars.githubusercontent.com https://*.supabase.co https://logo.clearbit.com",
    "connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co https://challenges.cloudflare.com https://plausible.io https://accounts.google.com https://*.googleapis.com https://*.posthog.com https://*.upstash.io https://va.vercel-scripts.com",
    "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com https://*.google.com",
    "worker-src 'self' blob:",
    isEmbed
      ? "frame-ancestors 'self' https://*.alparai.com https://*.vercel.app"
      : "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
    "object-src 'none'",
  ];

  if (!isTest) {
    cspDirectives.push("upgrade-insecure-requests");
  }

  res.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", isEmbed ? "SAMEORIGIN" : "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()",
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set("Cross-Origin-Resource-Policy", isEmbed ? "cross-origin" : "same-origin");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  if (!isTest) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return res;
}

function parseAlparSessionCookie(cookieValue?: string): { id: string; email: string; role: string } | null {
  if (!cookieValue) return null;
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 2 || !parts[0]) return null;
    const part0 = parts[0];
    let jsonStr = "";
    if (typeof Buffer !== "undefined") {
      jsonStr = Buffer.from(part0, "base64url").toString("utf8");
    } else {
      const b64 = part0.replace(/-/g, "+").replace(/_/g, "/");
      jsonStr = decodeURIComponent(escape(atob(b64)));
    }
    const data = JSON.parse(jsonStr);
    if (!data || !data.email) return null;
    const email = String(data.email).toLowerCase();
    let role = data.role || "user";
    if (
      email === "quantum.matrix.core@gmail.com" ||
      email === "ercumenterden@gmail.com" ||
      email === "ercument.erden@alparai.com" ||
      email.endsWith("@alparai.com")
    ) {
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
    const redirectRes = NextResponse.redirect(new URL(target + request.nextUrl.search, request.url));
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
    const supabase = sessionResult.supabase;

    // Fast-path unauthenticated redirect for admin routes (zero-trust security enforcement)
    if (
      isAdminPath &&
      !pathname.startsWith("/api/") &&
      !isTestAuthBypassActive()
    ) {
      const urlLocale = request.nextUrl.pathname.match(/^\/(en|tr)\b/)?.[1];
      const locale = urlLocale || request.cookies.get("NEXT_LOCALE")?.value || "en";

      const alparSession = parseAlparSessionCookie(request.cookies.get("alparai_session")?.value);
      const effectiveUser = user || (alparSession ? { id: alparSession.id, email: alparSession.email } : null);

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
          if (
            email === "quantum.matrix.core@gmail.com" ||
            email === "ercumenterden@gmail.com" ||
            email === "ercument.erden@alparai.com" ||
            email?.endsWith("@alparai.com")
          ) {
            role = "ceo";
          } else {
            const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
            role = data?.role || user.user_metadata?.role || "user";
          }
        }
        
        // Strict Executive Role-Based Access Control for autonomous company panel
        const isAutonomousCompanyPath = pathname.includes("/admin/autonomous-company");
        if (isAutonomousCompanyPath) {
          if (role !== "admin" && role !== "ceo") {
            const redirectRes = NextResponse.redirect(new URL(`/${locale}/`, request.url));
            return applySecurityHeaders(redirectRes, request, requestId);
          }
        } else if (role !== "admin" && role !== "ceo" && role !== "moderator" && role !== "advisor") {
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
    "/((?!api/health|api/cron|api/webhook|_next/static|_next/image|_vercel|auth/callback|auth/v1/|images/|icons/|fonts/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest|pdf|mp4|webm|mp3|ogg|wav)).*)",
    "/api/((?!health|cron|webhook).*)",
  ],
};
