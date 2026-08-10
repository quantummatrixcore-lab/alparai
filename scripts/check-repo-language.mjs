#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, ".repo-language-baseline");

const TURKISH_CHARS = /[ığşçöüİĞŞÇÖÜ]/u;

const SCANNED_EXTENSIONS = [".md", ".ts", ".tsx", ".mjs", ".js", ".yml", ".yaml"];

const PERMANENT_EXEMPTIONS = [
  "messages/",
  "Basın/",
  "docs/ARCHIVE/",
  "docs/MASTER_PLAN_ARCHIVE.md",
  "docs/plan/v12",
  "scripts/check-repo-language.mjs",
  ".repo-language-baseline",
];

function isExempt(path) {
  return PERMANENT_EXEMPTIONS.some((prefix) => path.startsWith(prefix));
}

function isScanned(path) {
  return SCANNED_EXTENSIONS.some((ext) => path.endsWith(ext));
}

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split("\0")
    .filter(Boolean);
}

function turkishLineCount(path) {
  let content;
  try {
    content = readFileSync(join(ROOT, path), "utf8");
  } catch {
    return 0;
  }
  let count = 0;
  for (const line of content.split("\n")) {
    if (TURKISH_CHARS.test(line)) count += 1;
  }
  return count;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return new Set();
  return new Set(
    readFileSync(BASELINE_PATH, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")),
  );
}

function scan() {
  const offenders = [];
  for (const path of trackedFiles()) {
    if (!isScanned(path) || isExempt(path)) continue;
    const count = turkishLineCount(path);
    if (count > 0) offenders.push({ path, count });
  }
  return offenders.sort((a, b) => b.count - a.count);
}

if (process.argv.includes("--write-baseline")) {
  const offenders = scan();
  const header = [
    "# Repo language baseline — English-only policy (Rule 13).",
    "# Files listed here still contain Turkish text and are grandfathered.",
    "# This list is a RATCHET: entries may be removed once a file is translated,",
    "# and must never be added. A new file with Turkish text fails CI.",
    "# Permanently exempt (not listed): messages/**, Basın/**, docs/ARCHIVE/**,",
    "# docs/MASTER_PLAN_ARCHIVE.md, docs/plan/v12*.",
    "",
  ].join("\n");
  process.stdout.write(header + offenders.map((o) => o.path).join("\n") + "\n");
  process.exit(0);
}

const baseline = loadBaseline();
const offenders = scan();
const unlisted = offenders.filter((o) => !baseline.has(o.path));

if (unlisted.length > 0) {
  console.error("Repo language check FAILED — Turkish text in files not covered by the baseline.");
  console.error("Rule 13: everything committed to this repository is written in English.");
  console.error("");
  for (const { path, count } of unlisted) {
    console.error(`  ${path} — ${count} line(s) with Turkish characters`);
  }
  console.error("");
  console.error("Translate the file, or if it is product content, add it to PERMANENT_EXEMPTIONS.");
  console.error("Do NOT add it to .repo-language-baseline — that list only shrinks.");
  process.exit(1);
}

const stale = [...baseline].filter((path) => !offenders.some((o) => o.path === path));
const remaining = offenders.length;

console.log(
  `Repo language check passed. ${remaining} file(s) still grandfathered by the baseline.`,
);
if (stale.length > 0) {
  console.log("");
  console.log(`${stale.length} baseline entry/entries are now clean and can be removed:`);
  for (const path of stale.slice(0, 20)) console.log(`  ${path}`);
}
