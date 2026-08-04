import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = safeNextPath(searchParams.get("next"));
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
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return response;
      }
      logger.warn("OAuth code exchange failed", {
        code: error.code,
        message: error.message,
      });
      return NextResponse.redirect(
        `${origin}/${locale}/auth/signin?error=oauth&reason=${encodeURIComponent(error.code ?? "exchange_failed")}`,
      );
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType, // use EmailOtpType to avoid as never
      });
      if (!error) {
        return response;
      }
      logger.warn("OTP verification failed", {
        type,
        code: error.code,
        message: error.message,
      });
      return NextResponse.redirect(
        `${origin}/${locale}/auth/signin?error=otp&reason=${encodeURIComponent(error.code ?? "verify_failed")}`,
      );
    }

    return NextResponse.redirect(`${origin}/${locale}/auth/signin?error=missing_params`);
  } catch (err) {
    logger.error("Callback handler exception", undefined, err instanceof Error ? err : undefined);
    return NextResponse.redirect(`${origin}/${locale}/auth/signin?error=server_error`);
  }
}
