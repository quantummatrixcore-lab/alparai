"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { EcosystemScout } from "@/lib/agent-os/scouts/ecosystem-scout";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function fetchLatestIntel() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_ecosystem_intel" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    logger.error("Failed to fetch intel", { error });
    return [];
  }

  return data;
}

export async function triggerManualScout() {
  await requireAdmin();
  try {
    const newReports = await EcosystemScout.runAllScouts();
    revalidatePath("/admin/agent-os");
    return { ok: true, count: newReports.length };
  } catch (err: any) {
    logger.error("Manual scout trigger failed", { error: err.message });
    return { ok: false, error: err.message };
  }
}

export async function markIntelActioned(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("agent_ecosystem_intel" as any)
    .update({ is_actioned: true })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/agent-os");
  return { ok: true };
}
