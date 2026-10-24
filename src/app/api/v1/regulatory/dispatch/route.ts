import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual, createHash } from "node:crypto";
import { rateLimit } from "@/lib/rate-limit";
import { computeArticle73Deadline } from "@/lib/legal/article73";
import { recordUsage } from "@/lib/billing/meter";
import { logger } from "@/lib/utils/logger";
import { checkInternalQuota } from "@/lib/internal/guard";

import { vault } from "@/lib/security/vault";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

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

  // 1. Internal client quota check
  const internalKey = request.headers.get("x-internal-client");
  let isInternalAuthorized = false;
  if (internalKey) {
    const q = checkInternalQuota(internalKey);
    if (!q.ok) {
      return NextResponse.json(
        { error: "internal_quota_exceeded", retryAfter: q.retryAfter },
        { status: 429, headers: { "Retry-After": String(q.retryAfter) } },
      );
    }
    isInternalAuthorized = true;
  }

  // 2. Active session check
  let isSessionAuthorized = false;
  try {
    const { getCurrentUser } = await import("@/lib/auth/session");
    const user = await getCurrentUser();
    if (user?.id) {
      isSessionAuthorized = true;
    }
  } catch {
    // Unauthenticated
  }

  // 3. API Key check (x-api-key or Bearer token)
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  let isApiKeyValid = false;
  if (apiKey) {
    const validEnvKey =
      (vault.read?.("REGULATORY_API_KEY") ?? process.env.REGULATORY_API_KEY) ||
      (vault.read?.("PUBLIC_API_KEY") ?? process.env.PUBLIC_API_KEY);

    if (validEnvKey && (apiKey === validEnvKey || safeCompare(apiKey, validEnvKey))) {
      isApiKeyValid = true;
    } else {
      try {
        const hashedKey = createHash("sha256").update(apiKey).digest("hex");
        const { createAdminClient } = await import("@/lib/dehost/admin");
        const adminClient = createAdminClient();
        const { data: dbKey } = await adminClient
          .from("api_keys")
          .select("provider, tier")
          .eq("api_key", hashedKey)
          .maybeSingle();

        if (dbKey) {
          isApiKeyValid = true;
        }
      } catch {
        // DB lookup failure or test mock omission
      }
    }
  }

  const isAuthorized = isInternalAuthorized || isSessionAuthorized || isApiKeyValid;
  if (!isAuthorized) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Valid API key or authorized session required for regulatory dispatch.",
      },
      { status: 401 },
    );
  }

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
    // Metered billing: her bildirim paketi 1 birim yazar.
    const callerId = internalKey ?? apiKey ?? (isSessionAuthorized ? "session-user" : "unknown");
    recordUsage(callerId, "regulatory-dispatch", 1);
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization, x-internal-client",
    },
  });
}

export const runtime = "nodejs";
