import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

/**
 * Baseline-ratchet check.
 *
 * Every baseline file in this repository carries the same promise in its own
 * header: entries may only be REMOVED. That promise had no enforcement, and on
 * 2026-08-21 `.repo-language-baseline` went from 195 entries to 385 — a red gate
 * turned green by granting 211 new exemptions rather than by fixing 211 files.
 *
 * A baseline that can grow is not a ratchet, it is a waiver form. This check
 * compares each baseline against its previous committed version and fails on any
 * added entry.
 *
 * Deliberately narrow: it does not judge whether an exemption is reasonable. It
 * only enforces the direction of travel, which is the property the baselines
 * were introduced to have.
 */

const BASELINE_RE = /^\.[a-z0-9-]+-baseline$/;

function previousVersion(file) {
  for (const ref of ["origin/master", "HEAD~1", "HEAD"]) {
    try {
      return execFileSync("git", ["show", `${ref}:${file}`], {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      // ref missing, file absent at that ref, or not a git checkout — try the next
    }
  }
  return null;
}

function entries(text) {
  return new Set(
    text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
  );
}

const files = readdirSync(process.cwd()).filter((f) => BASELINE_RE.test(f) && existsSync(f));

let failed = false;
let checked = 0;

for (const file of files) {
  const before = previousVersion(file);
  if (before === null) {
    console.log(`  ${file}: new file, nothing to compare`);
    continue;
  }
  const oldSet = entries(before);
  const newSet = entries(readFileSync(file, "utf-8"));
  const added = [...newSet].filter((e) => !oldSet.has(e));
  const removed = [...oldSet].filter((e) => !newSet.has(e));
  checked += 1;

  if (added.length > 0) {
    console.error(
      `\nERROR: ${file} gained ${added.length} entry/entries. A baseline may only shrink.`
    );
    for (const e of added.slice(0, 15)) console.error(`  + ${e}`);
    if (added.length > 15) console.error(`  … and ${added.length - 15} more`);
    console.error(
      "\nFix the files instead of exempting them. If an exemption is genuinely correct,"
    );
    console.error("it belongs in the check's permanent exemption list, not in the baseline.");
    failed = true;
  } else if (removed.length > 0) {
    console.log(`  ${file}: −${removed.length} (good)`);
  } else {
    console.log(`  ${file}: unchanged`);
  }
}

if (failed) {
  console.error("\n❌ Baseline ratchet check FAILED.");
  process.exit(1);
}

console.log(`✅ Baseline ratchet check PASSED. ${checked} baseline(s) compared, none grew.`);
