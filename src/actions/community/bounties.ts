"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireModerator } from "@/lib/auth/session";
import { logger } from "@/lib/utils/logger";
import type { Database } from "@/types/database";

const claimBountySchema = z.object({
  incidentId: z.string().uuid(),
  severityScore: z.number().int().min(0).max(100),
  notes: z.string().max(2000).optional(),
});

const validateBountySchema = z.object({
  bountyId: z.string().uuid(),
  status: z.enum(["validated", "rejected", "paid"]),
  estimatedRewardCents: z.number().int().min(0).optional(),
  actualRewardCents: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

type BountyRow = {
  id: string;
  incident_id: string;
  reporter_id: string;
  provider_id: string | null;
  status: string;
  severity_score: number;
  estimated_reward_cents: number | null;
  actual_reward_cents: number | null;
  badge_awarded: boolean;
  notes: string | null;
  validated_by: string | null;
  validated_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type BountyBadgeWithStats = {
  code: string;
  icon: string;
  name_en: string;
  name_tr: string;
  description_en: string;
  description_tr: string;
  threshold_count: number;
  earned_count: number;
};

export async function claimBounty(
  input: z.infer<typeof claimBountySchema>,
): Promise<{ ok: boolean; error?: string; bountyId?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const parsed = claimBountySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const db = createAdminClient();

  const { data: incident, error: incidentError } = await db
    .from("incidents")
    .select("id, user_id, ai_provider_id, severity, status")
    .eq("id", parsed.data.incidentId)
    .maybeSingle();

  if (incidentError || !incident) {
    return { ok: false, error: "Incident not found" };
  }

  const reporterId = (incident as { user_id: string | null }).user_id;
  if (!reporterId) {
    return { ok: false, error: "Incident has no reporter" };
  }

  const providerId = (incident as { ai_provider_id: string | null }).ai_provider_id;
  const severity = (incident as { severity: string }).severity;
  const status = (incident as { status: string }).status;

  if (status !== "published") {
    return { ok: false, error: "Only published incidents are eligible" };
  }

  const severityToReward: Record<string, number> = {
    low: 5000,
    medium: 15000,
    high: 30000,
    critical: 50000,
  };
  const estimatedReward = severityToReward[severity] ?? 0;

  const { data, error } = await db
    .from("bug_bounties")
    .insert({
      incident_id: parsed.data.incidentId,
      reporter_id: reporterId,
      provider_id: providerId,
      status: "open",
      severity_score: parsed.data.severityScore,
      estimated_reward_cents: estimatedReward,
      notes: parsed.data.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bounty already claimed for this incident" };
    }
    logger.error("claimBounty failed", { incidentId: parsed.data.incidentId }, error as Error);
    return { ok: false, error: "Failed to claim bounty" };
  }

  await db.from("audit_log").insert({
    actor_id: admin.id,
    action: "bounty.claim",
    entity_type: "incident",
    entity_id: parsed.data.incidentId,
    after_data: {
      bounty_id: (data as { id: string }).id,
      severity_score: parsed.data.severityScore,
      estimated_reward_cents: estimatedReward,
    },
  });

  revalidatePath(`/incidents/${parsed.data.incidentId}`);
  revalidatePath("/bounties");
  return { ok: true, bountyId: (data as { id: string }).id };
}

export async function updateBountyStatus(
  input: z.infer<typeof validateBountySchema>,
): Promise<{ ok: boolean; error?: string }> {
  const moderator = await requireModerator();
  if (!moderator) return { ok: false, error: "Forbidden" };

  const parsed = validateBountySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const db = createAdminClient();

  const { data: existing } = await db
    .from("bug_bounties")
    .select("id, reporter_id, incident_id, status, severity_score")
    .eq("id", parsed.data.bountyId)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Bounty not found" };

  const updates: Database["public"]["Tables"]["bug_bounties"]["Update"] = {
    status: parsed.data.status,
    validated_by: moderator.id,
    validated_at: new Date().toISOString(),
  };
  if (parsed.data.estimatedRewardCents !== undefined) {
    updates["estimated_reward_cents"] = parsed.data.estimatedRewardCents;
  }
  if (parsed.data.actualRewardCents !== undefined) {
    updates["actual_reward_cents"] = parsed.data.actualRewardCents;
  }
  if (parsed.data.notes !== undefined) {
    updates["notes"] = parsed.data.notes;
  }
  if (parsed.data.status === "paid") {
    updates["paid_at"] = new Date().toISOString();
  }

  const { error } = await db.from("bug_bounties").update(updates).eq("id", parsed.data.bountyId);

  if (error) {
    logger.error("updateBountyStatus failed", { bountyId: parsed.data.bountyId }, error as Error);
    return { ok: false, error: "Failed to update bounty" };
  }

  if (parsed.data.status === "validated" || parsed.data.status === "paid") {
    const ex = existing as unknown as BountyRow;
    const incRes = await db
      .from("incidents")
      .select("severity")
      .eq("id", ex.incident_id)
      .maybeSingle();
    const incidentSeverity = (incRes.data as { severity: string } | null)?.severity ?? "medium";
    await awardBadgesForBounty(db, {
      reporterId: ex.reporter_id,
      severityScore: ex.severity_score,
      severity: incidentSeverity,
    });
  }

  await db.from("audit_log").insert({
    actor_id: moderator.id,
    action: `bounty.${parsed.data.status}`,
    entity_type: "bounty",
    entity_id: parsed.data.bountyId,
    before_data: { status: (existing as unknown as BountyRow).status },
    after_data: { status: parsed.data.status, ...updates },
  });

  revalidatePath("/bounties");
  revalidatePath("/admin");
  return { ok: true };
}

async function awardBadgesForBounty(
  db: ReturnType<typeof createAdminClient>,
  info: { reporterId: string; severityScore: number; severity: string },
): Promise<void> {
  const { count: validatedCount } = await db
    .from("bug_bounties")
    .select("*", { count: "exact", head: true })
    .eq("reporter_id", info.reporterId)
    .in("status", ["validated", "paid"]);

  const total = validatedCount ?? 0;
  const badgesToAward: string[] = [];

  if (total >= 1) badgesToAward.push("bug_hunter_first");
  if (total >= 5) badgesToAward.push("bug_hunter_bronze");
  if (total >= 25) badgesToAward.push("bug_hunter_silver");
  if (total >= 100) badgesToAward.push("bug_hunter_gold");
  if (info.severity === "critical") badgesToAward.push("ethics_advocate");

  for (const code of badgesToAward) {
    await db.from("user_bounty_badges").upsert(
      {
        user_id: info.reporterId,
        badge_code: code,
        awarded_at: new Date().toISOString(),
      },
      { onConflict: "user_id,badge_code" },
    );
  }

  if (badgesToAward.length > 0) {
    await db
      .from("bug_bounties")
      .update({ badge_awarded: true })
      .eq("reporter_id", info.reporterId)
      .in("status", ["validated", "paid"]);
  }
}

export async function getBountyBadgesStats(): Promise<BountyBadgeWithStats[]> {
  const db = createAdminClient();
  const { data: badges } = await db
    .from("bounty_badges")
    .select("*")
    .order("threshold_count", { ascending: true });

  if (!badges) return [];

  // Get counts of how many users earned each badge
  const { data: userBadges } = await db.from("user_bounty_badges").select("badge_code");

  const earnedCounts: Record<string, number> = {};
  if (userBadges) {
    for (const ub of userBadges) {
      earnedCounts[ub.badge_code] = (earnedCounts[ub.badge_code] || 0) + 1;
    }
  }

  return badges.map((b) => ({
    code: b.code,
    icon: b.icon,
    name_en: b.name_en,
    name_tr: b.name_tr,
    description_en: b.description_en,
    description_tr: b.description_tr,
    threshold_count: b.threshold_count,
    earned_count: earnedCounts[b.code] || 0,
  }));
}
