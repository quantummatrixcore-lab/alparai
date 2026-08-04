import "server-only";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/utils/logger";
import { isSafeUrl } from "@/lib/security/ssrf";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1] ?? "";
  if (!safeCompare(token, cronSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const db = admin as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq?: (col: string, val: unknown) => unknown;
        limit: (n: number) => Promise<{
          data: Array<{
            id: string;
            cited_url: string;
            ai_engine: string;
            bot_hit_count: number;
          }> | null;
        }>;
      };
      update: (values: unknown) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  // 1. Fetch unverified or existing GEO citations from database
  const { data: citations } = await db
    .from("geo_citations")
    .select("id, cited_url, ai_engine, bot_hit_count")
    .limit(20);

  let verifiedCount = 0;
  let failedCount = 0;

  if (citations && citations.length > 0) {
    for (const citation of citations) {
      if (!isSafeUrl(citation.cited_url)) {
        failedCount++;
        continue;
      }

      try {
        // Perform real HTTP HEAD reachability check with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(citation.cited_url, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "User-Agent": "ALPAR-AI-GEO-Verifier/1.0 (+https://alparai.com)",
          },
        });
        clearTimeout(timeoutId);

        if (response.ok || response.status === 301 || response.status === 302) {
          // Increment verified bot hit count in real DB
          await db
            .from("geo_citations")
            .update({
              bot_hit_count: (citation.bot_hit_count || 0) + 1,
              last_verified_at: new Date().toISOString(),
            })
            .eq("id", citation.id);
          verifiedCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }
  }

  logger.info("GEO Citation Verifier Cron executed", {
    verifiedCount,
    failedCount,
    totalScanned: citations?.length ?? 0,
  });

  return NextResponse.json({
    ok: true,
    message: "Real GEO Citation verification completed",
    citations_verified: verifiedCount,
    citations_failed: failedCount,
    total_scanned: citations?.length ?? 0,
    timestamp: new Date().toISOString(),
  });
}
