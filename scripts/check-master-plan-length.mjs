// Guard: docs/MASTER_PLAN.md must stay at or under 400 lines (ZETA-2).
import { readFileSync } from "node:fs";

const LIMIT = 400;
const text = readFileSync(new URL("../docs/MASTER_PLAN.md", import.meta.url), "utf8");
const lines = text.split("\n").length;
console.log(`MASTER_PLAN.md lines: ${lines} (limit ${LIMIT})`);
if (lines > LIMIT) {
  console.error(`FAIL: exceeds ${LIMIT} lines`);
  process.exit(1);
}
console.log("PASS");
