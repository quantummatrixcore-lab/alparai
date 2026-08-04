"use server";

import { runOrchestrator } from "@/lib/ai/discovery/orchestrator";
import { revalidatePath } from "next/cache";

export async function triggerOrchestratorAction() {
  const success = await runOrchestrator();
  if (success) {
    revalidatePath("/[locale]/admin/ai-orchestrator", "page");
  }
  return success;
}
