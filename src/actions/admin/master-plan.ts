"use server";

import { requireAdmin } from "@/lib/auth/session";
import { parseMasterPlan } from "@/lib/server/master-plan";
import type { MasterPlanParseResult } from "@/lib/utils/markdown-parser";

/**
 * Server Action for client components to securely fetch parsed master plan items.
 */
export async function getMasterPlanAction(): Promise<MasterPlanParseResult> {
  await requireAdmin();
  return parseMasterPlan();
}
