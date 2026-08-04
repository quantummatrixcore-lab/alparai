import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-07-29.dahlia" });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(
      "Stripe webhook signature verification failed",
      undefined,
      err instanceof Error ? err : undefined,
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && customerId) {
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
          },
          { onConflict: "user_id" },
        );
        logger.info("Stripe checkout completed", { userId, customerId });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const status = subscription.status === "active" ? "active" : "inactive";
      const periodEnd = subscription.items.data[0]?.current_period_end;
      const priceId = subscription.items.data[0]?.price?.id;

      await admin
        .from("subscriptions")
        .update({
          status,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          stripe_price_id: (priceId || null) as never,
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await admin
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      logger.info("Stripe subscription canceled", { subscriptionId: subscription.id });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
