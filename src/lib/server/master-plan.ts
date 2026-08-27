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
    const baseDir = path.join(process.cwd(), "docs");
    const targetPath = customFilePath
      ? path.resolve(baseDir, customFilePath)
      : path.join(baseDir, "MASTER_PLAN.md");

    // Mantıksal kilit: Çözümlenen yol, baseDir ile başlamak ZORUNDADIR. (Path Traversal Koruması)
    if (!targetPath.startsWith(baseDir)) {
      logger.error(`SECURITY_VIOLATION: Path traversal attempt blocked for path: ${targetPath}`);
      return { items: [], error: "read" };
    }

    // Sadece izin verilen dosya uzantılarına (.md) izin ver
    if (!targetPath.endsWith(".md")) {
      logger.error(`SECURITY_VIOLATION: Invalid file type attempt for path: ${targetPath}`);
      return { items: [], error: "read" };
    }

    const content = fs.readFileSync(targetPath, "utf-8");
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
