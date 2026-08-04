import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/database";
import { trackBotHit } from "@/lib/geo/bot-tracker";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
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

  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
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

  if (process.env.IS_PLAYWRIGHT_TEST === "true" && isAdminPath && !pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isAdminPath && !pathname.startsWith("/api/")) {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const locale = request.cookies.get("NEXT_LOCALE")?.value ?? "en";

    if (!user) {
      const currentPath = request.nextUrl.pathname + request.nextUrl.search;
      const signinUrl = new URL(`/${locale}/auth/signin`, request.url);
      signinUrl.searchParams.set("next", currentPath);
      return NextResponse.redirect(signinUrl);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isFounder = user.email === "quantum.matrix.core@gmail.com";
    const userRole = (profile?.role as string | undefined) || (isFounder ? "admin" : undefined);
    if (
      userRole !== "moderator" &&
      userRole !== "admin" &&
      userRole !== "ceo" &&
      userRole !== "advisor"
    ) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  const requestWithId = new NextRequest(request, {
    headers: requestHeaders,
  });

  let intlResponse: NextResponse;
  try {
    if (pathname.startsWith("/api/")) {
      intlResponse = NextResponse.next({ request: requestWithId });
    } else {
      intlResponse = intlMiddleware(requestWithId);
    }
  } catch (err) {
    logger.error(
      "[middleware] intlMiddleware threw",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.next();
  }

  let response: NextResponse;
  try {
    response = await updateSession(requestWithId, intlResponse);
  } catch (err) {
    logger.error(
      "[middleware] updateSession threw",
      undefined,
      err instanceof Error ? err : undefined,
    );
    response = intlResponse;
  }

  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_vercel|auth/callback|auth/v1/|images/|icons/|fonts/|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)).*)",
    "/api/((?!health|cron|webhook).*)",
  ],
};
