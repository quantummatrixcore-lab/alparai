"use server";

import { requireAdmin } from "@/lib/auth/session";
import {
  MODULAR_PILLARS,
  GPT_360_AUDIT_SCORE,
  type ProductPillar,
  type GptAuditScore,
} from "@/lib/config/modular-architecture";

export interface ModularArchitectureOverview {
  umbrellaTitle: string;
  tagline: string;
  auditScore: GptAuditScore;
  pillars: ProductPillar[];
}

export async function getModularArchitectureAction(): Promise<ModularArchitectureOverview> {
  await requireAdmin();
  try {
    return {
      umbrellaTitle: "AlparAI = AI Trust Infrastructure",
      tagline: "Single Umbrella Platform Architecture for Independent AI Accountability",
      auditScore: GPT_360_AUDIT_SCORE,
      pillars: MODULAR_PILLARS,
    };
  } catch (err) {
    console.error("[getModularArchitectureAction] Error:", err);
    throw err;
  }
}
