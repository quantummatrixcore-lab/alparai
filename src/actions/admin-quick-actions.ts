"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function approveIncident(
  incidentId: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("incidents").update({ status: "published" }).eq("id", incidentId);
  if (error) {
    logger.error("[QuickAction] approveIncident failed", { id: incidentId, error: error.message });
    return { ok: false, message: `Failed: ${error.message}` };
  }
  logger.info("[QuickAction] Incident approved", { id: incidentId });
  revalidatePath("/admin");
  revalidatePath("/admin/moderation");
  return { ok: true, message: "Incident approved and published." };
}

export async function rejectIncident(
  incidentId: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("incidents").update({ status: "rejected" }).eq("id", incidentId);
  if (error) {
    logger.error("[QuickAction] rejectIncident failed", { id: incidentId, error: error.message });
    return { ok: false, message: `Failed: ${error.message}` };
  }
  logger.info("[QuickAction] Incident rejected", { id: incidentId });
  revalidatePath("/admin");
  revalidatePath("/admin/moderation");
  return { ok: true, message: "Incident rejected." };
}

export async function toggleFeatureFlag(
  key: string,
  enabled: boolean,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) {
    logger.error("[QuickAction] toggleFeatureFlag failed", {
      key,
      enabled,
      error: (error as { message: string }).message,
    });
    return { ok: false, message: `Failed: ${(error as { message: string }).message}` };
  }
  logger.info("[QuickAction] Feature flag toggled", { key, enabled });
  return { ok: true, message: `Feature flag '${key}' ${enabled ? "enabled" : "disabled"}.` };
}

export async function resolveAlarm(alarmId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("sla_alarms")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", alarmId);
  if (error) {
    logger.error("[QuickAction] resolveAlarm failed", {
      id: alarmId,
      error: (error as { message: string }).message,
    });
    return { ok: false, message: `Failed: ${(error as { message: string }).message}` };
  }
  logger.info("[QuickAction] SLA alarm resolved", { id: alarmId });
  return { ok: true, message: "SLA alarm resolved." };
}

export async function getPendingIncidents(): Promise<
  { id: string; title: string; status: string }[]
> {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db
    .from("incidents")
    .select("id, title, status")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(5);
  return (data ?? []) as { id: string; title: string; status: string }[];
}
