import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getLessonList } from "@/lib/academy/lessons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Okul ders listesi (ücretsiz yem).
export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "tr";
  return NextResponse.json(
    {
      data: getLessonList(locale),
      meta: { generated_at: new Date().toISOString(), locale },
    },
    { status: 200, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
