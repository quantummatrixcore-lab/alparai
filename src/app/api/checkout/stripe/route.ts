import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
const STRIPE_ENTERPRISE_PRICE_ID = process.env.STRIPE_ENTERPRISE_PRICE_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";

export async function POST(request: Request) {
  let tier = "pro";
  try {
    const body = await request.json();
    if (body.tier === "enterprise") {
      tier = "enterprise";
    }
  } catch (_e) {
    // Ignore invalid JSON
  }

  const priceId = tier === "enterprise" ? STRIPE_ENTERPRISE_PRICE_ID : STRIPE_PRO_PRICE_ID;

  if (!STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured. Contact support for access." },
      { status: 503 },
    );
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Dynamic import to avoid bundle issues when Stripe key is absent
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" as any });

    const admin = createAdminClient();

    // Get or create Stripe customer
    const { data: existingSub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await admin.from("subscriptions").insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "inactive",
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${APP_URL}/pricing?canceled=true`,
      metadata: { user_id: user.id, tier },
      subscription_data: { metadata: { user_id: user.id, tier } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error(
      "Stripe checkout session creation failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
