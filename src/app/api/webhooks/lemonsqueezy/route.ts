import { waitUntil } from "@/lib/dehost/functions-stub";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";
import { processAutonomousPdfInvoice } from "@/lib/billing/invoices";

const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

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

/**
 * Constant-time HMAC-SHA256 signature verification for Lemon Squeezy webhooks
 */
function verifySignature(rawBody: string, signatureHex: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const expected = hmac.update(rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const actualBuf = Buffer.from(signatureHex, "utf8");
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
    logger.error("Lemon Squeezy webhook secret is not configured in environment");
    return NextResponse.json({ error: "Lemon Squeezy not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!signature) {
    logger.warn("Lemon Squeezy webhook missing x-signature header");
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const isValid = verifySignature(rawBody, signature, LEMONSQUEEZY_WEBHOOK_SECRET);
  if (!isValid) {
    logger.error("Lemon Squeezy webhook signature verification failed");
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let eventPayload: any;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch (err) {
    logger.error("Lemon Squeezy webhook invalid JSON body", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventName = eventPayload?.meta?.event_name;
  const customData = eventPayload?.meta?.custom_data || {};
  const dataObject = eventPayload?.data || {};
  const attributes = dataObject.attributes || {};

  logger.info("Lemon Squeezy webhook received", {
    eventName,
    id: dataObject.id,
    type: dataObject.type,
    userEmail: attributes.user_email,
  });

  waitUntil(
    (async () => {
      try {
        const admin = createAdminClient();
        let userId = customData.user_id || customData.userId;
        const userEmail = attributes.user_email;
        const customerId = attributes.customer_id ? String(attributes.customer_id) : undefined;
        const rawTier = customData.tier || "developer";
        const { apiKeyTier, userTier } = normalizeTier(rawTier);

        // Resolve userId by email if not present in custom_data
        if (!userId && userEmail) {
          const { data: userByEmail } = await admin
            .from("users")
            .select("id")
            .eq("email", userEmail)
            .single();
          if (userByEmail?.id) {
            userId = userByEmail.id;
          }
        }

        switch (eventName) {
          case "order_created": {
            if (userId) {
              const subRes = await admin.from("subscriptions").upsert(
                {
                  user_id: userId,
                  stripe_customer_id: customerId || null,
                  stripe_subscription_id: String(dataObject.id || `ls_order_${Date.now()}`),
                  plan: userTier,
                  status: "active",
                },
                { onConflict: "user_id" },
              );

              if (subRes?.error) {
                logger.error("Lemon Squeezy: Failed to upsert subscription on order creation", {
                  userId,
                  error: subRes.error.message,
                });
              }

              const keyRes = await admin
                .from("api_keys")
                .update({ tier: apiKeyTier })
                .eq("provider", userId);

              if (keyRes?.error) {
                logger.error("Lemon Squeezy: Failed to update api_keys tier on order creation", {
                  userId,
                  error: keyRes.error.message,
                });
              }

              const userRes = await admin
                .from("users")
                .update({
                  subscription_tier: userTier,
                })
                .eq("id", userId);

              if (userRes?.error) {
                logger.error("Lemon Squeezy: Failed to update user subscription_tier on order creation", {
                  userId,
                  error: userRes.error.message,
                });
              }

              logger.info("Lemon Squeezy: Order processed and tier upgrade applied", {
                userId,
                userEmail,
                userTier,
                apiKeyTier,
              });

              // Autonomous PDF Invoice generation
              const invoiceId = `inv_ls_${String(dataObject.id || Date.now()).slice(-10)}`;
              const amountTotal = Number(attributes.total || attributes.total_usd || 99000);
              const currency = (attributes.currency || "try").toLowerCase();
              await processAutonomousPdfInvoice({
                invoiceId,
                userId,
                customerEmail: userEmail,
                amount: amountTotal,
                currency,
                plan: userTier,
              });
            } else {
              logger.warn("Lemon Squeezy: order_created received without resolved userId", {
                userEmail,
                orderId: dataObject.id,
              });
            }
            break;
          }

          case "subscription_created":
          case "subscription_payment_success": {
            if (userId) {
              await admin.from("subscriptions").upsert(
                {
                  user_id: userId,
                  stripe_customer_id: customerId || null,
                  stripe_subscription_id: String(dataObject.id),
                  plan: userTier,
                  status: "active",
                },
                { onConflict: "user_id" },
              );

              await admin.from("api_keys").update({ tier: apiKeyTier }).eq("provider", userId);
              await admin.from("users").update({ subscription_tier: userTier }).eq("id", userId);

              logger.info("Lemon Squeezy: Subscription activated/payment confirmed", {
                userId,
                userEmail,
                userTier,
                apiKeyTier,
                subscriptionId: dataObject.id,
              });
            }
            break;
          }

          case "subscription_updated": {
            const status = attributes.status || "active";
            const isActive = status === "active" || status === "trialing";
            const endsAt = attributes.ends_at || attributes.renews_at;

            await admin
              .from("subscriptions")
              .update({
                status: status,
                plan: isActive ? userTier : "free",
                current_period_end: endsAt ? new Date(endsAt).toISOString() : null,
              })
              .eq("stripe_subscription_id", String(dataObject.id));

            if (userId) {
              if (isActive) {
                await admin.from("api_keys").update({ tier: apiKeyTier }).eq("provider", userId);
                await admin.from("users").update({ subscription_tier: userTier }).eq("id", userId);
              } else {
                await admin.from("api_keys").update({ tier: "free" }).eq("provider", userId);
                await admin.from("users").update({ subscription_tier: "free" }).eq("id", userId);
              }
            }
            break;
          }

          case "order_refunded":
          case "subscription_cancelled":
          case "subscription_expired": {
            await admin
              .from("subscriptions")
              .update({ status: "canceled", plan: "free" })
              .eq("stripe_subscription_id", String(dataObject.id));

            if (userId) {
              await admin.from("api_keys").update({ tier: "free" }).eq("provider", userId);
              await admin.from("users").update({ subscription_tier: "free" }).eq("id", userId);
              logger.info("Lemon Squeezy: Access revoked on refund/cancellation", {
                userId,
                eventName,
                orderOrSubId: dataObject.id,
              });
            }
            break;
          }

          default: {
            logger.info("Lemon Squeezy: Unhandled event received", { eventName });
            break;
          }
        }
      } catch (innerErr) {
        logger.error("Lemon Squeezy: Unhandled background task error", undefined, innerErr instanceof Error ? innerErr : undefined);
      }
    })(),
  );

  return NextResponse.json({ received: true, event: eventName });
}
