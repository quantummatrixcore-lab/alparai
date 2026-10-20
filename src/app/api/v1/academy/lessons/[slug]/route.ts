import { type NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getLesson } from "@/lib/academy/lessons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rl = rateLimit(request);
  if (rl) return rl;
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) {
    return NextResponse.json({ error: "lesson_not_found" }, { status: 404 });
  }
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "tr";
  const body = locale === "en" ? lesson.en : lesson.tr;
  // Cevap anahtarları client'a GÖNDERİLMEZ (kopya önleme).
  return NextResponse.json(
    {
      data: {
        slug: lesson.slug,
        order: lesson.order,
        title: body.title,
        minutes: body.minutes,
        summary: body.summary,
        sections: body.sections,
        questions: body.quiz.map((q, i) => ({ index: i, q: q.q, choices: q.choices })),
      },
      meta: { generated_at: new Date().toISOString(), locale },
    },
    { status: 200, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
