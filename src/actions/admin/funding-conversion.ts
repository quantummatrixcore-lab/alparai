"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface FundingConversionResult {
  grantWon: number;
  grantRejected: number;
  grantWinRate: number | null;
  grantApplied: number;
  grantTotal: number;
  grantActivationRate: number | null;
  stateWon: number;
  stateRejected: number;
  stateWinRate: number | null;
  stateApplied: number;
  stateTotal: number;
  stateActivationRate: number | null;
  combinedWon: number;
  combinedRejected: number;
  combinedWinRate: number | null;
  combinedApplied: number;
  combinedTotal: number;
  combinedActivationRate: number | null;
  hasData: boolean;
}

async function countByStatus(
  db: SupabaseClient,
  table: string,
  statuses: string[],
): Promise<number> {
  const { count, error } = await (db as SupabaseClient)
    .from(table)
    .select("id", { count: "exact", head: true })
    .in("status", statuses);
  if (error || count === null) return 0;
  return count;
}

async function countTotal(db: SupabaseClient, table: string): Promise<number> {
  const { count, error } = await (db as SupabaseClient)
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error || count === null) return 0;
  return count;
}

function calculateRate(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export async function getFundingConversion(): Promise<FundingConversionResult | null> {
  const user = await requireModerator();
  if (!user) return null;

  const db = createAdminClient();

  const grantWonStatuses = ["approved", "accepted_by_program"];
  const grantRejectedStatuses = ["rejected"];
  const grantAppliedStatuses = [
    "submitted_pending_review",
    "approved",
    "rejected",
    "accepted_by_program",
  ];

  const stateWonStatuses = ["awarded"];
  const stateRejectedStatuses = ["rejected"];
  const stateAppliedStatuses = ["applied", "awarded", "rejected"];

  const [
    grantWon,
    grantRejected,
    grantApplied,
    grantTotal,
    stateWon,
    stateRejected,
    stateApplied,
    stateTotal,
  ] = await Promise.all([
    countByStatus(db, "grant_applications", grantWonStatuses),
    countByStatus(db, "grant_applications", grantRejectedStatuses),
    countByStatus(db, "grant_applications", grantAppliedStatuses),
    countTotal(db, "grant_applications"),
    countByStatus(db, "strategy_state_support", stateWonStatuses),
    countByStatus(db, "strategy_state_support", stateRejectedStatuses),
    countByStatus(db, "strategy_state_support", stateAppliedStatuses),
    countTotal(db, "strategy_state_support"),
  ]);

  const combinedWon = grantWon + stateWon;
  const combinedRejected = grantRejected + stateRejected;
  const combinedApplied = grantApplied + stateApplied;
  const combinedTotal = grantTotal + stateTotal;

  return {
    grantWon,
    grantRejected,
    grantWinRate: calculateRate(grantWon, grantWon + grantRejected),
    grantApplied,
    grantTotal,
    grantActivationRate: calculateRate(grantApplied, grantTotal),

    stateWon,
    stateRejected,
    stateWinRate: calculateRate(stateWon, stateWon + stateRejected),
    stateApplied,
    stateTotal,
    stateActivationRate: calculateRate(stateApplied, stateTotal),

    combinedWon,
    combinedRejected,
    combinedWinRate: calculateRate(combinedWon, combinedWon + combinedRejected),
    combinedApplied,
    combinedTotal,
    combinedActivationRate: calculateRate(combinedApplied, combinedTotal),

    hasData: combinedTotal > 0,
  };
}
