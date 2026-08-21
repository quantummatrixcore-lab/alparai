import fs from "node:fs";
import path from "node:path";

/**
 * Enforcer-wiring check.
 *
 * Doctrine #047 says every binding rule ships with an executable enforcer. It
 * does not say the enforcer has to run, and measurement on 2026-08-21 found the
 * predictable result: `scripts/check-model-catalog.mjs` — written specifically
 * to stop fabricated model names returning — was referenced by no workflow, no
 * hook and no package script. An enforcer nothing invokes is the same defect as
 * a cron nobody scheduled, applied to the enforcement layer itself.
 *
 * A checker passes if its filename appears in any of:
 *   - .github/workflows/*.yml
 *   - .husky/*
 *   - package.json scripts (directly, or via a script name used in a workflow)
 *
 * Ratcheted through .enforcers-wired-baseline; entries may only be REMOVED.
 */

const ROOT = process.cwd();
const SCRIPTS_DIR = path.join(ROOT, "scripts");
const BASELINE_PATH = path.join(ROOT, ".enforcers-wired-baseline");

function readIfExists(p) {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return "";
  }
}

function collectHaystack() {
  let text = "";
  const wfDir = path.join(ROOT, ".github/workflows");
  if (fs.existsSync(wfDir)) {
    for (const f of fs.readdirSync(wfDir)) text += readIfExists(path.join(wfDir, f));
  }
  const huskyDir = path.join(ROOT, ".husky");
  if (fs.existsSync(huskyDir)) {
    for (const f of fs.readdirSync(huskyDir)) {
      const p = path.join(huskyDir, f);
      if (fs.statSync(p).isFile()) text += readIfExists(p);
    }
  }
  text += readIfExists(path.join(ROOT, "package.json"));
  return text;
}

const haystack = collectHaystack();

const baseline = fs.existsSync(BASELINE_PATH)
  ? new Set(
      fs
        .readFileSync(BASELINE_PATH, "utf-8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    )
  : new Set();

const checkers = fs.existsSync(SCRIPTS_DIR)
  ? fs.readdirSync(SCRIPTS_DIR).filter((f) => /^check-[a-z0-9-]+\.mjs$/.test(f))
  : [];

const unwired = [];
const staleBaseline = [];

for (const file of checkers) {
  const wired = haystack.includes(file);
  if (wired) {
    if (baseline.has(file)) staleBaseline.push(file);
    continue;
  }
  if (baseline.has(file)) continue;
  unwired.push(file);
}

if (unwired.length > 0) {
  console.error(`\nERROR: ${unwired.length} enforcer(s) exist but are invoked by nothing:`);
  for (const f of unwired) console.error(`  - scripts/${f}`);
  console.error(
    "\nWire it into a workflow, a hook, or a package script — or delete it. An enforcer"
  );
  console.error("nobody runs reports nothing while looking like coverage.");
  process.exit(1);
}

console.log(
  `✅ Enforcer-wiring check PASSED. ${checkers.length} checker(s), ${baseline.size} grandfathered.`
);
if (staleBaseline.length > 0) {
  console.log(`\n${staleBaseline.length} baseline entry/entries are now wired and can be removed:`);
  for (const f of staleBaseline) console.log(`  ${f}`);
}
