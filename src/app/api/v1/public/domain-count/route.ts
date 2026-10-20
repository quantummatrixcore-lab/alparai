import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/dehost/server";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  domain: z.string().min(3).max(253),
});

// IN4 — Eklenti sayaç ucu: anahtarsız, hız-sınırlı, SADECE sayı döner (PII yok).
// Tarayıcı eklentisi ziyaret edilen sitedeki vaka sayısını buradan okur.
export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  const parsed = querySchema.safeParse({
    domain: new URL(request.url).searchParams.get("domain") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_domain" }, { status: 400 });
  }
  const needle = parsed.data.domain.toLowerCase().replace(/^www\./, "");
  try {
    const dehost = await createServerClient();
    const { data, error } = await dehost
      .from("incidents")
      .select("id,source_url")
      .eq("status", "published")
      .not("evidence_hash", "is", null)
      .limit(500);
    if (error) {
      logger.error("domain-count query failed", { msg: error.message });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
    let count = 0;
    for (const row of (data ?? []) as Array<{ source_url?: string | null }>) {
      try {
        const host = new URL(row.source_url ?? "").hostname.toLowerCase().replace(/^www\./, "");
        if (host === needle || host.endsWith(`.${needle}`) || needle.endsWith(`.${host}`)) {
          count += 1;
        }
      } catch {
        // geçersiz URL satırı sayılmaz
      }
    }
    return NextResponse.json(
      { data: { domain: needle, count }, meta: { generated_at: new Date().toISOString() } },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  } catch (err) {
    logger.error("domain-count unhandled", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
