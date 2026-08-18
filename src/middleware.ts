import { NextRequest, NextResponse } from "next/server";

import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";
import { logger } from "@/lib/utils/logger";

import { isTestAuthBypassActive, assertTestBypassSafe } from "@/lib/auth/test-bypass";
import { trackBotHit } from "@/lib/geo/bot-tracker";

assertTestBypassSafe();

const intlMiddleware = createIntlMiddleware(routing);

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

  // ZETA-1: Ensure /api/health bypasses i18n and edge redirects completely
  if (request.nextUrl.pathname.startsWith("/api/health")) {
    const url = request.nextUrl.clone();
    // If there's a trailing slash, Next.js might 308 redirect. We rewrite to avoid it.
    if (url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/$/, "");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
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
    return NextResponse.redirect(new URL(target + request.nextUrl.search, request.url));
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
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let response: NextResponse;
  try {
    const sessionResult = await updateSession(reqWithHeaders, intlResponse);
    response = sessionResult.response;
    const user = sessionResult.user;

    // Fast-path unauthenticated redirect for admin routes (Role check is delegated to Server Components)
    if (isAdminPath && !pathname.startsWith("/api/") && !isTestAuthBypassActive()) {
      if (!user) {
        const locale = request.cookies.get("NEXT_LOCALE")?.value ?? "en";
        const currentPath = request.nextUrl.pathname + request.nextUrl.search;
        const signinUrl = new URL(`/${locale}/auth/signin`, request.url);
        signinUrl.searchParams.set("next", currentPath);
        return NextResponse.redirect(signinUrl);
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

  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/((?!api/health|api/cron|api/webhook|_next/static|_next/image|_vercel|auth/callback|auth/v1/|images/|icons/|fonts/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)).*)",
    "/api/((?!health|cron|webhook).*)",
  ],
};
