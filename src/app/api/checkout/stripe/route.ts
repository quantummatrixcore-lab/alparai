import { vault } from "@/lib/security/vault";
import "server-only";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/dehost/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";

const STRIPE_SECRET_KEY = vault.read("STRIPE_SECRET_KEY") ?? process.env.STRIPE_SECRET_KEY;
const STRIPE_PRO_PRICE_ID = vault.read("STRIPE_PRO_PRICE_ID") ?? process.env.STRIPE_PRO_PRICE_ID;
const STRIPE_ENTERPRISE_PRICE_ID =
  vault.read("STRIPE_ENTERPRISE_PRICE_ID") ?? process.env.STRIPE_ENTERPRISE_PRICE_ID;
const APP_URL =
  (vault.read("NEXT_PUBLIC_APP_URL") ?? process.env.NEXT_PUBLIC_APP_URL) || "https://alparai.com";

// @auth: requireAuth (verified via dehost.auth.getUser)
export async function POST(request: Request) {
  let tier = "pro";
  let locale = "tr";
  let couponCode: string | null = null;
  try {
    const body = await request.json();
    if (body.tier === "enterprise") {
      tier = "enterprise";
    }
    if (body.locale && typeof body.locale === "string") {
      locale = body.locale;
    }
    if (typeof body.coupon_code === "string" && body.coupon_code.trim().length > 0) {
      couponCode = body.coupon_code.trim().toUpperCase();
    }
  } catch (_e) {
    // Ignore invalid JSON
  }

  const referer = request.headers.get("referer");
  if (referer && locale === "tr") {
    const match = referer.match(/\/(en|tr|de|fr|es|ar|ru|zh|ja)\b/);
    if (match?.[1]) locale = match[1];
  }

  const priceId = tier === "enterprise" ? STRIPE_ENTERPRISE_PRICE_ID : STRIPE_PRO_PRICE_ID;

  if (!STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured. Contact support for access." },
      { status: 503 },
    );
  }

  const dehost = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await dehost.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Dynamic import to avoid bundle issues when Stripe key is absent

    const Stripe = (await import("stripe")).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" as any });

    const admin = createAdminClient();

    // Akademi kuponu: doğrula (var + kullanılmamış + süresi dolmamış + bu e-posta).
    // Kupon YAKILMAZ — sadece webhook başarılı ödemede yakar (terk edilen sepet korunur).
    let stripeCouponId: string | null = null;
    let academyCouponCode: string | null = null;
    if (couponCode) {
      const { data: couponRows, error: couponErr } = await admin
        .from("academy_coupons")
        .select("code,percent,used,expires_at,email")
        .eq("code", couponCode)
        .limit(1);
      const coupon = (
        couponRows as Array<{
          code: string;
          percent: number;
          used: boolean;
          expires_at: string;
          email: string;
        }> | null
      )?.[0];
      if (couponErr || !coupon) {
        return NextResponse.json({ error: "coupon_invalid" }, { status: 400 });
      }
      if (coupon.used) {
        return NextResponse.json({ error: "coupon_used" }, { status: 400 });
      }
      if (new Date(coupon.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: "coupon_expired" }, { status: 400 });
      }
      if ((coupon.email || "").toLowerCase() !== (user.email || "").toLowerCase()) {
        return NextResponse.json({ error: "coupon_email_mismatch" }, { status: 400 });
      }
      const percent = Math.max(1, Math.min(50, Math.floor(coupon.percent)));
      stripeCouponId = `alpar-academy-${percent}`;
      try {
        await stripe.coupons.retrieve(stripeCouponId);
      } catch {
        await stripe.coupons.create({
          id: stripeCouponId,
          percent_off: percent,
          duration: "once",
          name: `AlparAI Academy ${percent}%`,
        });
      }
      academyCouponCode = coupon.code;
    }

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
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      success_url: `${APP_URL}/${locale}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${APP_URL}/${locale}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        tier,
        ...(academyCouponCode ? { academy_coupon_code: academyCouponCode } : {}),
      },
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
export const runtime = "nodejs";
