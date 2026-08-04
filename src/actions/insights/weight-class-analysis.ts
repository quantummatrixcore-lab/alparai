"use server";

import { createServerClient } from "@/lib/supabase/server";

export type ModelWeightClass = "open" | "closed" | "unknown";

export interface WeightClassIncidentStat {
  weight_class: ModelWeightClass;
  incident_count: number;
}

export type WeightClassAnalysisResult =
  | { insufficient_data: true }
  | {
      insufficient_data: false;
      total_incidents: number;
      rows: WeightClassIncidentStat[];
    };

const MIN_INCIDENTS = 10;

export async function getWeightClassAnalysis(): Promise<WeightClassAnalysisResult> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("get_incident_weight_class_stats");

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as WeightClassIncidentStat[];
  const totalIncidents = rows.reduce((sum, row) => sum + row.incident_count, 0);

  if (totalIncidents < MIN_INCIDENTS) {
    return { insufficient_data: true };
  }

  return { insufficient_data: false, total_incidents: totalIncidents, rows };
}
