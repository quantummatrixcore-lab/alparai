import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/dehost/server";
import { isValidCouponCode } from "@/lib/academy/progress";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ code: z.string().min(1).max(32) });

// Kupon doğrulama (ödeme adımında çağrılır): geçerli + kullanılmamış + süresi dolmamış mı?
export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_parameters" }, { status: 400 });
  }
  const code = parsed.data.code.trim().toUpperCase();
  if (!isValidCouponCode(code)) {
    return NextResponse.json({ data: { valid: false, reason: "bad_format" } }, { status: 200 });
  }
  try {
    const dehost = await createServerClient();
    const { data, error } = await dehost
      .from("academy_coupons")
      .select("percent,used,expires_at,email")
      .eq("code", code)
      .limit(1);
    if (error || !data || (data as unknown[]).length === 0) {
      return NextResponse.json({ data: { valid: false, reason: "not_found" } }, { status: 200 });
    }
    const row = (data as Array<{ percent: number; used: boolean; expires_at: string }>)[0] as {
      percent: number;
      used: boolean;
      expires_at: string;
    };
    if (row.used) {
      return NextResponse.json({ data: { valid: false, reason: "already_used" } }, { status: 200 });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ data: { valid: false, reason: "expired" } }, { status: 200 });
    }
    return NextResponse.json(
      { data: { valid: true, percent: row.percent, expires_at: row.expires_at } },
      { status: 200 },
    );
  } catch (err) {
    logger.error("coupon verify failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = 'nodejs';
