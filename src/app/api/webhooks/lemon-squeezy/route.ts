import { NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Interface definition for CoinBridge transaction records
 */
interface CoinBridgeTxRecord {
  tx_id: string;
  agent_id: string;
  amount_usd: number;
  type: "EARN" | "SPEND";
  balance_after: number;
  timestamp: number;
  iso_timestamp: string;
  prev_hash: string;
  hash: string;
  contract_synced: boolean;
  contract_token_amount: string;
  metadata: Record<string, unknown>;
}

interface CoinBridgeModule {
  registerTransaction: (
    agent_id: string,
    amount_usd: number,
    type: "EARN" | "SPEND",
    metadata?: Record<string, unknown>
  ) => CoinBridgeTxRecord;
  getBalance: (agent_id: string) => number;
  generateInvoice: (agent_id: string, options?: Record<string, unknown>) => unknown;
  verifyInvoice: (invoice: unknown, secret?: string | null) => unknown;
  resetBridge: () => void;
}

/**
 * Dynamically resolves and loads the v65_coin_bridge.js engine.
 * Ensures compatibility across both local ESM Next.js execution and production runtime.
 */
function getCoinBridge(): CoinBridgeModule | null {
  const candidatePaths = [
    "D:\\001-AGI\\engines\\v65_coin_bridge.js",
    path.resolve(process.cwd(), "../001-AGI/engines/v65_coin_bridge.js"),
    path.resolve("D:/001-AGI/engines/v65_coin_bridge.js"),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      try {
        const req =
          typeof __non_webpack_require__ !== "undefined"
            ? __non_webpack_require__
            : createRequire(import.meta.url);
        return req(candidatePath) as CoinBridgeModule;
      } catch (err) {
        try {
          // Fallback to direct require in standard CommonJS environment
          const req = createRequire(import.meta.url);
          return req(candidatePath) as CoinBridgeModule;
        } catch (innerErr) {
          logger.error(
            "Failed to load v65_coin_bridge engine",
            undefined,
            innerErr instanceof Error ? innerErr : undefined
          );
        }
      }
    }
  }

  logger.error(
    "v65_coin_bridge.js engine could not be found in candidate paths",
    { candidatePaths }
  );
  return null;
}

/**
 * Constant-time HMAC-SHA256 signature verification for Lemon Squeezy webhooks
 */
function verifySignature(rawBody: string, signatureHex: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const expected = hmac.update(rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const actualBuf = Buffer.from(signatureHex, "hex");

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Helper to safely extract USD amount from Lemon Squeezy payload.
 * Lemon Squeezy standardizes money in cents (integer).
 */
function extractAmountUsd(attributes: Record<string, unknown>, customData: Record<string, unknown>): number {
  const rawTotal = attributes.total;
  if (typeof rawTotal === "number" && !Number.isNaN(rawTotal) && rawTotal > 0) {
    // Lemon Squeezy sends totals in cents (e.g., 9900 = $99.00 USD)
    return parseFloat((rawTotal / 100).toFixed(2));
  }

  return 0;
}

/**
 * Helper to identify the selling agent responsible for this transaction.
 */
function extractAgentId(attributes: Record<string, unknown>, customData: Record<string, unknown>): string {
  const customAgent = customData.agent_id || customData.agentId || customData.agent;
  if (typeof customAgent === "string" && customAgent.trim().length > 0) {
    return customAgent.trim();
  }

  const firstItem = attributes.first_order_item as Record<string, unknown> | undefined;
  if (firstItem) {
    const variantName = firstItem.variant_name;
    if (typeof variantName === "string" && variantName.trim().length > 0) {
      return variantName.trim();
    }
    const productName = firstItem.product_name;
    if (typeof productName === "string" && productName.trim().length > 0) {
      return productName.trim();
    }
  }

  return "ALPAR_AI_SALES_AGENT";
}

/**
 * GET Handler — Health and configuration status for Lemon Squeezy Webhook endpoint
 */
export async function GET() {
  const secretConfigured = Boolean(
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  );
  const apiKeyConfigured = Boolean(
    process.env.LEMON_SQUEEZY_API_KEY || process.env.LEMONSQUEEZY_API_KEY
  );

  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/lemon-squeezy",
    service: "Lemon Squeezy Webhook - Monetization Trigger",
    bridge_engine: "v65_coin_bridge.js",
    secret_configured: secretConfigured,
    api_key_configured: apiKeyConfigured,
    supported_events: ["order_created"],
    timestamp: new Date().toISOString(),
  });
}

const processedOrders = new Set<string>();

/**
 * POST Handler — Lemon Squeezy Webhook Processor
 * When an 'order_created' event is received, calls registerTransaction() on v65_coin_bridge.js
 * to credit 'EARN' directly to the selling agent's ledger with cryptographic SHA-384 proof.
 */
export async function POST(request: Request) {
  const webhookSecret =
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ||
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET ||
    "";

  if (!webhookSecret) {
    logger.error("Lemon Squeezy webhook secret is missing (Fail-Closed)");
    return NextResponse.json(
      { error: "unconfigured_secret", message: "Webhook secret is strictly required" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!signature) {
    logger.warn("Lemon Squeezy webhook missing x-signature header");
    return NextResponse.json(
      { error: "missing_signature", message: "x-signature header is required" },
      { status: 400 }
    );
  }

  const isValid = verifySignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    logger.error("Lemon Squeezy webhook signature verification failed");
    return NextResponse.json(
      { error: "invalid_signature", message: "Signature verification failed" },
      { status: 401 }
    );
  }

  // Parse webhook payload
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    logger.error("Lemon Squeezy webhook invalid JSON body", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "invalid_json", message: "Failed to parse JSON body" },
      { status: 400 }
    );
  }

  const meta = payload?.meta || {};
  const eventName = meta?.event_name;
  const customData = meta?.custom_data || {};
  const dataObject = payload?.data || {};
  const attributes = dataObject?.attributes || {};

  logger.info("Lemon Squeezy webhook received", {
    eventName,
    orderId: dataObject?.id,
    userEmail: attributes?.user_email,
  });

  // Handle order_created payment success event
  if (eventName === "order_created") {
    const orderId = String(dataObject?.id || "");
    if (orderId && processedOrders.has(orderId)) {
      logger.info("Lemon Squeezy order already processed (idempotency)", { orderId });
      return NextResponse.json({
        success: true,
        message: "Order already processed (idempotency check)",
      });
    }

    const bridge = getCoinBridge();
    if (!bridge) {
      logger.error("v65_coin_bridge engine unavailable to register transaction");
      return NextResponse.json(
        { error: "engine_unavailable", message: "CoinBridge engine is unavailable" },
        { status: 500 }
      );
    }

    const agentId = extractAgentId(attributes, customData);
    const amountUsd = extractAmountUsd(attributes, customData);

    const metadata = {
      source: "lemon_squeezy_webhook",
      event_name: eventName,
      order_id: String(dataObject?.id || ""),
      order_number: attributes?.order_number,
      customer_name: attributes?.user_name || attributes?.customer_name,
      customer_email: attributes?.user_email || attributes?.customer_email,
      currency: (attributes?.currency || "USD").toUpperCase(),
      total_cents: attributes?.total,
      total_usd: attributes?.total_usd,
      product_name: attributes?.first_order_item?.product_name,
      variant_name: attributes?.first_order_item?.variant_name,
      custom_data: customData,
      processed_at: new Date().toISOString(),
    };

    try {
      // Execute EARN transaction in CoinBridge ledger
      const txRecord = bridge.registerTransaction(agentId, amountUsd, "EARN", metadata);
      const balanceUsd = bridge.getBalance(agentId);

      logger.info("Lemon Squeezy order_created successfully processed -> EARN credited", {
        agentId,
        amountUsd,
        txId: txRecord.tx_id,
        balanceUsd,
      });

      if (orderId) {
        processedOrders.add(orderId);
      }

      return NextResponse.json({
        success: true,
        event: eventName,
        agent_id: agentId,
        amount_usd: amountUsd,
        type: "EARN",
        balance_usd: balanceUsd,
        transaction: txRecord,
        message: `Successfully credited $${amountUsd} EARN to agent "${agentId}".`,
      });
    } catch (txError) {
      logger.error(
        "Failed to register EARN transaction in CoinBridge",
        undefined,
        txError instanceof Error ? txError : undefined
      );

      return NextResponse.json(
        {
          error: "transaction_failed",
          message: txError instanceof Error ? txError.message : "Unknown transaction error",
        },
        { status: 500 }
      );
    }
  }

  // Acknowledge other Lemon Squeezy events
  return NextResponse.json({
    success: true,
    event: eventName || "unknown",
    message: `Webhook event "${eventName || "unknown"}" acknowledged.`,
  });
}
