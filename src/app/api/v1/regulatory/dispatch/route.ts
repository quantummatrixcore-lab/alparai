import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { computeArticle73Deadline } from "@/lib/legal/article73";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  incident_id: z.string().min(1),
  incident_date: z.string().min(1),
  severity: z.string().min(1),
  eu_act_risk_category: z.string().nullable().optional(),
});

// FAZ1: EU AI Act Madde 73 otomatik bildirim paketi (iskelet).
// Gerçek AB portal gönderimi yok; deterministik vade + eIDAS uyumlu JSON-LD üretir.
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
  try {
    const deadline = computeArticle73Deadline({
      incidentDate: parsed.data.incident_date,
      severity: parsed.data.severity,
      euActRiskCategory: parsed.data.eu_act_risk_category ?? null,
    });
    return NextResponse.json(
      {
        data: {
          incident_id: parsed.data.incident_id,
          article: "73",
          tier: deadline.tier,
          due_at: deadline.dueAt,
          remaining_ms: deadline.remainingMs,
          overdue: deadline.overdue,
          label: deadline.label,
          package: {
            "@context": "https://www.w3.org/2018/credentials/v1",
            type: ["VerifiableCredential", "AIIncidentNotification"],
            incident: parsed.data.incident_id,
            dueAt: deadline.dueAt,
          },
        },
        meta: { generated_at: new Date().toISOString(), dispatch: "staged" },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("regulatory dispatch failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
