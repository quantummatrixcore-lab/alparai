import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { processAutonomousPdfInvoice } from "@/lib/billing/invoices";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Normalizes user subscription tier for `api_keys.tier` ('free' | 'developer' | 'vendor' | 'enterprise')
 * and `users.subscription_tier` / `subscriptions.plan`.
 */
function normalizeTier(tierRaw?: string | null): {
  apiKeyTier: "free" | "developer" | "vendor" | "enterprise";
  userTier: string;
} {
  const normalized = (tierRaw || "").trim().toLowerCase();
  if (normalized === "enterprise") {
    return { apiKeyTier: "enterprise", userTier: "enterprise" };
  }
  if (normalized === "vendor") {
    return { apiKeyTier: "vendor", userTier: "vendor" };
  }
  if (normalized === "pro" || normalized === "developer" || normalized === "pilot") {
    return { apiKeyTier: "developer", userTier: normalized };
  }
  return { apiKeyTier: "free", userTier: "free" };
}

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
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" as any });

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

  waitUntil(
    (async () => {
      const admin = createAdminClient();

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          let userId = session.metadata?.user_id || session.client_reference_id;
          const rawTier = session.metadata?.tier || "pro";
          const customerId =
            typeof session.customer === "string" ? session.customer : session.customer?.id;
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          const { apiKeyTier, userTier } = normalizeTier(rawTier);

          if (!userId && customerId) {
            const { data: userByCust } = await admin
              .from("users")
              .select("id")
              .eq("stripe_customer_id", customerId)
              .single();
            if (userByCust?.id) {
              userId = userByCust.id;
            }
          }

          if (userId) {
            const { error: subErr } = await admin.from("subscriptions").upsert(
              {
                user_id: userId,
                stripe_customer_id: customerId || null,
                stripe_subscription_id: subscriptionId || null,
                plan: userTier,
                status: "active",
              },
              { onConflict: "user_id" },
            );

            if (subErr) {
              logger.error("Failed to upsert subscription on checkout completion", {
                userId,
                error: subErr.message,
              });
            }

            const { error: keyErr } = await admin
              .from("api_keys")
              .update({ tier: apiKeyTier })
              .eq("provider", userId);

            if (keyErr) {
              logger.error("Failed to update api_keys tier on checkout completion", {
                userId,
                error: keyErr.message,
              });
            }

            const { error: userErr } = await admin
              .from("users")
              .update({
                subscription_tier: userTier,
                ...(customerId ? { stripe_customer_id: customerId } : {}),
              })
              .eq("id", userId);

            if (userErr) {
              logger.error("Failed to update user subscription_tier on checkout completion", {
                userId,
                error: userErr.message,
              });
            }

            logger.info(
              "Stripe checkout session completed & tier upgrade applied via admin client",
              {
                userId,
                customerId,
                subscriptionId,
                rawTier,
                userTier,
                apiKeyTier,
              },
            );

            // SIGMA-6: Autonomous PDF Invoice generation & Supabase Storage upload
            const invoiceId = `inv_${session.id.slice(-12)}_${Date.now()}`;
            const amountTotal = session.amount_total || 2900;
            const currency = session.currency || "usd";
            const customerEmail = session.customer_details?.email || undefined;
            await processAutonomousPdfInvoice({
              invoiceId,
              userId,
              customerEmail,
              amount: amountTotal,
              currency,
              plan: userTier,
            });
          } else {
            logger.warn("Stripe checkout.session.completed received without resolved userId", {
              sessionId: session.id,
              customerId,
            });
          }
          break;
        }

        case "customer.subscription.created": {
          const subscription = event.data.object;
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;
          const subscriptionId = subscription.id;
          const rawTier = subscription.metadata?.tier || "vendor";
          const { apiKeyTier, userTier } = normalizeTier(rawTier);

          let userId = subscription.metadata?.user_id;
          if (!userId && customerId) {
            const { data: userByCust } = await admin
              .from("users")
              .select("id")
              .eq("stripe_customer_id", customerId)
              .single();
            if (userByCust?.id) {
              userId = userByCust.id;
            }
          }

          if (userId) {
            await admin.from("subscriptions").upsert(
              {
                user_id: userId,
                stripe_customer_id: customerId || null,
                stripe_subscription_id: subscriptionId,
                plan: userTier,
                status: subscription.status || "active",
              },
              { onConflict: "user_id" },
            );

            await admin.from("api_keys").update({ tier: apiKeyTier }).eq("provider", userId);
            await admin
              .from("users")
              .update({
                subscription_tier: userTier,
                ...(customerId ? { stripe_customer_id: customerId } : {}),
              })
              .eq("id", userId);

            logger.info(
              "Stripe customer.subscription.created tier upgrade applied via admin client",
              {
                userId,
                customerId,
                subscriptionId,
                userTier,
                apiKeyTier,
              },
            );
          } else {
            logger.warn("Stripe customer.subscription.created received without resolved userId", {
              subscriptionId,
              customerId,
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          const periodEnd = subscription.items?.data?.[0]?.current_period_end;
          const rawTier = subscription.metadata?.tier || "pro";
          const { apiKeyTier, userTier } = normalizeTier(rawTier);
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;

          await admin
            .from("subscriptions")
            .update({
              status: subscription.status,
              plan: isActive ? userTier : "free",
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            })
            .eq("stripe_subscription_id", subscription.id);

          let userId = subscription.metadata?.user_id;
          if (!userId) {
            const { data: subData } = await admin
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_subscription_id", subscription.id)
              .single();
            userId = subData?.user_id;
          }
          if (!userId && customerId) {
            const { data: userByCust } = await admin
              .from("users")
              .select("id")
              .eq("stripe_customer_id", customerId)
              .single();
            if (userByCust?.id) {
              userId = userByCust.id;
            }
          }

          if (userId) {
            if (isActive) {
              await admin.from("api_keys").update({ tier: apiKeyTier }).eq("provider", userId);
              await admin.from("users").update({ subscription_tier: userTier }).eq("id", userId);
              logger.info("Stripe subscription updated (active)", {
                userId,
                subscriptionId: subscription.id,
                userTier,
                apiKeyTier,
              });
            } else {
              await admin.from("api_keys").update({ tier: "free" }).eq("provider", userId);
              await admin.from("users").update({ subscription_tier: "free" }).eq("id", userId);
              logger.info("Stripe subscription updated (inactive)", {
                userId,
                subscriptionId: subscription.id,
              });
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;
          let userId = subscription.metadata?.user_id;

          if (!userId) {
            const { data: subData } = await admin
              .from("subscriptions")
              .select("user_id")
              .eq("stripe_subscription_id", subscription.id)
              .single();
            userId = subData?.user_id;
          }
          if (!userId && customerId) {
            const { data: userByCust } = await admin
              .from("users")
              .select("id")
              .eq("stripe_customer_id", customerId)
              .single();
            if (userByCust?.id) {
              userId = userByCust.id;
            }
          }

          await admin
            .from("subscriptions")
            .update({ status: "canceled", plan: "free" })
            .eq("stripe_subscription_id", subscription.id);

          if (userId) {
            await admin.from("api_keys").update({ tier: "free" }).eq("provider", userId);
            await admin.from("users").update({ subscription_tier: "free" }).eq("id", userId);
          }

          logger.info("Stripe subscription canceled", { subscriptionId: subscription.id, userId });
          break;
        }
      }
    })(),
  );

  return NextResponse.json({ received: true });
}
