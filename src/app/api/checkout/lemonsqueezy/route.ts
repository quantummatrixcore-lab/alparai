let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/dehost/server";
import { logger } from "@/lib/utils/logger";


const APP_URL = (vault.read('NEXT_PUBLIC_APP_URL') ?? process.env.NEXT_PUBLIC_APP_URL) || "https://alparai.com";

export async function POST(request: Request) {
  const apiKey = (vault.read('LEMONSQUEEZY_API_KEY') ?? process.env.LEMONSQUEEZY_API_KEY);
  const defaultStoreId = (vault.read('LEMONSQUEEZY_STORE_ID') ?? process.env.LEMONSQUEEZY_STORE_ID) || "469668";
  const defaultVariantId = (vault.read('LEMONSQUEEZY_VARIANT_ID') ?? process.env.LEMONSQUEEZY_VARIANT_ID) || "2103062";

  if (!apiKey) {
    logger.error("Lemon Squeezy API key is not configured in environment");
    return NextResponse.json(
      { error: "Lemon Squeezy is not configured. Contact support." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch (_e) {
    // Optional body
  }

  const tier = (typeof body.tier === "string" ? body.tier : "developer").toLowerCase();
  const variantId = (typeof body.variantId === "string" ? body.variantId : "") || defaultVariantId;
  const storeId = (typeof body.storeId === "string" ? body.storeId : "") || defaultStoreId;
  const locale = (typeof body.locale === "string" ? body.locale : "tr").toLowerCase();

  // Try retrieving authenticated user
  let userId: string | undefined;
  let userEmail: string | undefined;
  let userName: string | undefined;

  try {
    const dehost = await createServerClient();
    const {
      data: { user },
    } = await dehost.auth.getUser();

    if (user) {
      userId = user.id;
      userEmail = user.email;
      userName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        undefined;
    }
  } catch (err) {
    logger.warn("Lemon Squeezy checkout: Auth check skipped or failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Fallback to email provided in request if guest
  if (!userEmail && typeof body.email === "string" && body.email.includes("@")) {
    userEmail = body.email.trim();
  }

  const redirectUrl = `${APP_URL}/${locale}/dashboard?payment=success`;

  try {
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail || undefined,
            name: userName || undefined,
            custom: {
              user_id: String(userId || "guest"),
              userId: String(userId || "guest"),
              tier: String(tier),
              locale: String(locale),
            },
          },
          product_options: {
            redirect_url: redirectUrl,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(storeId),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: String(variantId),
            },
          },
        },
      },
    };

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.data?.attributes?.url) {
      const errorDetail =
        (data.errors && data.errors[0]?.detail) ||
        `HTTP ${response.status} from Lemon Squeezy`;
      logger.error("Lemon Squeezy checkout session creation failed", {
        status: response.status,
        error: errorDetail,
      });
      return NextResponse.json(
        { error: `Checkout initiation failed: ${errorDetail}` },
        { status: response.status >= 400 && response.status < 500 ? 400 : 502 },
      );
    }

    const checkoutUrl = data.data.attributes.url as string;
    const checkoutId = data.data.id as string;

    logger.info("Lemon Squeezy checkout session created", {
      checkoutId,
      userId,
      tier,
    });

    return NextResponse.json({
      ok: true,
      url: checkoutUrl,
      id: checkoutId,
    });
  } catch (err) {
    logger.error("Lemon Squeezy checkout network or runtime exception", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "Unable to connect to payment gateway. Please try again." },
      { status: 500 },
    );
  }
}

