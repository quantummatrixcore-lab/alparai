"use server";

import { requireModerator } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CrossAuditDashboardData {
  overview: {
    averageTruthScore: number;
    averageConfidence: number;
    averageTransparency: number;
    averageNonDiscrimination: number;
    averageDataPrivacy: number;
    totalAudited: number;
  };
  categoryDistribution: { name: string; value: number }[];
  modelComparison: {
    providerName: string;
    averageTruthScore: number;
    averageNonDiscrimination: number;
    incidentCount: number;
  }[];
  riskDistribution: { name: string; value: number }[];
  trendData: {
    date: string;
    truthScore: number;
    nonDiscrimination: number;
  }[];
}

interface IncidentRow {
  cross_audit_truth_score: number | null;
  cross_audit_confidence: number | null;
  eu_act_transparency_score: number | null;
  eu_act_non_discrimination_score: number | null;
  eu_act_data_privacy_score: number | null;
  eu_act_risk_category: string | null;
  category: string;
  incident_date: string | null;
  created_at: string;
  ai_provider_id: string | null;
  ai_providers: { name: string } | null;
}

export async function getCrossAuditDashboardData(): Promise<CrossAuditDashboardData> {
  await requireModerator(); // Gated for moderator, admin, and ceo

  const admin = createAdminClient();

  // Fetch incidents that have been cross-audited
  const { data: incidents, error } = await admin
    .from("incidents")
    .select(
      `
      cross_audit_truth_score,
      cross_audit_confidence,
      eu_act_transparency_score,
      eu_act_non_discrimination_score,
      eu_act_data_privacy_score,
      eu_act_risk_category,
      category,
      incident_date,
      created_at,
      ai_provider_id,
      ai_providers (
        name
      )
    `,
    )
    .eq("status", "published")
    .not("cross_audit_truth_score", "is", null);

  if (error || !incidents || incidents.length === 0) {
    return {
      overview: {
        averageTruthScore: 0,
        averageConfidence: 0,
        averageTransparency: 0,
        averageNonDiscrimination: 0,
        averageDataPrivacy: 0,
        totalAudited: 0,
      },
      categoryDistribution: [],
      modelComparison: [],
      riskDistribution: [],
      trendData: [],
    };
  }

  // 1. Overview Calculations
  let sumTruth = 0;
  let sumConf = 0;
  let sumTrans = 0;
  let sumNonDisc = 0;
  let sumPrivacy = 0;
  let countTrans = 0;
  let countNonDisc = 0;
  let countPrivacy = 0;

  // 2. Category Distribution
  const categoryCounts: Record<string, number> = {};

  // 3. Model Comparison
  const modelMetrics: Record<
    string,
    { sumTruth: number; sumNonDisc: number; countNonDisc: number; count: number }
  > = {};

  // 4. Risk Distribution
  const riskCounts: Record<string, number> = {};

  // 5. Trend data
  const trendPoints: Record<
    string,
    { sumTruth: number; sumNonDisc: number; countNonDisc: number; count: number }
  > = {};

  const typedIncidents = incidents as unknown as IncidentRow[];

  typedIncidents.forEach((inc) => {
    const truth = inc.cross_audit_truth_score ?? 0;
    const conf = inc.cross_audit_confidence ?? 0;

    sumTruth += truth;
    sumConf += conf;

    if (inc.eu_act_transparency_score !== null && inc.eu_act_transparency_score !== undefined) {
      sumTrans += inc.eu_act_transparency_score;
      countTrans++;
    }
    if (
      inc.eu_act_non_discrimination_score !== null &&
      inc.eu_act_non_discrimination_score !== undefined
    ) {
      sumNonDisc += inc.eu_act_non_discrimination_score;
      countNonDisc++;
    }
    if (inc.eu_act_data_privacy_score !== null && inc.eu_act_data_privacy_score !== undefined) {
      sumPrivacy += inc.eu_act_data_privacy_score;
      countPrivacy++;
    }

    // Category distribution
    const cat = inc.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Model / Provider Comparison
    const providerName = inc.ai_providers?.name || "Unknown Provider";
    if (!modelMetrics[providerName]) {
      modelMetrics[providerName] = { sumTruth: 0, sumNonDisc: 0, countNonDisc: 0, count: 0 };
    }
    modelMetrics[providerName].sumTruth += truth;
    if (
      inc.eu_act_non_discrimination_score !== null &&
      inc.eu_act_non_discrimination_score !== undefined
    ) {
      modelMetrics[providerName].sumNonDisc += inc.eu_act_non_discrimination_score;
      modelMetrics[providerName].countNonDisc++;
    }
    modelMetrics[providerName].count++;

    // Risk distribution
    const risk = inc.eu_act_risk_category || "Minimal";
    riskCounts[risk] = (riskCounts[risk] || 0) + 1;

    // Trend by month. Group by YYYY-MM
    const dateStr = inc.incident_date || inc.created_at;
    if (dateStr) {
      const month = dateStr.substring(0, 7); // e.g. '2026-06'
      if (!trendPoints[month]) {
        trendPoints[month] = { sumTruth: 0, sumNonDisc: 0, countNonDisc: 0, count: 0 };
      }
      trendPoints[month].sumTruth += truth;
      if (
        inc.eu_act_non_discrimination_score !== null &&
        inc.eu_act_non_discrimination_score !== undefined
      ) {
        trendPoints[month].sumNonDisc += inc.eu_act_non_discrimination_score;
        trendPoints[month].countNonDisc++;
      }
      trendPoints[month].count++;
    }
  });

  const total = incidents.length;

  const overview = {
    averageTruthScore: Math.round(sumTruth / total),
    averageConfidence: parseFloat((sumConf / total).toFixed(2)),
    averageTransparency: countTrans > 0 ? Math.round(sumTrans / countTrans) : 0,
    averageNonDiscrimination: countNonDisc > 0 ? Math.round(sumNonDisc / countNonDisc) : 0,
    averageDataPrivacy: countPrivacy > 0 ? Math.round(sumPrivacy / countPrivacy) : 0,
    totalAudited: total,
  };

  const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const modelComparison = Object.entries(modelMetrics).map(([providerName, metrics]) => ({
    providerName,
    averageTruthScore: Math.round(metrics.sumTruth / metrics.count),
    averageNonDiscrimination:
      metrics.countNonDisc > 0 ? Math.round(metrics.sumNonDisc / metrics.countNonDisc) : 0,
    incidentCount: metrics.count,
  }));

  const riskDistribution = Object.entries(riskCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const trendData = Object.entries(trendPoints)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, metrics]) => ({
      date: month,
      truthScore: Math.round(metrics.sumTruth / metrics.count),
      nonDiscrimination:
        metrics.countNonDisc > 0 ? Math.round(metrics.sumNonDisc / metrics.countNonDisc) : 0,
    }));

  return {
    overview,
    categoryDistribution,
    modelComparison,
    riskDistribution,
    trendData,
  };
}
