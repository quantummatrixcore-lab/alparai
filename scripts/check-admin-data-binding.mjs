#!/usr/bin/env node
/**
 * Admin data-binding check (Doctrine G-9: "installation is not acceptance").
 *
 * An admin page that renders only static markup looks finished and measures
 * nothing. This check requires every admin route to either reach a real data
 * source, or be explicitly grandfathered as a known shell.
 *
 * Evidence is collected from the page itself AND from the local modules it
 * imports one level deep, because the house pattern is a thin server page that
 * renders a *-client.tsx doing the work. Checking the page alone would flag
 * those as shells incorrectly.
 *
 * This is a RATCHET: today's shells live in .admin-shell-baseline. Entries may
 * only be REMOVED as pages are wired up; a new shell fails CI.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, ".admin-shell-baseline");
const ADMIN_ROOT = "src/app/[locale]/admin";

// Any one of these means the page reaches something real. Deliberately narrow:
// auth helpers and redirects touch the database too, but a page that only
// checks who you are still shows you nothing.
const DATA_SIGNALS = [
  /\.from\s*\(\s*["'`]/, // supabase .from("table")
  /from\s+["']@\/actions\//, // imports a server action
  /\bfetch\s*\(\s*["'`\/]/, // fetches a real URL
];

// Only presentational children are followed. The house pattern is a thin
// server page rendering a *-client.tsx that does the querying; anything else
// (auth session helpers, design-kit primitives) is not evidence.
const FOLLOWABLE_IMPORT = /from\s+["'](@\/components\/admin\/[^"']+|\.\/[^"']+)["']/g;

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
}

function readSafe(path) {
  try {
    return readFileSync(join(ROOT, path), "utf8");
  } catch {
    return "";
  }
}

function resolveImport(specifier, fromFile) {
  const base = specifier.startsWith("@/")
    ? join("src", specifier.slice(2))
    : resolve(dirname(fromFile), specifier).slice(ROOT.length + 1) ||
      join(dirname(fromFile), specifier);
  for (const candidate of [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx")]) {
    if (existsSync(join(ROOT, candidate))) return candidate;
  }
  return null;
}

// A page whose whole job is to redirect renders no data and claims none.
// That is honest, not a shell, so it is exempt.
function isPureRedirect(source) {
  return /\bredirect\s*\(/.test(source) && !/return\s*\(/.test(source);
}

function hasDataBinding(pagePath) {
  const own = readSafe(pagePath);
  if (isPureRedirect(own)) return true;
  if (DATA_SIGNALS.some((re) => re.test(own))) return true;

  FOLLOWABLE_IMPORT.lastIndex = 0;
  let match;
  while ((match = FOLLOWABLE_IMPORT.exec(own)) !== null) {
    const resolved = resolveImport(match[1], pagePath);
    if (!resolved) continue;
    const child = readSafe(resolved);
    if (DATA_SIGNALS.some((re) => re.test(child))) return true;
  }
  return false;
}

function adminPages() {
  return trackedFiles().filter(
    (path) => path.startsWith(ADMIN_ROOT) && path.endsWith("/page.tsx"),
  );
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

const pages = adminPages();
const shells = pages.filter((path) => !hasDataBinding(path));

if (process.argv.includes("--write-baseline")) {
  const header = [
    "# Admin shell baseline — Doctrine G-9 (installation is not acceptance).",
    "# Each entry is an admin page that renders no data from any source.",
    "# This list is a RATCHET: entries may be removed once a page is wired to",
    "# real data, and must never be added. A new shell page fails CI.",
    "",
  ].join("\n");
  process.stdout.write(header + shells.sort().join("\n") + "\n");
  process.exit(0);
}

const baseline = loadBaseline();
const unlisted = shells.filter((path) => !baseline.has(path));

if (unlisted.length > 0) {
  console.error("Admin data-binding check FAILED — page(s) render no data.");
  console.error("Doctrine G-9: a panel that measures nothing is not a finished panel.");
  console.error("");
  for (const path of unlisted) console.error(`  ${path}`);
  console.error("");
  console.error("Wire the page to a query or server action, or render an honest empty state");
  console.error("that says what is missing. Do NOT add it to .admin-shell-baseline —");
  console.error("that list only shrinks.");
  process.exit(1);
}

const stale = [...baseline].filter((path) => !shells.includes(path));

console.log(
  `Admin data-binding check passed. ${pages.length} admin page(s) scanned, ` +
    `${shells.length} shell(s) still grandfathered.`,
);
if (stale.length > 0) {
  console.log("");
  console.log(`${stale.length} baseline entry/entries are now wired and can be removed:`);
  for (const path of stale) console.log(`  ${path}`);
}
