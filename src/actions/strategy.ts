"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireCEO } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database";

/**
 * SWOT Actions
 */
export async function upsertSwotItemAction(data: {
  id?: string;
  category: "strength" | "weakness" | "opportunity" | "threat";
  title: string;
  description: string | null;
  weight: "low" | "medium" | "high";
  action_plan: string | null;
  target_date: string | null;
  status: "active" | "done" | "archived";
}): Promise<{ success: boolean; id: string }> {
  const user = await requireCEO();
  const supabase = await createServerClient();

  const payload = {
    category: data.category,
    title: data.title,
    description: data.description,
    weight: data.weight,
    action_plan: data.action_plan,
    target_date: data.target_date || null,
    status: data.status,
    owner_user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (data.id) {
    const { data: updated, error } = await supabase
      .from("strategy_swot_items")
      .update(payload)
      .eq("id", data.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    result = updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("strategy_swot_items")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    result = inserted;
  }

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true, id: result.id };
}

export async function deleteSwotItemAction(id: string): Promise<{ success: boolean }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { error } = await supabase.from("strategy_swot_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true };
}

/**
 * Risk Actions
 */
export async function upsertRiskAction(data: {
  id?: string;
  code: string;
  title: string;
  description: string | null;
  probability: number;
  impact: number;
  mitigation_plan: string | null;
  target_date: string | null;
  status: "active" | "mitigated" | "triggered" | "closed";
}): Promise<{ success: boolean; id: string }> {
  const user = await requireCEO();
  const supabase = await createServerClient();

  const payload = {
    code: data.code,
    title: data.title,
    description: data.description,
    probability: data.probability,
    impact: data.impact,
    mitigation_plan: data.mitigation_plan,
    target_date: data.target_date || null,
    status: data.status,
    owner_user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (data.id) {
    const { data: updated, error } = await supabase
      .from("strategy_risks")
      .update(payload)
      .eq("id", data.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    result = updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("strategy_risks")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    result = inserted;
  }

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true, id: result.id };
}

export async function deleteRiskAction(id: string): Promise<{ success: boolean }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { error } = await supabase.from("strategy_risks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true };
}

/**
 * Valuation Actions
 */
export async function saveValuationAction(data: {
  method: "berkus" | "scorecard" | "vc" | "revenue" | "average";
  inputs: Json;
  result_pre_money: number;
  notes: string | null;
}) {
  const user = await requireCEO();
  const supabase = await createServerClient();

  const { data: inserted, error } = await supabase
    .from("strategy_valuations")
    .insert({
      method: data.method,
      inputs: data.inputs,
      result_pre_money: data.result_pre_money,
      notes: data.notes,
      snapshot_date: new Date().toISOString().split("T")[0],
      created_by: user.id,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true, id: inserted.id };
}

/**
 * Roadmap / Milestone Actions
 */
export async function upsertMilestoneAction(data: {
  id?: string;
  quarter: string;
  title: string;
  okr_text: string | null;
  progress: number;
  status: "planned" | "in_progress" | "done" | "missed";
  linked_metric: string | null;
}): Promise<{ success: boolean; id: string }> {
  const user = await requireCEO();
  const supabase = await createServerClient();

  const payload = {
    quarter: data.quarter,
    title: data.title,
    okr_text: data.okr_text,
    progress: data.progress,
    status: data.status,
    linked_metric: data.linked_metric,
    owner_user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (data.id) {
    const { data: updated, error } = await supabase
      .from("strategy_milestones")
      .update(payload)
      .eq("id", data.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    result = updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("strategy_milestones")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    result = inserted;
  }

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true, id: result.id };
}

export async function deleteMilestoneAction(id: string): Promise<{ success: boolean }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { error } = await supabase.from("strategy_milestones").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true };
}

/**
 * Metrics Snapshot Actions
 */
export async function createMetricsSnapshotAction(data: {
  total_users: number;
  total_incidents: number;
  active_providers: number;
  media_mentions_count: number;
  mrr_cents: number;
  runway_months: number | null;
  health_score: number;
}): Promise<{ success: boolean; id: string }> {
  await requireCEO();
  const supabase = await createServerClient();

  const { data: inserted, error } = await supabase
    .from("strategy_metrics_snapshots")
    .insert({
      snapshot_date: new Date().toISOString().split("T")[0],
      total_users: data.total_users,
      total_incidents: data.total_incidents,
      active_providers: data.active_providers,
      media_mentions_count: data.media_mentions_count,
      mrr_cents: data.mrr_cents,
      runway_months: data.runway_months,
      health_score: data.health_score,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/admin/strategy", "layout");
  return { success: true, id: inserted.id };
}
