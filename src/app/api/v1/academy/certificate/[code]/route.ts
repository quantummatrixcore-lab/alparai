import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/dehost/server";
import { getLesson } from "@/lib/academy/lessons";
import { isValidCertCode } from "@/lib/academy/progress";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

// Belge doğrulama: kod gerçek mi, hangi ders, hangi skor?
// NOT: Bu bir katılım belgesidir; akredite diploma değildir.
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const rl = rateLimit(request);
  if (rl) return rl;
  const { code } = await params;
  const normalized = (code || "").trim().toUpperCase();
  if (!isValidCertCode(normalized)) {
    return NextResponse.json({ data: { valid: false, reason: "bad_format" } }, { status: 200 });
  }
  try {
    const dehost = await createServerClient();
    const { data, error } = await dehost
      .from("academy_completions")
      .select("email,lesson_slug,score,created_at")
      .eq("cert_code", normalized)
      .eq("passed", true)
      .limit(1);
    if (error || !data || (data as unknown[]).length === 0) {
      return NextResponse.json({ data: { valid: false, reason: "not_found" } }, { status: 200 });
    }
    const row = (
      data as Array<{ email: string; lesson_slug: string; score: number; created_at: string }>
    )[0] as {
      email: string;
      lesson_slug: string;
      score: number;
      created_at: string;
    };
    const lesson = getLesson(row.lesson_slug);
    return NextResponse.json(
      {
        data: {
          valid: true,
          cert_code: normalized,
          kind: "etik-kullanici-katilim-belgesi",
          kind_note: "Katılım belgesidir; akredite diploma değildir.",
          lesson_slug: row.lesson_slug,
          lesson_title_tr: lesson?.tr.title ?? null,
          lesson_title_en: lesson?.en.title ?? null,
          score: row.score,
          issued_at: row.created_at,
        },
        meta: { generated_at: new Date().toISOString() },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("certificate verify failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
