import fs from "node:fs";
import path from "node:path";

/**
 * Spec-drift check.
 *
 * A specification that is neither on the board nor formally closed is work
 * nobody can act on and nobody can verify was done. Measured 2026-08-21: 57 of
 * 106 item files were in that state — written, then dropped, with no record of
 * whether the work happened.
 *
 * A file passes if either:
 *   - its ID appears in docs/MASTER_PLAN.md (a row, or a reference in an entry), or
 *   - it carries a "## Closed" section.
 *
 * Ratcheted through .spec-drift-baseline, same shape as the other checks here:
 * entries may only be REMOVED, as each orphan is re-linked, closed, or deleted.
 */

const ROOT = process.cwd();
const ITEMS_DIR = process.env.NEGATIVE_TEST_MODE
  ? path.join(ROOT, ".mock-items")
  : path.join(ROOT, "docs/plan/items");
const PLAN_PATH = process.env.NEGATIVE_TEST_MODE
  ? path.join(ROOT, ".mock-spec-plan")
  : path.join(ROOT, "docs/MASTER_PLAN.md");
const BASELINE_PATH = path.join(ROOT, ".spec-drift-baseline");

if (!fs.existsSync(ITEMS_DIR) || !fs.existsSync(PLAN_PATH)) {
  console.error("ERROR: items directory or plan file not found.");
  process.exit(1);
}

const plan = fs.readFileSync(PLAN_PATH, "utf-8");

const baseline = fs.existsSync(BASELINE_PATH)
  ? new Set(
      fs
        .readFileSync(BASELINE_PATH, "utf-8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    )
  : new Set();

const orphans = [];
const staleBaseline = [];

for (const file of fs.readdirSync(ITEMS_DIR).filter((f) => f.endsWith(".md"))) {
  const id = file.replace(/\.md$/, "");
  const body = fs.readFileSync(path.join(ITEMS_DIR, file), "utf-8");
  const onBoard = plan.includes(id);
  const closed = /^##\s+Closed/m.test(body);

  if (onBoard || closed) {
    if (baseline.has(id)) staleBaseline.push(id);
    continue;
  }
  if (baseline.has(id)) continue;
  orphans.push(id);
}

if (orphans.length > 0) {
  console.error(
    `\nERROR: ${orphans.length} specification(s) are neither referenced in the plan nor closed:`
  );
  for (const id of orphans) console.error(`  - docs/plan/items/${id}.md`);
  console.error(
    "\nEither link it from docs/MASTER_PLAN.md, add a '## Closed' section recording what happened,"
  );
  console.error("or delete it. Do NOT add it to .spec-drift-baseline — that list only shrinks.");
  process.exit(1);
}

console.log(
  `✅ Spec-drift check PASSED. ${baseline.size} grandfathered; no new orphaned specification.`
);
if (staleBaseline.length > 0) {
  console.log(
    `\n${staleBaseline.length} baseline entry/entries are now resolved and can be removed:`
  );
  for (const id of staleBaseline.slice(0, 10)) console.log(`  ${id}`);
}
