import { vault } from "@/lib/security/vault";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { logger } from "@/lib/utils/logger";
import { createHmac, timingSafeEqual } from "crypto";

const LEMON_API_KEY = vault.read("LEMONSQUEEZY_API_KEY") ?? process.env.LEMONSQUEEZY_API_KEY;
const LEMON_WEBHOOK_SECRET =
  vault.read("LEMONSQUEEZY_WEBHOOK_SECRET") ?? process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

type Tier = "free" | "developer" | "vendor" | "enterprise";

function normalizeTier(tierRaw?: string | null): Tier {
  const normalized = (tierRaw || "").trim().toLowerCase();
  if (normalized === "enterprise") return "enterprise";
  if (normalized === "vendor") return "vendor";
  return "developer";
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !LEMON_WEBHOOK_SECRET) return false;
  try {
    const digest = createHmac("sha256", LEMON_WEBHOOK_SECRET).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(digest, "utf8");
    const b = Buffer.from(signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveUserId(admin: any, custom: Record<string, any>, email?: string | null): Promise<string | null> {
  const fromCustom =
    custom?.user_id && custom.user_id !== "guest" ? String(custom.user_id)
    : custom?.userId && custom.userId !== "guest" ? String(custom.userId)
    : null;
  if (fromCustom) return fromCustom;
  if (email) {
    const { data } = await admin.from("users").select("id").eq("email", email).single();
    if (data?.id) return data.id as string;
  }
  return null;
}

export async function POST(request: Request) {
  if (!LEMON_API_KEY || !LEMON_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Lemon Squeezy is not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("x-signature");

  if (!verifySignature(rawBody, sig)) {
    logger.error("Lemon Squeezy webhook signature verification failed", undefined);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventName = event?.meta?.event_name as string | undefined;
  if (eventName !== "order_created") {
    return NextResponse.json({ ok: true, ignored: eventName ?? null });
  }

  const attrs = event?.data?.attributes ?? {};
  const custom = (event?.meta?.custom_data ?? {}) as Record<string, any>;
  const tier = normalizeTier(typeof custom.tier === "string" ? custom.tier : "developer");
  const orderId = event?.data?.id ? String(event.data.id) : null;
  const customerId = attrs?.customer_id != null ? String(attrs.customer_id) : null;
  const customerEmail: string | null =
    attrs?.user_email && typeof attrs.user_email === "string" ? attrs.user_email
    : attrs?.user_name && typeof attrs.user_name === "string" && attrs.user_name.includes("@") ? attrs.user_name
    : null;

  try {
    const admin = createAdminClient();
    const userId = await resolveUserId(admin, custom, customerEmail);
    if (!userId) {
      logger.error("Lemon Squeezy order_created: kullanici eslestirilemedi", { orderId });
      return NextResponse.json({ error: "user_unmatched" }, { status: 202 });
    }

    const { data: mevcut } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (mevcut?.id) {
      const { error: updErr } = await admin
        .from("subscriptions")
        .update({
          status: "active",
          lemon_customer_id: customerId,
          lemon_order_id: orderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mevcut.id);
      if (updErr) logger.error("Lemon Squeezy subscriptions update failed", { userId, error: updErr.message });
    } else {
      const { error: insErr } = await admin.from("subscriptions").insert({
        user_id: userId,
        status: "active",
        lemon_customer_id: customerId,
        lemon_order_id: orderId,
      });
      if (insErr) logger.error("Lemon Squeezy subscriptions insert failed", { userId, error: insErr.message });
    }

    const { error: keyErr } = await admin
      .from("api_keys")
      .update({ tier })
      .eq("provider", userId);
    if (keyErr) logger.error("Lemon Squeezy api_keys tier update failed", { userId, error: keyErr.message });

    return NextResponse.json({ ok: true, user_id: userId, tier });
  } catch (err) {
    logger.error("Lemon Squeezy webhook isleme hatasi", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "webhook_failed" }, { status: 500 });
  }
}
