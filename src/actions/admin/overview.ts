"use server";

import { createAdminClient } from "@/lib/dehost/admin";
import type {
  IncidentRecord,
  SeverityLevel,
  IncidentStatus,
  EUAIActCategory,
  IngestionSource,
} from "@/types/admin";

export interface AdminOverviewIncident {
  id: string;
  trackingNumber: string;
  modelTarget: string;
  provider: string;
  source: string;
  euAiActTag: string;
  slaRemainingHours: number;
  status: string;
}

export interface AdminOverviewB2BKey {
  id: string;
  organizationName: string;
  monthlyRateUsd: number;
  requestsThisMonth: number;
  requestQuotaMonthly: number;
}

export interface AdminOverviewData {
  recentIncidents: AdminOverviewIncident[];
  b2bKeys: AdminOverviewB2BKey[];
  b2bRevenueStr: string;
  euRiskStr: string;
}

interface RawOverviewIncident {
  id: string;
  title_masked?: string | null;
  title_tr?: string | null;
  severity?: string | null;
  status?: string | null;
  category?: string | null;
  incident_date?: string | null;
  incident_source?: string | null;
  created_at?: string | null;
  ai_providers?: { name?: string | null; slug?: string | null } | null;
}

interface RawApiKeyRow {
  id?: string | null;
  provider?: string | null;
  client_type?: string | null;
  tier?: string | null;
  created_at?: string | null;
}

interface RawIncidentRow {
  id: string;
  title?: string | null;
  title_masked?: string | null;
  title_tr?: string | null;
  description?: string | null;
  description_masked?: string | null;
  status?: string | null;
  severity?: string | null;
  category?: string | null;
  incident_source?: string | null;
  evidence_hash?: string | null;
  created_at?: string | null;
  ai_providers?: { name?: string | null } | null;
}

function calculateSlaRemainingHours(createdAt?: string | null, totalSlaHours = 72.0): number {
  if (!createdAt) return totalSlaHours;
  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) return totalSlaHours;
  const elapsedHours = (Date.now() - createdTime) / (1000 * 60 * 60);
  const remaining = totalSlaHours - elapsedHours;
  return Math.max(0, parseFloat(remaining.toFixed(1)));
}

function mapSeverity(raw?: string | null): SeverityLevel {
  const upper = (raw || "HIGH").toUpperCase();
  if (upper === "CRITICAL") return "CRITICAL";
  if (upper === "HIGH") return "HIGH";
  if (upper === "MEDIUM") return "MEDIUM";
  if (upper === "LOW") return "LOW";
  if (upper === "INFORMATIONAL") return "INFORMATIONAL";
  return "HIGH";
}

function mapStatus(raw?: string | null): IncidentStatus {
  const upper = (raw || "UNDER_TRIAGE").toUpperCase();
  if (upper === "PUBLISHED" || upper === "VERIFIED") return "VERIFIED";
  if (upper === "RESOLVED") return "RESOLVED";
  if (upper === "DISPUTED") return "DISPUTED";
  if (upper === "ARCHIVED") return "ARCHIVED";
  return "UNDER_TRIAGE";
}

function mapEUAIAct(category?: string | null): EUAIActCategory {
  const lower = (category || "").toLowerCase();
  if (lower === "prohibited_practices" || lower.includes("prohibited")) {
    return "PROHIBITED_ART5";
  }
  if (lower.includes("transparency")) {
    return "TRANSPARENCY_ART50";
  }
  if (lower.includes("gpai") || lower.includes("systemic")) {
    return "GPAI_SYSTEMIC_ART51";
  }
  if (lower.includes("compliant")) {
    return "COMPLIANT";
  }
  return "HIGH_RISK_ART6";
}

function mapSource(source?: string | null): IngestionSource {
  const upper = (source || "").toUpperCase();
  if (upper === "PUBLIC_CRAWL" || upper.includes("CRAWL") || upper.includes("SCRAP")) {
    return "PUBLIC_CRAWL";
  }
  if (
    upper === "HUMAN_WHISTLEBLOWER" ||
    upper.includes("WHISTLEBLOWER") ||
    upper.includes("USER")
  ) {
    return "HUMAN_WHISTLEBLOWER";
  }
  if (upper === "ACADEMIC_PAPER" || upper.includes("PAPER") || upper.includes("ARXIV")) {
    return "ACADEMIC_PAPER";
  }
  if (upper === "GITHUB_CVE" || upper.includes("CVE") || upper.includes("GITHUB")) {
    return "GITHUB_CVE";
  }
  return "REGULATORY_FILING";
}

export async function getAdminOverviewData(locale: string): Promise<AdminOverviewData> {
  const admin = createAdminClient();

  // 1. Fetch real recent incidents (last 4 records)
  const { data: incidentsData } = await admin
    .from("incidents")
    .select(
      "id, title_masked, title_tr, severity, status, category, incident_date, incident_source, created_at, ai_providers(name, slug)",
    )
    .order("created_at", { ascending: false })
    .limit(4);

  const rawIncidents = (incidentsData || []) as unknown as RawOverviewIncident[];
  const recentIncidents: AdminOverviewIncident[] = rawIncidents.map((inc) => {
    const trackingNumber = `ALP-2026-${(inc.id || "").substring(0, 4).toUpperCase()}`;
    const modelTarget =
      locale === "tr" && inc.title_tr
        ? inc.title_tr
        : inc.title_masked || "AI Model Incident";
    const provider = inc.ai_providers?.name || "Unknown Provider";
    const source = (inc.incident_source || "USER_SUBMITTED").toUpperCase();
    const euAiActTag =
      inc.category === "prohibited_practices" ? "PROHIBITED_ART5" : "HIGH_RISK_ART6";
    const slaRemainingHours = inc.status === "pending_review" ? 24 : 0;
    const status =
      inc.status === "published"
        ? "SEALED_DEFENDED"
        : inc.status === "pending_review"
          ? "UNDER_TRIAGE"
          : "AUDIT_IN_PROGRESS";

    return {
      id: inc.id,
      trackingNumber,
      modelTarget,
      provider,
      source,
      euAiActTag,
      slaRemainingHours,
      status,
    };
  });

  // 2. Fetch real B2B keys (real count, usage: 0 if no usage column)
  const { data: keysData } = await admin
    .from("api_keys")
    .select("id, provider, client_type, tier, created_at")
    .limit(100);

  const rawKeys = (keysData || []) as unknown as RawApiKeyRow[];
  const b2bKeys: AdminOverviewB2BKey[] = rawKeys.slice(0, 3).map((key) => {
    const tier = (key.tier || "").toLowerCase();
    const quota = tier === "premium" ? 1000000 : tier === "enterprise" ? 5000000 : 250000;
    const usage = 0; // Gerçek kullanım kolonu yok, 0 atanır
    const rate = tier === "premium" ? 5000 : tier === "enterprise" ? 12000 : 1500;
    const providerName = (key.provider || "UNKNOWN").toUpperCase();
    return {
      id: key.id || crypto.randomUUID(),
      organizationName: `${providerName} Core Link`,
      monthlyRateUsd: rate,
      requestsThisMonth: usage,
      requestQuotaMonthly: quota,
    };
  });

  const totalMrr = rawKeys.reduce((acc, curr) => {
    const tier = (curr.tier || "").toLowerCase();
    const rate = tier === "premium" ? 5000 : tier === "enterprise" ? 12000 : 1500;
    return acc + rate;
  }, 0);
  const b2bRevenueStr = `$${(totalMrr / 1000).toFixed(1)}k MRR`;

  // 3. Compute dynamic EU AI Act Risk fine potential from real DB
  const { count: criticalCount } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("severity", "critical");

  const { count: prohibitedCount } = await admin
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("category", "prohibited_practices");

  const cCount = typeof criticalCount === "number" ? criticalCount : 0;
  const pCount = typeof prohibitedCount === "number" ? prohibitedCount : 0;
  const riskFine = pCount * 35.0 + cCount * 15.0;

  let euRiskStr = "€0.0M";
  if (riskFine >= 1000) {
    euRiskStr = `€${(riskFine / 1000).toFixed(2)} Mrd`;
  } else {
    euRiskStr = `€${riskFine > 0 ? riskFine.toFixed(1) : "0.0"}M`;
  }

  return {
    recentIncidents,
    b2bKeys,
    b2bRevenueStr,
    euRiskStr,
  };
}

export async function getAdminIncidentsList(limit = 50): Promise<IncidentRecord[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("incidents")
    .select(
      "id, title, title_masked, title_tr, description, description_masked, status, severity, category, incident_source, evidence_hash, created_at, ai_providers(name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as RawIncidentRow[];
  return rows.map((row) => {
    const createdAt = row.created_at || new Date().toISOString();
    const slaRemainingHours = calculateSlaRemainingHours(createdAt);
    const severity = mapSeverity(row.severity);
    const status = mapStatus(row.status);
    const euAiActTag = mapEUAIAct(row.category);
    const source = mapSource(row.incident_source);
    const potentialFineEur = euAiActTag === "PROHIBITED_ART5" ? 35000000 : 15000000;
    const evidenceHash =
      row.evidence_hash || (row.id.replace(/-/g, "") + "0000000000000000");

    const title = row.title || row.title_masked || row.title_tr || "Untitled AI Incident";
    const summary =
      row.description ||
      row.description_masked ||
      title ||
      "Incident details undergoing triage.";

    return {
      id: row.id,
      trackingNumber: `ALP-2026-${row.id.slice(0, 4)}`,
      title,
      modelTarget: row.ai_providers?.name || "Autonomous AI System",
      provider: row.ai_providers?.name || "Global AI Lab",
      severity,
      status,
      source,
      euAiActTag,
      potentialFineEur,
      slaRemainingHours,
      evidenceHash,
      createdAt,
      humanVerified: true,
      affectedIndustry: "Enterprise & Tech",
      summary,
    };
  });
}
