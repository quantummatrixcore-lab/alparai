import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/dehost/server";
import { getLesson } from "@/lib/academy/lessons";
import {
  COUPON_PERCENT,
  gradeQuizLocalized,
  isValidCertCode,
  makeCertCode,
  makeCouponCode,
} from "@/lib/academy/progress";
import { recordUsage } from "@/lib/billing/meter";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(254),
  slug: z.string().min(1).max(64),
  locale: z.enum(["tr", "en"]).default("tr"),
  answers: z.array(z.number().int().min(0).max(9)).min(1).max(20),
});

// Ders bitirme: notla → geçtiyse belge kodu + e-posta başına TEK kupon.
// Kupon avcılığına karşı: e-posta başına 1 kupon, tek kullanımlık, 30 gün.
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
  const { email, slug, locale, answers } = parsed.data;
  const lesson = getLesson(slug);
  if (!lesson) {
    return NextResponse.json({ error: "lesson_not_found" }, { status: 404 });
  }
  const { score, passed } = gradeQuizLocalized(slug, locale, answers);
  recordUsage(email.toLowerCase(), "academy-complete", 1);

  if (!passed) {
    return NextResponse.json(
      {
        data: { passed: false, score, required: 70 },
        meta: { generated_at: new Date().toISOString() },
      },
      { status: 200 },
    );
  }

  try {
    const dehost = await createServerClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Aynı ders tekrar bitirilirse mevcut belge döner (çift kayıt yok).
    const { data: existing } = await dehost
      .from("academy_completions")
      .select("cert_code,score")
      .eq("email", normalizedEmail)
      .eq("lesson_slug", slug)
      .eq("passed", true)
      .limit(1);
    const existingRow = (existing as Array<{ cert_code?: string | null }> | null)?.[0];
    if (existingRow?.cert_code && isValidCertCode(existingRow.cert_code)) {
      const { data: couponRows } = await dehost
        .from("academy_coupons")
        .select("code,percent,used,expires_at")
        .eq("email", normalizedEmail)
        .limit(1);
      const coupon = (couponRows as Array<Record<string, unknown>> | null)?.[0] ?? null;
      return NextResponse.json(
        {
          data: { passed: true, score, cert_code: existingRow.cert_code, coupon, repeated: true },
          meta: { generated_at: new Date().toISOString() },
        },
        { status: 200 },
      );
    }

    let certCode = makeCertCode();
    const { error: insertErr } = await dehost.from("academy_completions").insert({
      email: normalizedEmail,
      lesson_slug: slug,
      score,
      passed: true,
      cert_code: certCode,
    });
    if (insertErr) {
      // Yarış durumu: aynı anda iki istek → mevcut kaydı döndür.
      if (insertErr.message?.includes("duplicate") || insertErr.message?.includes("unique")) {
        const { data: retry } = await dehost
          .from("academy_completions")
          .select("cert_code")
          .eq("email", normalizedEmail)
          .eq("lesson_slug", slug)
          .limit(1);
        const row = (retry as Array<{ cert_code?: string | null }> | null)?.[0];
        if (row?.cert_code) certCode = row.cert_code;
      } else {
        throw new Error(insertErr.message);
      }
    }

    // Kupon: e-posta başına TEK. Varsa eskisi döner, yoksa üretilir.
    let coupon: Record<string, unknown> | null = null;
    const { data: existingCoupons } = await dehost
      .from("academy_coupons")
      .select("code,percent,used,expires_at")
      .eq("email", normalizedEmail)
      .limit(1);
    const first = (existingCoupons as Array<Record<string, unknown>> | null)?.[0];
    if (first) {
      coupon = first;
    } else {
      const code = makeCouponCode();
      const { error: couponErr, data: inserted } = await dehost
        .from("academy_coupons")
        .insert({
          email: normalizedEmail,
          code,
          percent: COUPON_PERCENT,
        })
        .select("code,percent,used,expires_at");
      if (!couponErr) {
        coupon = (inserted as Array<Record<string, unknown>> | null)?.[0] ?? null;
      }
    }

    return NextResponse.json(
      {
        data: { passed: true, score, cert_code: certCode, coupon },
        meta: {
          generated_at: new Date().toISOString(),
          certificate_kind: "etik-kullanici-katilim-belgesi",
        },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("academy complete failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = 'nodejs';
