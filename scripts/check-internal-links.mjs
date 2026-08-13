#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APP_LOCALE_ROOT = "src/app/[locale]";
const PUBLIC_ROOT = join(ROOT, "public");
const LOCALES = new Set(["en", "tr", "de", "fr", "ru"]);
const MARKER = "\u0000";

const LINK_PATTERNS = [
  /\bhref\s*=\s*\{?\s*"([^"]*)"/g,
  /\bhref\s*=\s*\{?\s*'([^']*)'/g,
  /\bhref\s*=\s*\{\s*`([^`]*)`/g,
  /\bredirect\(\s*"([^"]*)"/g,
  /\bredirect\(\s*'([^']*)'/g,
  /\bredirect\(\s*`([^`]*)`/g,
  /\brouter\.push\(\s*"([^"]*)"/g,
  /\brouter\.push\(\s*'([^']*)'/g,
  /\brouter\.push\(\s*`([^`]*)`/g,
];

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
}

function isScannedSourceFile(path) {
  if (!path.startsWith("src/")) return false;
  if (path.startsWith("src/app/api/")) return false;
  return path.endsWith(".ts") || path.endsWith(".tsx");
}

function segmentsFromRoutePath(routePath) {
  return routePath.split("/").filter((segment) => segment.length > 0);
}

function buildRouteTable() {
  const routes = [];
  for (const path of trackedFiles()) {
    if (!path.startsWith(APP_LOCALE_ROOT) || !path.endsWith("/page.tsx")) continue;
    const routePath = path.slice(APP_LOCALE_ROOT.length, -"/page.tsx".length);
    const normalized = routePath === "" ? "/" : routePath;
    routes.push({
      source: path,
      segments: segmentsFromRoutePath(normalized),
    });
  }
  return routes;
}

function routeMatches(route, targetSegments) {
  if (route.segments.length !== targetSegments.length) return false;
  for (let i = 0; i < route.segments.length; i += 1) {
    const routeSegment = route.segments[i];
    const isDynamic = routeSegment.startsWith("[") && routeSegment.endsWith("]");
    if (isDynamic) continue;
    if (routeSegment !== targetSegments[i]) return false;
  }
  return true;
}

function routeExists(routes, targetPath) {
  const targetSegments = segmentsFromRoutePath(targetPath);
  return routes.some((route) => routeMatches(route, targetSegments));
}

function isExternalOrIgnorable(raw) {
  if (raw === "") return true;
  if (raw.startsWith("//")) return true;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return true;
  if (raw.startsWith("mailto:") || raw.startsWith("tel:")) return true;
  if (raw.startsWith("#")) return true;
  if (!raw.startsWith("/")) return true;
  return false;
}

function maskInterpolations(raw) {
  const exprs = [];
  let depth = 0;
  let start = -1;
  let masked = "";
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    if (char === "$" && raw[i + 1] === "{" && depth === 0) {
      depth = 1;
      start = i + 2;
      i += 1;
      continue;
    }
    if (depth > 0) {
      if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          exprs.push(raw.slice(start, i).trim());
          masked += MARKER;
        }
      }
      continue;
    }
    masked += char;
  }
  return { masked, exprs };
}

function stripQueryAndHash(masked) {
  const queryIndex = masked.indexOf("?");
  const hashIndex = masked.indexOf("#");
  let cutoff = masked.length;
  if (queryIndex !== -1) cutoff = Math.min(cutoff, queryIndex);
  if (hashIndex !== -1) cutoff = Math.min(cutoff, hashIndex);
  return masked.slice(0, cutoff);
}

function resolveTarget(raw) {
  if (isExternalOrIgnorable(raw)) {
    return { kind: "ignored" };
  }
  const { masked, exprs } = maskInterpolations(raw);
  const pathPart = stripQueryAndHash(masked);
  const rawSegments = pathPart.split("/").filter((segment) => segment.length > 0);

  let exprCursor = 0;
  const resolvedSegments = [];
  for (let i = 0; i < rawSegments.length; i += 1) {
    const segment = rawSegments[i];
    const markerCount = (segment.match(new RegExp(MARKER, "g")) || []).length;
    if (markerCount === 0) {
      if (i === 0 && LOCALES.has(segment)) {
        continue;
      }
      resolvedSegments.push(segment);
      continue;
    }
    const segmentExprs = exprs.slice(exprCursor, exprCursor + markerCount);
    exprCursor += markerCount;
    const isPureLocaleSegment =
      i === 0 && segment === MARKER && segmentExprs.length === 1 && segmentExprs[0] === "locale";
    if (isPureLocaleSegment) {
      continue;
    }
    return { kind: "unresolved" };
  }

  if (resolvedSegments.length === 0) {
    return { kind: "resolved", path: "/" };
  }
  return { kind: "resolved", path: `/${resolvedSegments.join("/")}` };
}

function isStaticAssetPath(path) {
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);
  return /\.[a-zA-Z0-9]{2,5}$/.test(lastSegment);
}

function staticAssetExists(path) {
  return existsSync(join(PUBLIC_ROOT, path));
}

function collectLinks(files) {
  const links = [];
  for (const path of files) {
    if (!isScannedSourceFile(path)) continue;
    let content;
    try {
      content = readFileSync(join(ROOT, path), "utf8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const pattern of LINK_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          links.push({ path, line: i + 1, raw: match[1] });
        }
      }
    }
  }
  return links;
}

function main() {
  const files = trackedFiles();
  const routes = buildRouteTable();
  const links = collectLinks(files);

  let checked = 0;
  let skipped = 0;
  let ignored = 0;
  const dead = [];

  for (const link of links) {
    const resolved = resolveTarget(link.raw);
    if (resolved.kind === "ignored") {
      ignored += 1;
      continue;
    }
    if (resolved.kind === "unresolved") {
      skipped += 1;
      continue;
    }

    const targetPath = resolved.path;
    if (targetPath.startsWith("/api/")) {
      ignored += 1;
      continue;
    }

    checked += 1;

    if (isStaticAssetPath(targetPath)) {
      if (!staticAssetExists(targetPath)) {
        dead.push({ ...link, target: targetPath });
      }
      continue;
    }

    if (!routeExists(routes, targetPath)) {
      dead.push({ ...link, target: targetPath });
    }
  }

  if (dead.length > 0) {
    console.error("Internal link check FAILED — the following link targets have no matching route.");
    console.error("");
    for (const { path, line, target } of dead) {
      console.error(`  ${path}:${line} -> ${target}`);
    }
    console.error("");
    console.error(`${dead.length} dead link(s) found out of ${checked} checked.`);
    process.exit(1);
  }

  console.log(
    `Internal link check passed. ${checked} link(s) checked, ${routes.length} route(s) on disk, ` +
      `${skipped} link(s) skipped as statically unresolvable, ${ignored} link(s) ignored (external/anchor/api/mailto/tel).`,
  );
}

main();
