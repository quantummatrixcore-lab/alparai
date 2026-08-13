#!/usr/bin/env node
/**
 * Fabricated metric check (Doctrine #011: "no invented numbers").
 *
 * Admin pages exist to tell the operator the truth about the system. A metric
 * rendered as a hardcoded literal — "92.4%", "12 ms", "$0", "24/24 Active" —
 * looks exactly like a measured value and is indistinguishable from one on
 * screen. Every metric must come from a data source, or say so honestly
 * ("not measured" / "—").
 *
 * Only JSX *text nodes* are inspected, so class names, ids and props are not
 * flagged. Values interpolated from code ({stats.latency}) are by definition
 * not literals and never match.
 *
 * This is a RATCHET, same shape as .repo-language-baseline: today's literals
 * are grandfathered in .admin-metrics-baseline so adopting the rule does not
 * turn CI red on day one. Entries may only be REMOVED.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, ".admin-metrics-baseline");

const SCANNED_PREFIXES = ["src/app/[locale]/admin", "src/components/admin"];
const SCANNED_EXTENSIONS = [".tsx"];

// A JSX text node: the run of characters between > and < that contains no
// braces (braces mean the value is interpolated from code, which is fine).
const TEXT_NODE = />([^<>{}]+)</g;

const METRIC_PATTERNS = [
  { name: "currency", re: /\$\s?\d[\d,]*(?:\.\d+)?/ },
  { name: "percentage", re: /\b\d+(?:\.\d+)?\s?%/ },
  { name: "latency", re: /\b\d+(?:\.\d+)?\s?(?:ms|s)\b(?!\w)/ },
  { name: "ratio", re: /\b\d+\s?\/\s?\d+\b/ },
];

function trackedFiles() {
  const list = execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
  if (process.env.NEGATIVE_TEST_MODE) list.push("src/app/[locale]/admin/.mock-negative-test.tsx");
  return list;
}

function isScanned(path) {
  return (
    SCANNED_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
    SCANNED_EXTENSIONS.some((ext) => path.endsWith(ext))
  );
}

function scan() {
  const offenders = [];
  for (const path of trackedFiles()) {
    if (!isScanned(path)) continue;
    let content;
    try {
      content = readFileSync(join(ROOT, path), "utf8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      TEXT_NODE.lastIndex = 0;
      let match;
      while ((match = TEXT_NODE.exec(lines[i])) !== null) {
        const text = match[1].trim();
        if (!text) continue;
        for (const { name, re } of METRIC_PATTERNS) {
          if (re.test(text)) {
            offenders.push({ path, line: i + 1, kind: name, text });
            break;
          }
        }
      }
    }
  }
  return offenders;
}

function keyOf({ path, text }) {
  return `${path}::${text}`;
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

const offenders = scan();

if (process.argv.includes("--write-baseline")) {
  const header = [
    "# Admin fabricated-metric baseline — Doctrine #011 (no invented numbers).",
    "# Each entry is a hardcoded metric literal rendered in an admin JSX text node.",
    "# Format: <file>::<literal text>",
    "# This list is a RATCHET: entries may be removed once the value is bound to a",
    "# real data source (or replaced with an honest 'not measured'), and must never",
    "# be added. A newly hardcoded metric fails CI.",
    "",
  ].join("\n");
  const unique = [...new Set(offenders.map(keyOf))].sort();
  process.stdout.write(header + unique.join("\n") + "\n");
  process.exit(0);
}

const baseline = loadBaseline();
const unlisted = offenders.filter((o) => !baseline.has(keyOf(o)));

if (unlisted.length > 0) {
  console.error("Admin metric check FAILED — hardcoded numbers rendered as measurements.");
  console.error("Doctrine #011: every figure must cite a data source, or say 'not measured'.");
  console.error("");
  for (const { path, line, kind, text } of unlisted) {
    console.error(`  ${path}:${line} [${kind}] ${JSON.stringify(text)}`);
  }
  console.error("");
  console.error("Bind the value to a query, or render an honest empty state.");
  console.error("Do NOT add it to .admin-metrics-baseline — that list only shrinks.");
  process.exit(1);
}

const present = new Set(offenders.map(keyOf));
const stale = [...baseline].filter((key) => !present.has(key));

console.log(
  `Admin metric check passed. ${present.size} hardcoded metric(s) still grandfathered.`,
);
if (stale.length > 0) {
  console.log("");
  console.log(`${stale.length} baseline entry/entries are now clean and can be removed:`);
  for (const key of stale.slice(0, 20)) console.log(`  ${key}`);
}
