#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, ".repo-language-baseline");

const TURKISH_CHARS = /[ığşçöüİĞŞÇÖÜ]/u;
const MOJIBAKE_CHARS = /â€”|â€“|â€™|â€œ|â€|â€¢|Ã¢|â€/u;

const SCANNED_EXTENSIONS = [".md", ".ts", ".tsx", ".mjs", ".js", ".yml", ".yaml", ".json"];

const PERMANENT_EXEMPTIONS = [
  "messages/",
  "Basın/",
  "docs/ARCHIVE/",
  "docs/MASTER_PLAN_ARCHIVE.md",
  "docs/plan/v12",
  "scripts/check-repo-language.mjs",
  ".repo-language-baseline",
  // Machine-generated dependency inventory: the text comes from upstream
  // package metadata, not from us, and is regenerated on every scan.
  "ops/sbom/",
  // Audit data, not documentation — incident records keep their source
  // language, same rationale as messages/** (Rule 13, "out of scope").
  "docs/ai-audit/",
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
    return { turkish: 0, mojibake: 0 };
  }
  let turkishCount = 0;
  let mojibakeCount = 0;
  for (const line of content.split("\n")) {
    if (TURKISH_CHARS.test(line)) turkishCount += 1;
    if (MOJIBAKE_CHARS.test(line)) mojibakeCount += 1;
  }
  return { turkish: turkishCount, mojibake: mojibakeCount };
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
  const mojibakeOffenders = [];
  for (const path of trackedFiles()) {
    if (!isScanned(path)) continue;
    
    // Mojibake check applies to all scanned files, even if exempt from Turkish check
    const counts = turkishLineCount(path);
    
    // but we skip the checker itself and the doctrine docs which literally describe the mojibake sequences
    if (!path.includes('check-repo-language.mjs') && !path.includes('MASTER_PLAN') && !path.includes('v13.x.md')) {
      if (counts.mojibake > 0) {
        mojibakeOffenders.push({ path, count: counts.mojibake });
      }
    }
    
    if (isExempt(path)) continue;
    if (counts.turkish > 0) {
      offenders.push({ path, count: counts.turkish });
    }
  }
  return {
    turkish: offenders.sort((a, b) => b.count - a.count),
    mojibake: mojibakeOffenders.sort((a, b) => b.count - a.count)
  };
}

if (process.argv.includes("--write-baseline")) {
  const { turkish: offenders } = scan();
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
const { turkish: offenders, mojibake: mojibakeOffenders } = scan();
const unlisted = offenders.filter((o) => !baseline.has(o.path));

let failed = false;

if (mojibakeOffenders.length > 0) {
  console.error("Repo language check FAILED — Mojibake corruption detected.");
  console.error("Rule 10: Files must not contain broken encoding sequences like 'â€'.");
  console.error("");
  for (const { path, count } of mojibakeOffenders) {
    console.error(`  ${path} — ${count} line(s) with mojibake characters`);
  }
  console.error("");
  failed = true;
}

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
  failed = true;
}

if (failed) {
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
