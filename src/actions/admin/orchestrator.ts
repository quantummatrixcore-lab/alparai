"use server";

import { runOrchestrator } from "@/lib/ai/discovery/orchestrator";
import { revalidatePath } from "next/cache";

export async function triggerOrchestratorAction() {
  try {
    const success = await runOrchestrator();
    if (success) {
      revalidatePath("/[locale]/admin/ai-hub/orchestrator", "page");
    }
    return success;
  } catch (err) {
    console.error("[triggerOrchestratorAction] Error:", err);
    throw err;
  }
}
