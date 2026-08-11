#!/usr/bin/env node
/**
 * Admin link integrity check (Doctrine G-11: "there is no unreachable page").
 *
 * Statically extracts every internal admin href written anywhere under
 * src/app/[locale]/admin/** and src/components/admin/**, then verifies that a
 * matching page.tsx exists on disk. A link that points at a route which was
 * moved or never existed is a guaranteed 404 for whoever clicks it.
 *
 * This is a RATCHET. Links that are already broken today are listed in
 * .admin-link-baseline so adopting the rule does not turn CI red on day one.
 * Entries may only be REMOVED as links are fixed, never added.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = join(ROOT, ".admin-link-baseline");
const ADMIN_ROOT = "src/app/[locale]/admin";

const SCANNED_PREFIXES = [ADMIN_ROOT, "src/components/admin"];
const SCANNED_EXTENSIONS = [".ts", ".tsx"];

// Matches href={`/${locale}/admin/foo/bar`} and href="/admin/foo/bar"
const HREF_PATTERN = /href[=:]\s*[{]?\s*[`"'](?:\/\$\{locale\}|\/\[locale\])?(\/admin\/[a-z0-9\-/[\]]*)[`"']/gi;

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
}

function isScanned(path) {
  return (
    SCANNED_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
    SCANNED_EXTENSIONS.some((ext) => path.endsWith(ext))
  );
}

function existingRoutes() {
  const routes = new Set();
  for (const path of trackedFiles()) {
    if (!path.startsWith(ADMIN_ROOT) || !path.endsWith("/page.tsx")) continue;
    const route = path.slice(ADMIN_ROOT.length, -"/page.tsx".length);
    routes.add(`/admin${route}`);
  }
  routes.add("/admin");
  return routes;
}

function collectLinks() {
  const links = [];
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
      HREF_PATTERN.lastIndex = 0;
      let match;
      while ((match = HREF_PATTERN.exec(lines[i])) !== null) {
        const target = match[1].replace(/\/$/, "");
        links.push({ path, line: i + 1, target });
      }
    }
  }
  return links;
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

const routes = existingRoutes();
const links = collectLinks();

// A link is broken when no page.tsx backs it. Dynamic segments are skipped:
// they are resolved at runtime and cannot be verified statically.
const broken = links.filter(
  ({ target }) => !target.includes("[") && !routes.has(target),
);

if (process.argv.includes("--write-baseline")) {
  const header = [
    "# Admin link baseline — Doctrine G-11 (no unreachable page).",
    "# Each entry is an admin href that currently points at a route with no page.tsx.",
    "# This list is a RATCHET: entries may be removed once a link is fixed,",
    "# and must never be added. A newly broken admin link fails CI.",
    "",
  ].join("\n");
  const unique = [...new Set(broken.map((b) => b.target))].sort();
  process.stdout.write(header + unique.join("\n") + "\n");
  process.exit(0);
}

const baseline = loadBaseline();
const unlisted = broken.filter(({ target }) => !baseline.has(target));

if (unlisted.length > 0) {
  console.error("Admin link check FAILED — links point at routes that do not exist.");
  console.error("Doctrine G-11: a route is not complete until at least one link reaches it.");
  console.error("");
  for (const { path, line, target } of unlisted) {
    console.error(`  ${path}:${line} -> ${target}  (no page.tsx)`);
  }
  console.error("");
  console.error("Fix the href, or create the route. Do NOT add it to .admin-link-baseline —");
  console.error("that list only shrinks.");
  process.exit(1);
}

const brokenTargets = new Set(broken.map((b) => b.target));
const stale = [...baseline].filter((target) => !brokenTargets.has(target));

console.log(
  `Admin link check passed. ${links.length} link(s) scanned, ${routes.size} route(s) on disk, ` +
    `${brokenTargets.size} broken target(s) still grandfathered.`,
);
if (stale.length > 0) {
  console.log("");
  console.log(`${stale.length} baseline entry/entries are now fixed and can be removed:`);
  for (const target of stale) console.log(`  ${target}`);
}
