import "server-only";
import fs from "node:fs";
import path from "node:path";
import { logger } from "@/lib/utils/logger";
import {
  parseMasterPlanContent,
  type MasterPlanParseResult,
  type PlanItem,
  type MasterPlanParseError,
} from "@/lib/utils/markdown-parser";

export { type MasterPlanParseResult, type PlanItem, type MasterPlanParseError };

/**
 * Server-only utility to read and parse docs/MASTER_PLAN.md from filesystem.
 */
export function parseMasterPlan(customFilePath?: string): MasterPlanParseResult {
  try {
    const filePath = customFilePath || path.join(process.cwd(), "docs", "MASTER_PLAN.md");
    const content = fs.readFileSync(filePath, "utf-8");
    const result = parseMasterPlanContent(content);

    if (result.error === "markers") {
      logger.error("parseMasterPlan: FOUNDER_BACKLOG markers not found — returning empty list");
    }

    return result;
  } catch (error) {
    logger.error(
      "Error reading MASTER_PLAN.md",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { items: [], error: "read" };
  }
}
