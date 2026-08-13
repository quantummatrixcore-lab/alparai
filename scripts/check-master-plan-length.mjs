#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER_PLAN_PATH = process.env.NEGATIVE_TEST_MODE ? path.resolve(__dirname, ".mock-master-plan-length") : path.resolve(__dirname, "../docs/MASTER_PLAN.md");
const MAX_LINES = 600;

try {
  if (!fs.existsSync(MASTER_PLAN_PATH)) {
    console.error(`[ZETA-2 FAIL] File not found: ${MASTER_PLAN_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(MASTER_PLAN_PATH, "utf-8");
  const lineCount = content.split("\n").length;

  console.log(`[ZETA-2] MASTER_PLAN.md line count: ${lineCount} (limit: ${MAX_LINES})`);

  if (lineCount > MAX_LINES) {
    console.error(
      `[ZETA-2 FAIL] MASTER_PLAN.md has ${lineCount} lines, which exceeds the ${MAX_LINES}-line limit (Task #209 / ZETA-2)!`
    );
    process.exit(1);
  }

  console.log("[ZETA-2 PASS] MASTER_PLAN.md length check passed.");
  process.exit(0);
} catch (error) {
  console.error(`[ZETA-2 ERROR] Failed to check MASTER_PLAN.md length: ${error.message}`);
  process.exit(1);
}
