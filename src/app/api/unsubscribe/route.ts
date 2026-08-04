import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyEmailUnsubscribeToken } from "@/lib/utils/unsubscribe";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  return handleUnsubscribe(request);
}

export async function POST(request: NextRequest) {
  return handleUnsubscribe(request);
}

async function handleUnsubscribe(request: NextRequest) {
  // 1. IP-based Rate Limiting (10 requests/day)
  const ip =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const ratelimitKey = `${RATE_LIMIT_KEYS.unsubscribe_attempt}:${ip}`;
  const rateLimitResult = await checkRateLimit(ratelimitKey);
  if (!rateLimitResult.ok) {
    logger.warn(`[Unsubscribe API] Rate limit hit for IP: ${ip}`);
    return new NextResponse("Too many requests", { status: 429 });
  }

  // 2. Validate environment config
  const ipSalt = process.env.IP_SALT;
  if (!ipSalt) {
    logger.error("[Unsubscribe API] IP_SALT environment variable is not defined");
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  // 3. Parse parameters based on method
  let email = "";
  let token = "";

  if (request.method === "GET") {
    const { searchParams } = new URL(request.url);
    email = searchParams.get("email") || "";
    token = searchParams.get("token") || "";
  } else {
    try {
      const body = await request.json();
      email = body.email || "";
      token = body.token || "";
    } catch {
      // Empty body falls back to invalid validation below
    }
  }

  // 4. Token validation (Timing-safe comparison)
  const isValid = verifyEmailUnsubscribeToken(email, token);
  if (!isValid) {
    // Return generic error message without leaking email existence
    return new NextResponse(
      "The unsubscribe link is missing or invalid. Please check that you used the full link from your email.",
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const cleanEmail = email.toLowerCase().trim();

    // 5. Database update: Unsubscribe newsletter
    await admin
      .from("newsletter_subscribers")
      .update({
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", cleanEmail);

    // 6. Database update: Email preferences (for auth users)
    const { data: user } = await admin
      .from("users")
      .select("id, locale")
      .eq("email", cleanEmail)
      .single();

    let locale = "en";
    if (user) {
      locale = user.locale || "en";
      await admin
        .from("email_preferences")
        .update({
          reporter_notifications: false,
          weekly_digest: false,
          watches: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    logger.info(`[Unsubscribe API] Successfully unsubscribed: ${cleanEmail}`);

    if (request.method === "GET") {
      // Redirect to front-page unsubscribe page with ok=1 query param
      const appUrl = request.nextUrl.origin;
      return NextResponse.redirect(`${appUrl}/${locale}/unsubscribe?ok=1`);
    } else {
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    logger.error(
      "[Unsubscribe API] Database operation failed",
      {},
      error instanceof Error ? error : undefined,
    );
    return new NextResponse("An error occurred while updating your preferences.", { status: 500 });
  }
}
