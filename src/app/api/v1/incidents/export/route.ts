import "server-only";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export async function GET(request: Request) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // B2B Export Rate limit check
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_enterprise}:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: rl.retryAfter },
        { status: 429 },
      );
    }

    const authHeader = hdrs.get("authorization");
    const apiKey = hdrs.get("x-api-key");
    const validKey = process.env.PUBLIC_API_KEY;

    let isAuthenticated = false;

    if (apiKey && validKey && safeCompare(apiKey, validKey)) {
      isAuthenticated = true;
    }

    const supabase = createAdminClient();

    if (!isAuthenticated && authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);
      if (user && !authError) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "json";
    // Defaults to 2700 incidents for database export as requested
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "2700", 10), 3000);

    const { data: incidents, error } = await supabase
      .from("incidents")
      .select(
        `
        id,
        title_masked,
        description_masked,
        severity,
        category,
        eu_act_risk_category,
        eu_act_serious_incident_class,
        created_at
      `,
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: "failed_to_fetch_dataset" }, { status: 500 });
    }

    if (format === "csv") {
      const csvHeaders = "id,title,severity,category,eu_risk_category,created_at\n";
      const rows = (incidents || [])
        .map((i) =>
          [
            i.id,
            `"${(i.title_masked || "").replace(/"/g, '""')}"`,
            i.severity,
            i.category,
            i.eu_act_risk_category || "",
            i.created_at,
          ].join(","),
        )
        .join("\n");

      return new NextResponse(csvHeaders + rows, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="alpar_ai_incidents_dataset.csv"`,
        },
      });
    }

    return NextResponse.json({
      license: "AGPL-3.0 / Open Data Commons",
      provider: "ALPAR AI Public Incident Registry",
      total_records: incidents?.length || 0,
      dataset: incidents,
      exported_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Incidents export error:", error);
    return NextResponse.json({ error: "Internal export error" }, { status: 500 });
  }
}
