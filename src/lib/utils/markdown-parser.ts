import fs from "fs";
import path from "path";
import { logger } from "@/lib/utils/logger";

export interface PlanItem {
  id: string;
  priority: string;
  title: string;
  status: "completed" | "pending" | "paused";
  commitHash?: string;
  description?: string;
  owner?: string;
  dependsOn?: string[];
  depends?: number[];
  blocks?: string[];
  closedBy?: { sha: string; branch: string };
}

export type MasterPlanParseError = "read" | "markers";

export interface MasterPlanParseResult {
  items: PlanItem[];
  error: MasterPlanParseError | null;
}

const BACKLOG_START = "<!-- FOUNDER_BACKLOG_START -->";
const BACKLOG_END = "<!-- FOUNDER_BACKLOG_END -->";

function cleanMarkdown(value: string): string {
  return value
    .replace(/<[^>]*>?/gm, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMasterPlan(): MasterPlanParseResult {
  try {
    const filePath = path.join(process.cwd(), "docs", "MASTER_PLAN.md");
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const startIdx = lines.findIndex((l) => l.includes(BACKLOG_START));
    const endIdx = lines.findIndex((l) => l.includes(BACKLOG_END));

    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      logger.error("parseMasterPlan: FOUNDER_BACKLOG markers not found — returning empty list");
      return { items: [], error: "markers" };
    }

    const backlogLines = lines.slice(startIdx + 1, endIdx);
    const items: PlanItem[] = [];

    for (const line of backlogLines) {
      if (!line.trim().startsWith("|") || line.includes("---") || line.includes("Item ID")) {
        continue;
      }

      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 6) continue;

      const id = parts[1];
      const priority = parts[2] || "";
      const rawTitle = parts[3] || "";
      const rawDescription = parts[4] || "";
      const statusRaw = parts[5] || "";

      if (!id || !/^\d+$/.test(id)) continue;

      const cleanTitle = cleanMarkdown(rawTitle);

      let owner: string | undefined;
      const ownerMatch = rawTitle.match(/^\[(\w+)\]/);
      if (ownerMatch) {
        owner = ownerMatch[1];
      }

      let status: "completed" | "pending" | "paused" = "pending";
      const sLower = statusRaw.toLowerCase();
      if (
        statusRaw.includes("✅") ||
        statusRaw.includes("✓") ||
        sLower.includes("completed") ||
        sLower.includes("tamamlandı") ||
        sLower.includes("closed")
      ) {
        status = "completed";
      } else if (statusRaw.includes("⏸") || sLower.includes("paused")) {
        status = "paused";
      }

      const description = cleanMarkdown(rawDescription);

      const dependsNumbers: number[] = [];
      const dependsOnStrings: string[] = [];

      const dependsRegexNew = /Depends:\s*#(\d+(?:\s*,\s*#\d+)*)/gi;
      let dMatchNew;
      while ((dMatchNew = dependsRegexNew.exec(rawDescription)) !== null) {
        if (dMatchNew[1]) {
          const nums = dMatchNew[1].match(/\d+/g);
          if (nums) {
            nums.forEach((n) => {
              const num = parseInt(n, 10);
              if (!isNaN(num)) {
                if (!dependsNumbers.includes(num)) dependsNumbers.push(num);
                if (!dependsOnStrings.includes(n)) dependsOnStrings.push(n);
              }
            });
          }
        }
      }

      const dependsRegexOld = /depends:#(\d+)/gi;
      let dMatchOld;
      while ((dMatchOld = dependsRegexOld.exec(rawDescription)) !== null) {
        if (dMatchOld[1]) {
          const num = parseInt(dMatchOld[1], 10);
          if (!isNaN(num)) {
            if (!dependsNumbers.includes(num)) dependsNumbers.push(num);
            if (!dependsOnStrings.includes(dMatchOld[1])) dependsOnStrings.push(dMatchOld[1]);
          }
        }
      }

      const blocks: string[] = [];
      const blocksRegex = /blocks:#(\d+)/g;
      let bMatch;
      while ((bMatch = blocksRegex.exec(rawDescription)) !== null) {
        if (bMatch[1]) blocks.push(bMatch[1]);
      }

      let closedBy: { sha: string; branch: string } | undefined;
      const closedMatch = rawDescription.match(/closed-by:([a-f0-9]+|legacy)@([a-zA-Z0-9_\-\/]+)/i);
      if (closedMatch && closedMatch[1] && closedMatch[2]) {
        closedBy = { sha: closedMatch[1], branch: closedMatch[2] };
      }

      items.push({
        id,
        priority,
        title: cleanTitle || "",
        status,
        owner,
        description: description || undefined,
        dependsOn: dependsOnStrings.length > 0 ? dependsOnStrings : undefined,
        depends: dependsNumbers.length > 0 ? dependsNumbers : undefined,
        blocks: blocks.length > 0 ? blocks : undefined,
        closedBy,
      });
    }

    return { items, error: null };
  } catch (error) {
    logger.error(
      "Error reading MASTER_PLAN.md",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { items: [], error: "read" };
  }
}
