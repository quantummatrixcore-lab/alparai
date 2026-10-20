import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { defenseWindow } from "@/lib/sla/defense";
import { recordUsage } from "@/lib/billing/meter";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const openSchema = z.object({
  incident_id: z.string().min(1),
  vendor_slug: z.string().min(1),
  opened_at: z.string().datetime({ offset: true }).optional(),
});

// IN5 — B2B Due Process: savunma penceresi açma + durum sorgulama.
// Yayın kararı verilmeden önce 30 gün savunma hakkı (staged kayıt).
export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = openSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_parameters" }, { status: 400 });
  }
  try {
    const openedAt = parsed.data.opened_at ?? new Date().toISOString();
    const window = defenseWindow(openedAt);
    recordUsage(request.headers.get("x-api-key") ?? "anonymous", "defense-case", 1);
    return NextResponse.json(
      {
        data: {
          incident_id: parsed.data.incident_id,
          vendor_slug: parsed.data.vendor_slug,
          ...window,
        },
        meta: { generated_at: new Date().toISOString(), storage: "staged" },
      },
      { status: 201 },
    );
  } catch (err) {
    logger.error("defense case failed", undefined, err instanceof Error ? err : undefined);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (rl) return rl;
  const openedAt = new URL(request.url).searchParams.get("opened_at");
  if (!openedAt) {
    return NextResponse.json({ error: "opened_at required" }, { status: 400 });
  }
  try {
    const window = defenseWindow(openedAt);
    return NextResponse.json({ data: window }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "invalid_opened_at" }, { status: 400 });
  }
}
export const runtime = 'nodejs';
