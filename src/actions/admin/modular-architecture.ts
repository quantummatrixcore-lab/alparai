"use server";

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
  return {
    umbrellaTitle: "AlparAI = AI Trust Infrastructure",
    tagline: "Single Umbrella Platform Architecture for Independent AI Accountability",
    auditScore: GPT_360_AUDIT_SCORE,
    pillars: MODULAR_PILLARS,
  };
}
