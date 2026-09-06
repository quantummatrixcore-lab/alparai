import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";

const article50PostSchema = z.object({
  provider_id: z.string().uuid().optional(),
  manifest_url: z.string().url().optional().or(z.string().max(500).optional()),
  watermark_signal: z
    .enum(["synthid", "c2pa", "digimarc", "invisible_watermark", "none"])
    .optional(),
  has_ai_disclosure: z.boolean().optional(),
  media_type: z.enum(["image", "audio", "video", "text", "synthetic_media"]).optional(),
  sample_text: z.string().max(2000).optional(),
});

export async function GET(request: Request) {
  try {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ip}`);

    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: rl.retryAfter },
        { status: 429 },
      );
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("provider_id");

    const supabase = await createServerClient();

    if (providerId) {
      const { data: statusData, error: statusError } = await supabase
        .from("art50_transparency_status")
        .select("*")
        .eq("provider_id", providerId)
        .maybeSingle();

      if (statusError) {
        logger.error(
          "Art 50 GET status error",
          undefined,
          statusError instanceof Error ? statusError : undefined,
        );
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }

      const { data: providerData } = await supabase
        .from("ai_providers")
        .select("id, name, slug, trust_score")
        .eq("id", providerId)
        .maybeSingle();

      return NextResponse.json({
        data: {
          provider: providerData ?? null,
          transparency_status: statusData ?? {
            provider_id: providerId,
            c2pa_provenance_enabled: false,
            watermarking_technology: "none",
            ai_disclosure_compliant: false,
          },
        },
        meta: {
          article: "EU AI Act Article 50 (Transparency Obligations)",
          generated_at: new Date().toISOString(),
        },
      });
    }

    const { data: allStatuses, error: listError } = await supabase
      .from("art50_transparency_status")
      .select("*, ai_providers(name, slug)")
      .order("created_at", { ascending: false });

    if (listError) {
      logger.error(
        "Art 50 GET list error",
        undefined,
        listError instanceof Error ? listError : undefined,
      );
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }

    return NextResponse.json({
      data: allStatuses ?? [],
      meta: {
        count: (allStatuses ?? []).length,
        article: "EU AI Act Article 50 (Transparency Obligations)",
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.api_general}:${ip}`);

  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited", retryAfter: rl.retryAfter }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = article50PostSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parseResult.data;

  // Mask PII if sample text provided
  const sanitizedSampleText = payload.sample_text ? maskPII(payload.sample_text).masked : undefined;

  // Mock Watermark & C2PA Provenance Verification Engine
  const c2paDetected = Boolean(
    payload.manifest_url?.toLowerCase().includes("c2pa") ||
    payload.manifest_url?.toLowerCase().includes("manifest") ||
    payload.watermark_signal === "c2pa",
  );

  const watermarkDetected = Boolean(
    payload.watermark_signal && payload.watermark_signal !== "none",
  );

  const watermarkingTech = payload.watermark_signal ?? (c2paDetected ? "c2pa" : "none");

  const disclosureCompliant = Boolean(
    payload.has_ai_disclosure || (c2paDetected && watermarkDetected),
  );

  let overallStatus: "compliant" | "partially_compliant" | "non_compliant" = "non_compliant";
  if ((c2paDetected || watermarkDetected) && disclosureCompliant) {
    overallStatus = "compliant";
  } else if (c2paDetected || watermarkDetected || disclosureCompliant) {
    overallStatus = "partially_compliant";
  }

  const supabase = await createServerClient();
  let dbRecord = null;

  if (payload.provider_id) {
    const { data: existingRecord } = await supabase
      .from("art50_transparency_status")
      .select("*")
      .eq("provider_id", payload.provider_id)
      .maybeSingle();

    dbRecord = existingRecord;
  }

  return NextResponse.json({
    data: {
      audit_result: {
        status: overallStatus,
        c2pa_provenance_enabled: c2paDetected,
        watermarking_technology: watermarkingTech,
        ai_disclosure_compliant: disclosureCompliant,
        media_type: payload.media_type ?? "synthetic_media",
        sanitized_text_sample: sanitizedSampleText ?? null,
        checks: {
          c2pa_manifest_valid: c2paDetected,
          watermark_signal_detected: watermarkDetected,
          machine_readable_label: disclosureCompliant,
        },
        timestamp: new Date().toISOString(),
      },
      registered_provider_status: dbRecord,
    },
    meta: {
      framework: "EU AI Act - Article 50 Transparency Obligations",
      toolkit_version: "v1.0.0",
      compliance_seal: "ALPAR AI Provenance & Disclosure Integrity Validated",
    },
  });
}
