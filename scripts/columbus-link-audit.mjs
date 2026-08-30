import fs from "fs";
import path from "path";

const projectRoot = "D:/01_SaaS_Products/Alparai";
const appDir = path.join(projectRoot, "src/app");
const publicDir = path.join(projectRoot, "public");
const srcDir = path.join(projectRoot, "src");
const messagesDir = path.join(projectRoot, "messages");

// 1. Discover all defined routes
const definedPageRoutes = new Set();
const definedApiRoutes = new Set();
const dynamicPageRoutes = []; // regex patterns
const staticFiles = new Set();

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      walkDir(fullPath, callback);
    } else {
      callback(fullPath, entry.name);
    }
  }
}

// Walk public dir
walkDir(publicDir, (filePath, fileName) => {
  const rel = path.relative(publicDir, filePath).replace(/\\/g, "/");
  staticFiles.add("/" + rel);
});

// Walk src/app to find all routes
walkDir(appDir, (filePath, fileName) => {
  const rel = path.relative(appDir, filePath).replace(/\\/g, "/");
  
  // Check for page
  if (/^(.+\/)?page\.(tsx|ts|jsx|js)$/.test(rel)) {
    let route = "/" + rel.replace(/\/page\.(tsx|ts|jsx|js)$/, "").replace(/^page\.(tsx|ts|jsx|js)$/, "");
    // Normalize [locale] and route groups like (marketing), (auth)
    route = route.replace(/^\/\[locale\]/, "");
    route = route.replace(/\/\([^)]+\)/g, "");
    if (!route.startsWith("/")) route = "/" + route;
    if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
    
    definedPageRoutes.add(route);
    
    // Check if dynamic route
    if (route.includes("[")) {
      // Convert [param] or [...param] or [[...param]] to regex
      const regexStr = "^" + route
        .replace(/\[\.\.\.([^\]]+)\]/g, "(.+)")
        .replace(/\[\[\.\.\.([^\]]+)\]\]/g, "(.*)")
        .replace(/\[([^\]]+)\]/g, "([^/]+)")
        .replace(/\//g, "\\/") + "$";
      dynamicPageRoutes.push({
        pattern: route,
        regex: new RegExp(regexStr),
      });
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

console.log(`\n🧭 [COLUMBUS NAVIGATOR] Project Route Discovery`);
console.log(`===============================================`);
console.log(`Defined Page Routes (${definedPageRoutes.size}):`);
for (const r of Array.from(definedPageRoutes).sort()) {
  console.log(`  - ${r}`);
}
console.log(`\nDefined API Routes (${definedApiRoutes.size}):`);
for (const r of Array.from(definedApiRoutes).sort()) {
  console.log(`  - ${r}`);
}

// 2. Scan all files in src and messages for links, onClick router pushes, breadcrumbs, hrefs
const scanExtensions = [".tsx", ".ts", ".jsx", ".js", ".json", ".md"];
const linksFound = [];

function checkRouteValid(targetUrl, sourceFile, lineNum, contextType, rawSnippet) {
  // Ignore empty or anchors or external
  if (!targetUrl || targetUrl === "#" || targetUrl.startsWith("#")) {
    return { valid: true, type: "anchor" };
  }
  if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("mailto:") || targetUrl.startsWith("tel:") || targetUrl.startsWith("blob:") || targetUrl.startsWith("data:")) {
    return { valid: true, type: "external" };
  }

  // Clean URL
  let cleanUrl = targetUrl.split("?")[0].split("#")[0];
  
  // Normalize locale interpolation e.g. /${locale}/..., /{locale}/..., /en/..., /tr/...
  cleanUrl = cleanUrl
    .replace(/^\/\$\{locale\}/, "")
    .replace(/^\/\{locale\}/, "")
    .replace(/^\/\$\{[^}]+\}/, "")
    .replace(/^\/(en|tr)(\/|$)/, "/")
    .replace(/^\/\[locale\]/, "");
  
  if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;
  if (cleanUrl.length > 1 && cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);

  // Exact match with static page route
  if (definedPageRoutes.has(cleanUrl)) {
    return { valid: true, type: "static-page", target: cleanUrl };
  }

  // Exact match with API route
  if (definedApiRoutes.has(cleanUrl)) {
    return { valid: true, type: "api-route", target: cleanUrl };
  }

  // Exact match with static file
  if (staticFiles.has(cleanUrl)) {
    return { valid: true, type: "static-file", target: cleanUrl };
  }

  // Dynamic route check
  for (const dyn of dynamicPageRoutes) {
    if (dyn.regex.test(cleanUrl)) {
      return { valid: true, type: "dynamic-page", matchedPattern: dyn.pattern, target: cleanUrl };
    }
  }

  // Handle template strings or variable interpolation like `/incidents/${item.id}` or `/admin/incidents/${id}`
  if (cleanUrl.includes("${") || cleanUrl.includes("`") || cleanUrl.includes("+")) {
    // Try generalized pattern replacement
    const generalized = cleanUrl
      .replace(/\$\{[^}]+\}/g, "ANY_PARAM")
      .replace(/\+[^/]+/g, "ANY_PARAM");
    for (const dyn of dynamicPageRoutes) {
      const dynGeneralized = dyn.pattern.replace(/\[[^\]]+\]/g, "ANY_PARAM");
      if (generalized === dynGeneralized) {
        return { valid: true, type: "dynamic-template-match", matchedPattern: dyn.pattern, target: cleanUrl };
      }
    }
    // Also check if any dynamic route starts with the prefix
    const prefix = cleanUrl.split("${")[0];
    const matchingPrefix = Array.from(definedPageRoutes).find(r => r.startsWith(prefix) && r.includes("["));
    if (matchingPrefix) {
      return { valid: true, type: "dynamic-prefix-match", matchedPattern: matchingPrefix, target: cleanUrl };
    }
  }

  return {
    valid: false,
    type: "broken-404",
    target: cleanUrl,
    raw: targetUrl,
    file: path.relative(projectRoot, sourceFile).replace(/\\/g, "/"),
    line: lineNum,
    context: contextType,
    snippet: rawSnippet ? rawSnippet.trim().slice(0, 120) : "",
  };
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, "/");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Pattern 1: <Link href="..." or <Link href={`...`}
    const linkMatches = [
      ...line.matchAll(/<Link[^>]*href=["']([^"']+)["']/g),
      ...line.matchAll(/<Link[^>]*href=\{`([^`]+)`\}/g),
      ...line.matchAll(/<Link[^>]*href=\{["']([^"']+)["']\}/g),
      ...line.matchAll(/<a[^>]*href=["']([^"']+)["']/g),
      ...line.matchAll(/<a[^>]*href=\{`([^`]+)`\}/g),
    ];
    for (const m of linkMatches) {
      const url = m[1];
      const result = checkRouteValid(url, filePath, lineNum, "Link/Anchor Component", line);
      linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
    }

    // Pattern 2: href: "..." or href: '...' or href: `...` (navigation configs, menus, breadcrumbs)
    const hrefMatches = [
      ...line.matchAll(/href:\s*["']([^"']+)["']/g),
      ...line.matchAll(/href:\s*`([^`]+)`/g),
      ...line.matchAll(/url:\s*["']([^"']+)["']/g),
      ...line.matchAll(/url:\s*`([^`]+)`/g),
      ...line.matchAll(/path:\s*["']([^"']+)["']/g),
      ...line.matchAll(/path:\s*`([^`]+)`/g),
    ];
    for (const m of hrefMatches) {
      const url = m[1];
      // Only check internal paths (starting with /)
      if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../") || url.startsWith("http")) {
        const result = checkRouteValid(url, filePath, lineNum, "Nav/Config/Breadcrumb Property", line);
        linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
      }
    }

    // Pattern 3: router.push("...") or router.push(`...`) or router.replace(...) or redirect(...)
    const routerMatches = [
      ...line.matchAll(/(?:router\.push|router\.replace|redirect|navigate)\(\s*["']([^"']+)["']/g),
      ...line.matchAll(/(?:router\.push|router\.replace|redirect|navigate)\(\s*`([^`]+)`/g),
      ...line.matchAll(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/g),
      ...line.matchAll(/window\.location(?:\.href)?\s*=\s*`([^`]+)`/g),
    ];
    for (const m of routerMatches) {
      const url = m[1];
      const result = checkRouteValid(url, filePath, lineNum, "Router Navigation / Redirect", line);
      linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
    }

    // Pattern 4: onClick with inline window.location or router
    const onClickMatches = [
      ...line.matchAll(/onClick=\{[^}]*(?:router\.push|router\.replace|location\.href)[^}]*["']([^"']+)["']/g),
      ...line.matchAll(/onClick=\{[^}]*(?:router\.push|router\.replace|location\.href)[^}]*`([^`]+)`/g),
    ];
    for (const m of onClickMatches) {
      const url = m[1];
      const result = checkRouteValid(url, filePath, lineNum, "Button onClick Redirect", line);
      linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
    }

    // Pattern 5: Breadcrumbs specific structures
    if (line.includes("breadcrumb") || line.includes("Breadcrumb") || line.includes("breadcrumbs")) {
      const breadcrumbLinks = [
        ...line.matchAll(/href:\s*["']([^"']+)["']/g),
        ...line.matchAll(/href:\s*`([^`]+)`/g),
        ...line.matchAll(/path:\s*["']([^"']+)["']/g),
        ...line.matchAll(/link:\s*["']([^"']+)["']/g),
      ];
      for (const m of breadcrumbLinks) {
        const url = m[1];
        if (url.startsWith("/")) {
          const result = checkRouteValid(url, filePath, lineNum, "Breadcrumb Link", line);
          linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
        }
      }
    }
  });
}

// Walk src and messages
walkDir(srcDir, (filePath, fileName) => {
  const ext = path.extname(fileName);
  if (scanExtensions.includes(ext)) {
    scanFile(filePath);
  }
});

walkDir(messagesDir, (filePath, fileName) => {
  const ext = path.extname(fileName);
  if (scanExtensions.includes(ext)) {
    scanFile(filePath);
  }
});

// 3. Process Findings
const brokenLinks = linksFound.filter(l => !l.valid);
const validLinks = linksFound.filter(l => l.valid);

console.log(`\n===============================================`);
console.log(`🧭 [COLUMBUS NAVIGATOR AUDIT RESULTS]`);
console.log(`===============================================`);
console.log(`Total Links / Navigations Scanned: ${linksFound.length}`);
console.log(`Valid Verified Links: ${validLinks.length}`);
console.log(`Broken / 404 Candidate Links: ${brokenLinks.length}`);
console.log(`===============================================\n`);

if (brokenLinks.length > 0) {
  console.log(`🚨 POTENTIAL BROKEN LINKS / 404 RISKS DETECTED:`);
  console.log(`-----------------------------------------------`);
  brokenLinks.forEach((item, idx) => {
    console.log(`[${idx + 1}] Target: "${item.target}" (raw: "${item.raw}")`);
    console.log(`    File: ${item.file}:${item.line}`);
    console.log(`    Context: ${item.context}`);
    console.log(`    Snippet: ${item.snippet}`);
    console.log(`-----------------------------------------------`);
  });
} else {
  console.log(`✨ 100% CLEAN NAVIGATION GRAPH — NO BROKEN LINKS FOUND!`);
}

// Write detailed json report
const reportPath = path.join(projectRoot, "REPORTS/columbus_navigation_audit.json");
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  definedPageRoutes: Array.from(definedPageRoutes),
  definedApiRoutes: Array.from(definedApiRoutes),
  totalScanned: linksFound.length,
  validCount: validLinks.length,
  brokenCount: brokenLinks.length,
  brokenLinks: brokenLinks,
}, null, 2));

console.log(`\nDetailed report written to: ${reportPath}`);
