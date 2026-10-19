import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";

import { createServerClient } from "@/lib/dehost/server";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { maskPII } from "@/lib/pii/guardian";
import { logger } from "@/lib/utils/logger";
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from "@/lib/constants";

/**
 * ALPAR AI — Public Incident Registry API (v1 intake).
 *
 * SECURITY CONTRACT (DORA Elite):
 *  1. Every write lands in `pending_review`. Clients can NEVER set `status`,
 *     `is_expert`, cross-audit scores, counters or publication timestamps.
 *  2. Every payload is validated with a strict Zod contract (unknown keys rejected).
 *  3. Every write is rate-limited per IP hash and PII-masked before ingress.
 *  4. The response never contains unmasked user content.
 *
 * The legacy `data/incidents.jsonl` filesystem fallback was removed: it is
 * read-only on serverless/edge runtimes and crashed the connection instead of
 * returning a JSON response (the "LIVE RADAR" ticker was dead in production).
 */

const CATEGORY_VALUES = INCIDENT_CATEGORIES.map((c) => c.value) as [
  (typeof INCIDENT_CATEGORIES)[number]["value"],
  ...(typeof INCIDENT_CATEGORIES)[number]["value"][],
];

const SEVERITY_VALUES = SEVERITY_LEVELS.map((s) => s.value) as [
  (typeof SEVERITY_LEVELS)[number]["value"],
  ...(typeof SEVERITY_LEVELS)[number]["value"][],
];

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const incidentIntakeSchema = z
  .object({
    title: z
      .string()
      .min(8, "Title must be at least 8 characters")
      .max(200, "Title must be at most 200 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(10000, "Description must be at most 10,000 characters"),
    category: z.enum(CATEGORY_VALUES),
    severity: z.enum(SEVERITY_VALUES),
    ai_provider_id: z.string().uuid().optional().nullable(),
    ai_model_id: z.string().uuid().optional().nullable(),
    provider_custom_name: z.string().max(200).optional().nullable(),
    model_custom_name: z.string().max(200).optional().nullable(),
    incident_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .optional()
      .nullable(),
    location_country: z
      .string()
      .length(2, "Country must be ISO 3166-1 alpha-2")
      .optional()
      .nullable(),
    language: z.string().min(2).max(5).optional().default("en"),
    source_url: z.string().url().optional().nullable(),
    is_anonymous: z.boolean().optional().default(true),
    expert_fix: z.string().max(5000).optional().nullable(),
  })
  // Reject any key we do not explicitly whitelist. This is the field that
  // previously let a caller inject `status`, `is_expert` or
  // `cross_audit_truth_score` through the `...body` spread.
  .strict();

/** Fields a client may never influence, on the read side either. */
const PUBLIC_PROJECTION =
  "id, title_masked, description_masked, category, severity, status, incident_date, created_at, published_at, ai_provider_id, ai_model_id, upvotes_count, views_count, source_url";

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const query = searchParams.get("q")?.trim() ?? "";

    const dehost = await createServerClient();

    let dbQuery = dehost
      .from("incidents")
      .select(PUBLIC_PROJECTION)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (query) {
      // Strip wildcard/operator characters so the term cannot widen the filter.
      const sanitized = query.replace(/[%_,\\]/g, " ").trim();
      if (sanitized.length >= 2) {
        dbQuery = dbQuery.ilike("title_masked", `%${sanitized}%`);
      }
    }

    const { data, error } = await dbQuery;

    if (error) {
      logger.error("GET /api/incidents failed", { error: error.message });
      return NextResponse.json({ error: "Failed to read incidents" }, { status: 500 });
    }

    return NextResponse.json(
      { data: data ?? [], count: Array.isArray(data) ? data.length : 0 },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    logger.error(
      "GET /api/incidents unhandled error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json({ error: "Failed to read incidents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Rate limit (per hashed IP). Applies to anonymous and authenticated callers.
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = await sha256Hex(ip);
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.incident_submission}:${ipHash}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited", retryAfter: rl.retryAfter ?? 60 },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
      );
    }

    // 2. Strict contract validation.
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const parsed = incidentIntakeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // 3. PII scrubbing before ingress.
    const maskedTitle = maskPII(data.title);
    const maskedDescription = maskPII(data.description);
    const maskedSourceUrl = data.source_url ? maskPII(data.source_url).masked : null;
    const maskedProviderCustom = data.provider_custom_name
      ? maskPII(data.provider_custom_name).masked
      : null;
    const maskedModelCustom = data.model_custom_name
      ? maskPII(data.model_custom_name).masked
      : null;
    const maskedExpertFix = data.expert_fix ? maskPII(data.expert_fix).masked : null;

    const containsPii =
      maskedTitle.masked !== data.title ||
      maskedDescription.masked !== data.description ||
      (maskedSourceUrl !== null && maskedSourceUrl !== data.source_url) ||
      (maskedExpertFix !== null && maskedExpertFix !== data.expert_fix);

    // 4. Server-owned fields. The client has no say over any of these.
    const incidentId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const payload = {
      id: incidentId,
      title: maskedTitle.masked,
      title_masked: maskedTitle.masked,
      description: maskedDescription.masked,
      description_masked: maskedDescription.masked,
      category: data.category,
      severity: data.severity,
      status: "pending_review",
      processing_stage: "queued",
      ai_provider_id: data.ai_provider_id ?? null,
      ai_model_id: data.ai_model_id ?? null,
      provider_custom_name: maskedProviderCustom,
      model_custom_name: maskedModelCustom,
      incident_date: data.incident_date ?? nowIso.slice(0, 10),
      location_country: data.location_country ?? null,
      language: data.language ?? "en",
      source_url: maskedSourceUrl,
      is_anonymous: data.is_anonymous ?? true,
      // Expert claim is never self-asserted through the public API.
      is_expert: false,
      expert_fix: maskedExpertFix,
      contains_pii: containsPii,
      views_count: 0,
      upvotes_count: 0,
      comments_count: 0,
      shares_count: 0,
      affected_users_count: 0,
      cross_audit_truth_score: null,
      cross_audit_confidence: null,
      moderator_notes: "Submitted via public API intake. Awaiting moderation.",
      created_at: nowIso,
      updated_at: nowIso,
    };

    const dehost = await createServerClient();
    const { data: inserted, error } = await dehost
      .from("incidents")
      .insert(payload)
      .select("id, status, created_at")
      .single();

    if (error || !inserted) {
      logger.error("POST /api/incidents insert failed", { error: error?.message });
      return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: inserted.id,
        status: inserted.status,
        created_at: inserted.created_at,
        message: "Incident received and queued for moderation review.",
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error(
      "POST /api/incidents unhandled error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
  }
}

export const runtime = "nodejs";
