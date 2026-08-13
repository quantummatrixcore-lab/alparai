#!/usr/bin/env node
/**
 * Closure-evidence check (G-7).
 *
 * A backlog row may only be marked complete with a citation a reviewer can
 * actually follow: `closed-by:<sha>@<branch>`. The <sha> must be a real commit
 * in this repository.
 *
 * This exists because the rule was stated three separate times and broken three
 * separate ways: first `closed-by:latest@master`, then a clean spell, then
 * `closed-by:Antigravity@master` — an agent name where a commit hash belongs.
 * Each time the row looked closed and the evidence led nowhere. Doctrine #047
 * says a binding rule ships with an executable enforcer, so here it is.
 *
 * Deliberately narrow: it checks that citations resolve, not that the work is
 * done. Judging the work is the reviewer's job; this only guarantees the
 * reviewer can find what to judge.
 *
 * Legacy citations are grandfathered in .closure-evidence-baseline, same ratchet
 * shape as the other checks in this directory: entries may only be REMOVED.
 *
 * Known limitation, stated rather than hidden: the baseline is keyed by the
 * citation string, so the grandfathered `closed-by:latest@master` entries —
 * which are prose quotations of past violations, not real closures — would
 * also absorb a genuine future reuse of that exact string. Anything else
 * malformed (an agent name, a branch, a typo) still fails, which is the case
 * this was built for. Narrowing the key would mean encoding line numbers, and
 * those move every time the plan is edited.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PLAN_PATH = process.env.NEGATIVE_TEST_MODE ? join(ROOT, ".mock-closure-evidence") : join(ROOT, "docs/MASTER_PLAN.md");
const BASELINE_PATH = join(ROOT, ".closure-evidence-baseline");

const CLOSED_BY = /closed-by:([^@\s]+)@([^\s"'|)]+)/g;

// Citations that intentionally do not name a commit.
const SENTINELS = new Set(["legacy", "environment", "verified", "pending-push"]);

function isRealCommit(sha) {
  if (!/^[0-9a-f]{7,40}$/i.test(sha)) return false;
  try {
    const type = execFileSync("git", ["cat-file", "-t", sha], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return type === "commit";
  } catch {
    return false;
  }
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return new Set();
  return new Set(
    readFileSync(BASELINE_PATH, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#")),
  );
}

function scan() {
  const content = readFileSync(PLAN_PATH, "utf8");
  const lines = content.split("\n");
  const offenders = [];
  for (let i = 0; i < lines.length; i += 1) {
    CLOSED_BY.lastIndex = 0;
    let m;
    while ((m = CLOSED_BY.exec(lines[i])) !== null) {
      const [, ref, branch] = m;
      // `closed-by:<sha>@<branch>` appears in the doctrine text that defines
      // the rule; a placeholder is not a citation.
      if (ref.includes("<") || ref.includes(">")) continue;
      if (SENTINELS.has(ref.toLowerCase())) continue;
      if (isRealCommit(ref)) continue;
      offenders.push({ line: i + 1, ref, branch, cite: `closed-by:${ref}@${branch}` });
    }
  }
  return offenders;
}

// A row can also fail by citing nothing at all. The first version of this check
// only validated citations that existed, so a row closed with a bare
// "completed" sailed through — a gap found the day after shipping, twice over.
// Keyed by row id rather than line number, because line numbers move on every
// edit while the id (BH, ZETA-0a, SHOW-1) is stable.
const COMPLETED = /(✅\s*(completed|pushed)|\|\s*completed\s*\|)/;
const ROW_ID = /\*\*\[?([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*)\]?/;

function scanMissing() {
  const lines = readFileSync(PLAN_PATH, "utf8").split("\n");
  const offenders = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // Only table rows close work. Prose may mention "completed" in passing.
    if (!line.startsWith("|")) continue;
    if (!COMPLETED.test(line)) continue;
    if (line.includes("closed-by:")) continue;
    const idMatch = line.match(ROW_ID);
    // Older rows predate the **ID** convention; key those by a slug of their
    // task text. Line numbers would move on every edit and silently
    // un-grandfather them, which is the opposite of a ratchet.
    const cells = line.split("|").map((c) => c.trim());
    const slug = (cells.find((c) => c.length > 12) || `line-${i + 1}`)
      .replace(/[`*]/g, "")
      .slice(0, 48)
      .trim();
    const id = idMatch ? idMatch[1] : slug;
    offenders.push({ line: i + 1, id });
  }
  return offenders;
}

const offenders = scan();
const missing = scanMissing();

if (process.argv.includes("--write-baseline")) {
  const header = [
    "# Closure-evidence baseline — G-7 (`closed-by:<sha>@<branch>`).",
    "# Each entry is a citation that does not resolve to a commit in this repo.",
    "# Format: <citation>",
    "# RATCHET: entries may be removed once a citation is corrected to a real",
    "# SHA, and must never be added. A new unresolvable citation fails CI.",
    "",
  ].join("\n");
  const unique = [
    ...new Set([...offenders.map((o) => o.cite), ...missing.map((o) => `missing:${o.id}`)]),
  ].sort();
  process.stdout.write(header + unique.join("\n") + "\n");
  process.exit(0);
}

const baseline = loadBaseline();
const unlisted = offenders.filter((o) => !baseline.has(o.cite));

if (unlisted.length > 0) {
  console.error("Closure-evidence check FAILED — citations that lead nowhere.");
  console.error("G-7: a closed row must cite closed-by:<sha>@<branch> with a real commit.");
  console.error("");
  for (const { line, ref, cite } of unlisted) {
    console.error(`  docs/MASTER_PLAN.md:${line}  ${cite}`);
    console.error(`      "${ref}" is not a commit in this repository.`);
  }
  console.error("");
  console.error("Use the actual commit hash that did the work (git log --oneline).");
  console.error("Do NOT add it to .closure-evidence-baseline — that list only shrinks.");
  process.exit(1);
}

const missingUnlisted = missing.filter((o) => !baseline.has(`missing:${o.id}`));
if (missingUnlisted.length > 0) {
  console.error("Closure-evidence check FAILED — rows marked complete with no citation.");
  console.error("G-7: marking a row complete requires closed-by:<sha>@<branch>.");
  console.error("");
  for (const { line, id } of missingUnlisted) {
    console.error(`  docs/MASTER_PLAN.md:${line}  [${id}] marked complete, no closed-by:`);
  }
  console.error("");
  console.error("Add the commit that did the work, or reopen the row.");
  process.exit(1);
}

const present = new Set([
  ...offenders.map((o) => o.cite),
  ...missing.map((o) => `missing:${o.id}`),
]);
const stale = [...baseline].filter((c) => !present.has(c));

console.log(`Closure-evidence check passed. ${present.size} legacy citation(s) still grandfathered.`);
if (stale.length > 0) {
  console.log("");
  console.log(`${stale.length} baseline entry/entries are now clean and can be removed:`);
  for (const c of stale.slice(0, 20)) console.log(`  ${c}`);
}
