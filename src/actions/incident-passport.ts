"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";

export interface IncidentPassport {
  meta: {
    generated_at: string;
    passport_version: "1.0";
    alpar_provenance: string;
    compliance_framework: "EU AI Act Article 73";
  };
  incident: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    incident_date: string | null;
    created_at: string;
    updated_at: string | null;
    language: string;
    location_country: string | null;
    source_url: string | null;
  };
  provider: {
    name: string;
    slug: string;
  } | null;
  model: {
    name: string;
  } | null;
  eu_ai_act: {
    risk_category: string | null;
    serious_incident_class: string | null;
    high_risk_system_category: string | null;
    reporting_deadline_days: number | null;
  };
  assessment: {
    truth_score: number | null;
    confidence: number | null;
    reasoning: string | null;
    model: string | null;
  };
  evidence: Array<{
    file_name: string;
    file_path: string;
    mime_type: string | null;
  }>;
  engagement: {
    views: number;
    upvotes: number;
    shares: number;
    comments: number;
  };
}

export async function getIncidentPassport(
  incidentId: string,
): Promise<{ ok: true; passport: IncidentPassport } | { ok: false; error: string }> {
  try {
    await requireUser();
  } catch {
    return { ok: false, error: "Forbidden" };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const user = { id: "auth-user" };
  const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.export_request}:${user.id}:${ip ?? "anon"}`);
  if (!rl.ok) {
    return { ok: false, error: `Rate limited. Try again in ${rl.retryAfter}s.` };
  }

  const supabase = await createServerClient();
  const { data: incident, error } = await supabase
    .from("incidents")
    .select(
      `
      id, title_masked, description_masked,
      category, severity, status,
      incident_date, created_at, updated_at,
      language, location_country, source_url,
      ai_provider_id, ai_model_id,
      eu_act_risk_category,
      eu_act_serious_incident_class,
      eu_act_high_risk_system_category,
      eu_act_reporting_deadline_days,
      cross_audit_truth_score,
      cross_audit_confidence,
      cross_audit_reasoning,
      cross_audit_model,
      views_count, upvotes_count,
      shares_count, comments_count,
      ai_providers:ai_provider_id ( name, slug ),
      ai_models:ai_model_id ( name )
    `,
    )
    .eq("id", incidentId)
    .maybeSingle();

  if (error || !incident) {
    return { ok: false, error: "Incident not found" };
  }

  const data = incident as Record<string, unknown>;
  const providers = data.ai_providers as { name: string; slug: string } | null;
  const models = data.ai_models as { name: string } | null;

  const { data: evidence } = await supabase
    .from("evidence")
    .select("file_name, file_path, mime_type")
    .eq("incident_id", incidentId);

  const passport: IncidentPassport = {
    meta: {
      generated_at: new Date().toISOString(),
      passport_version: "1.0",
      alpar_provenance: `https://alparai.com/en/incidents/${incidentId}`,
      compliance_framework: "EU AI Act Article 73",
    },
    incident: {
      id: data.id as string,
      title: (data.title_masked ?? "") as string,
      description: (data.description_masked ?? "") as string,
      category: data.category as string,
      severity: data.severity as string,
      status: data.status as string,
      incident_date: (data.incident_date as string) ?? null,
      created_at: data.created_at as string,
      updated_at: (data.updated_at as string) ?? null,
      language: data.language as string,
      location_country: (data.location_country as string) ?? null,
      source_url: (data.source_url as string) ?? null,
    },
    provider: providers ? { name: providers.name, slug: providers.slug } : null,
    model: models ? { name: models.name } : null,
    eu_ai_act: {
      risk_category: (data.eu_act_risk_category as string) ?? null,
      serious_incident_class: (data.eu_act_serious_incident_class as string) ?? null,
      high_risk_system_category: (data.eu_act_high_risk_system_category as string) ?? null,
      reporting_deadline_days: (data.eu_act_reporting_deadline_days as number) ?? null,
    },
    assessment: {
      truth_score: (data.cross_audit_truth_score as number) ?? null,
      confidence: (data.cross_audit_confidence as number) ?? null,
      reasoning: (data.cross_audit_reasoning as string) ?? null,
      model: (data.cross_audit_model as string) ?? null,
    },
    evidence: (evidence ?? []) as Array<{
      file_name: string;
      file_path: string;
      mime_type: string | null;
    }>,
    engagement: {
      views: (data.views_count as number) ?? 0,
      upvotes: (data.upvotes_count as number) ?? 0,
      shares: (data.shares_count as number) ?? 0,
      comments: (data.comments_count as number) ?? 0,
    },
  };

  return { ok: true, passport };
}
