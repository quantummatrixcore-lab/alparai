import fs from "fs";
import path from "path";

const projectRoot = "D:/01_SaaS_Products/Alparai";
const appDir = path.join(projectRoot, "src/app");
const publicDir = path.join(projectRoot, "public");
const srcDir = path.join(projectRoot, "src");
const messagesDir = path.join(projectRoot, "messages");

// Discover all routes
const definedPageRoutes = new Set();
const definedApiRoutes = new Set();
const dynamicPageRoutes = [];
const staticFiles = new Set();

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git" || entry.name === "dist") continue;
      walkDir(fullPath, callback);
    } else {
      callback(fullPath, entry.name);
    }
  }
}

walkDir(publicDir, (filePath) => {
  const rel = path.relative(publicDir, filePath).replace(/\\/g, "/");
  staticFiles.add("/" + rel);
});

walkDir(appDir, (filePath) => {
  const rel = path.relative(appDir, filePath).replace(/\\/g, "/");
  if (/^(.+\/)?page\.(tsx|ts|jsx|js)$/.test(rel)) {
    let route = "/" + rel.replace(/\/page\.(tsx|ts|jsx|js)$/, "").replace(/^page\.(tsx|ts|jsx|js)$/, "");
    route = route.replace(/^\/\[locale\]/, "");
    route = route.replace(/\/\([^)]+\)/g, "");
    if (!route.startsWith("/")) route = "/" + route;
    if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
    definedPageRoutes.add(route);
    if (route.includes("[")) {
      const regexStr = "^" + route
        .replace(/\[\.\.\.([^\]]+)\]/g, "(.+)")
        .replace(/\[\[\.\.\.([^\]]+)\]\]/g, "(.*)")
        .replace(/\[([^\]]+)\]/g, "([^/]+)")
        .replace(/\//g, "\\/") + "$";
      dynamicPageRoutes.push({ pattern: route, regex: new RegExp(regexStr) });
    }
  } else if (/^(.+\/)?route\.(tsx|ts|jsx|js)$/.test(rel)) {
    let route = "/" + rel.replace(/\/route\.(tsx|ts|jsx|js)$/, "").replace(/^route\.(tsx|ts|jsx|js)$/, "");
    route = route.replace(/^\/\[locale\]/, "");
    route = route.replace(/\/\([^)]+\)/g, "");
    if (!route.startsWith("/")) route = "/" + route;
    if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
    definedApiRoutes.add(route);
  }
});

// Check if a path is valid in Next.js
function isValidPath(rawPath) {
  if (!rawPath || rawPath === "#" || rawPath.startsWith("#") || rawPath.startsWith("http://") || rawPath.startsWith("https://") || rawPath.startsWith("mailto:") || rawPath.startsWith("tel:") || rawPath.startsWith("blob:") || rawPath.startsWith("data:")) {
    return { valid: true, reason: "external/anchor" };
  }

  let clean = rawPath.split("?")[0].split("#")[0];
  // Remove template literals placeholders
  clean = clean
    .replace(/^\/\$\{locale\}/, "")
    .replace(/^\/\{locale\}/, "")
    .replace(/^\/\$\{[^}]+\}/, "")
    .replace(/^\/(en|tr)(\/|$)/, "/")
    .replace(/^\/\[locale\]/, "");

  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);

  if (definedPageRoutes.has(clean)) return { valid: true, type: "static-page", route: clean };
  if (definedApiRoutes.has(clean)) return { valid: true, type: "api-route", route: clean };
  if (staticFiles.has(clean)) return { valid: true, type: "static-file", route: clean };

  for (const dyn of dynamicPageRoutes) {
    if (dyn.regex.test(clean)) {
      return { valid: true, type: "dynamic-page", route: dyn.pattern };
    }
  }

  // If path contains template expressions like `/incidents/${id}`
  if (clean.includes("${") || clean.includes("`") || clean.includes("+") || clean.includes("ANY_PARAM")) {
    const generalized = clean.replace(/\$\{[^}]+\}/g, "ANY_PARAM").replace(/\+[^/]+/g, "ANY_PARAM");
    for (const dyn of dynamicPageRoutes) {
      const dynGen = dyn.pattern.replace(/\[[^\]]+\]/g, "ANY_PARAM");
      if (generalized === dynGen) {
        return { valid: true, type: "dynamic-template", route: dyn.pattern };
      }
    }
    const prefix = clean.split("${")[0];
    const match = Array.from(definedPageRoutes).find(r => r.startsWith(prefix) && r.includes("["));
    if (match) return { valid: true, type: "dynamic-prefix", route: match };
  }

  return { valid: false, clean };
}

// Deep search across all source files
const issues = [];
const allAuditedLinks = [];

const filesToScan = [];
walkDir(srcDir, (f) => filesToScan.push(f));
walkDir(messagesDir, (f) => filesToScan.push(f));

// Custom scan for URLs in strings
for (const file of filesToScan) {
  const ext = path.extname(file);
  if (![".ts", ".tsx", ".js", ".jsx", ".json", ".md"].includes(ext)) continue;
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(projectRoot, file).replace(/\\/g, "/");

  // If it's a test file, we can log it with lower priority or filter mock paths
  const isTest = relPath.includes(".test.") || relPath.includes(".spec.") || relPath.includes("/tests/") || relPath.includes("/e2e/");

  // Match all href strings, router pushes, window.location, redirects, etc.
  const stringRegex = /["'`](\/[a-zA-Z0-9_\-\/\$\{\}\[\]\.\?\=\&]+)["'`]/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const rawUrl = match[1];
    
    // Ignore internal code imports or standard mime types
    if (rawUrl.startsWith("/node_modules") || rawUrl.startsWith("/lib/") || rawUrl.startsWith("/components/") || rawUrl.startsWith("/src/") || rawUrl.startsWith("/types/")) continue;
    if (rawUrl === "/" || rawUrl.includes("*") || rawUrl.startsWith("/@") || rawUrl.endsWith(".ts") || rawUrl.endsWith(".tsx") || rawUrl.endsWith(".css")) continue;
    if (rawUrl.includes("//")) continue;

    // Line number calculation
    const linesUpToMatch = content.substring(0, match.index).split("\n");
    const lineNum = linesUpToMatch.length;
    const currentLine = linesUpToMatch[linesUpToMatch.length - 1] + content.substring(match.index).split("\n")[0];

    // Check if this line is a navigation, link, redirect, href, breadcrumb, or path config
    const isNavigationContext = 
      currentLine.includes("href") ||
      currentLine.includes("Link") ||
      currentLine.includes("router.") ||
      currentLine.includes("redirect") ||
      currentLine.includes("onClick") ||
      currentLine.includes("location") ||
      currentLine.includes("breadcrumb") ||
      currentLine.includes("path") ||
      currentLine.includes("url") ||
      currentLine.includes("to:") ||
      currentLine.includes("route") ||
      currentLine.includes("nav");

    if (isNavigationContext) {
      const res = isValidPath(rawUrl);
      allAuditedLinks.push({
        rawUrl,
        file: relPath,
        line: lineNum,
        valid: res.valid,
        isTest,
        snippet: currentLine.trim()
      });

      if (!res.valid) {
        issues.push({
          rawUrl,
          clean: res.clean,
          file: relPath,
          line: lineNum,
          isTest,
          snippet: currentLine.trim()
        });
      }
    }
  }
}

console.log(`\n======================================================`);
console.log(`🧭 [COLUMBUS COMPREHENSIVE INTERNAL ROUTE DEEP AUDIT]`);
console.log(`======================================================`);
console.log(`Total Scanned Navigation Contexts: ${allAuditedLinks.length}`);
console.log(`Total Issues / 404 Candidates Found: ${issues.length}`);
console.log(`======================================================\n`);

const prodIssues = issues.filter(i => !i.isTest);
const testIssues = issues.filter(i => i.isTest);

console.log(`🚨 PRODUCTION BROKEN LINKS (${prodIssues.length}):`);
for (const p of prodIssues) {
  console.log(`- Target: "${p.rawUrl}" (normalized: "${p.clean}")`);
  console.log(`  File: ${p.file}:${p.line}`);
  console.log(`  Code: ${p.snippet}`);
  console.log(`------------------------------------------------------`);
}

if (testIssues.length > 0) {
  console.log(`\n🧪 TEST MOCK PATHS / FIXTURES (${testIssues.length}):`);
  for (const t of testIssues) {
    console.log(`- Target: "${t.rawUrl}" in ${t.file}:${t.line}`);
  }
}

const detailedLog = path.join(projectRoot, "REPORTS/columbus_deep_links.json");
fs.writeFileSync(detailedLog, JSON.stringify({ prodIssues, testIssues, allAuditedLinks }, null, 2));
console.log(`\nDeep audit output saved to ${detailedLog}`);
