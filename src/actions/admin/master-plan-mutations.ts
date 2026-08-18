"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";

export async function updatePlanItemStatus(itemId: string, newStatus: "completed" | "pending" | "paused") {
  await requireAdmin();
  
  const targetPath = path.join(process.cwd(), "docs", "MASTER_PLAN.md");
  if (!fs.existsSync(targetPath)) {
    throw new Error("MASTER_PLAN.md not found");
  }

  let content = fs.readFileSync(targetPath, "utf-8");
  
  const lines = content.split("\n");
  let modified = false;

  const statusMap = {
    completed: "✅ completed",
    pending: "⏳ pending",
    paused: "⏸ paused"
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && line.trim().startsWith("|") && line.includes("| " + itemId + " |")) {
      const parts = line.split("|");
      if (parts.length >= 6) {
        parts[5] = " " + statusMap[newStatus] + " ";
        lines[i] = parts.join("|");
        modified = true;
        break;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(targetPath, lines.join("\n"));
    revalidatePath("/[locale]/admin/strategy/master-plan", "page");
    return { success: true };
  } else {
    throw new Error("Item " + itemId + " not found in MASTER_PLAN.md");
  }
}
