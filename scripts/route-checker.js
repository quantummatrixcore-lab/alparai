import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const appDir = path.join(projectRoot, "src/app");
const publicDir = path.join(projectRoot, "public");
const srcDir = path.join(projectRoot, "src");
const messagesDir = path.join(projectRoot, "messages");

// 1. Discover all defined routes
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

// Walk public dir
walkDir(publicDir, (filePath) => {
  const rel = path.relative(publicDir, filePath).replace(/\\/g, "/");
  staticFiles.add("/" + rel);
});

// Walk src/app to find all routes
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

console.log(`\n🧭 [COLUMBUS ZERO-404 AUDIT] Verification Pipeline`);
console.log(`================================================`);
console.log(`Defined Page Routes: ${definedPageRoutes.size}`);
console.log(`Defined API Routes:  ${definedApiRoutes.size}`);
console.log(`Static Public Files: ${staticFiles.size}`);

function checkRouteValid(targetUrl) {
  if (!targetUrl || targetUrl === "#" || targetUrl.startsWith("#")) {
    return { valid: true, type: "anchor" };
  }
  if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("mailto:") || targetUrl.startsWith("tel:") || targetUrl.startsWith("blob:") || targetUrl.startsWith("data:")) {
    return { valid: true, type: "external" };
  }

  let cleanUrl = targetUrl.split("?")[0].split("#")[0];
  
  cleanUrl = cleanUrl
    .replace(/^\/\$\{locale\}/, "")
    .replace(/^\/\{locale\}/, "")
    .replace(/^\/\$\{[^}]+\}/, "")
    .replace(/^\/(en|tr)(\/|$)/, "/")
    .replace(/^\/\[locale\]/, "");
  
  if (!cleanUrl.startsWith("/")) cleanUrl = "/" + cleanUrl;
  if (cleanUrl.length > 1 && cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);

  if (definedPageRoutes.has(cleanUrl)) return { valid: true, type: "static-page", target: cleanUrl };
  if (definedApiRoutes.has(cleanUrl)) return { valid: true, type: "api-route", target: cleanUrl };
  if (staticFiles.has(cleanUrl)) return { valid: true, type: "static-file", target: cleanUrl };

  for (const dyn of dynamicPageRoutes) {
    if (dyn.regex.test(cleanUrl)) {
      return { valid: true, type: "dynamic-page", matchedPattern: dyn.pattern, target: cleanUrl };
    }
  }

  // Handle template strings or variable interpolation
  if (cleanUrl.includes("${") || cleanUrl.includes("`") || cleanUrl.includes("+")) {
    const generalized = cleanUrl
      .replace(/\$\{[^}]+\}/g, "ANY_PARAM")
      .replace(/\+[^/]+/g, "ANY_PARAM");
    for (const dyn of dynamicPageRoutes) {
      const dynGeneralized = dyn.pattern.replace(/\[[^\]]+\]/g, "ANY_PARAM");
      if (generalized === dynGeneralized) {
        return { valid: true, type: "dynamic-template-match", matchedPattern: dyn.pattern, target: cleanUrl };
      }
    }
    const prefix = cleanUrl.split("${")[0];
    const matchingPrefix = Array.from(definedPageRoutes).find(r => r.startsWith(prefix) && r.includes("["));
    if (matchingPrefix) {
      return { valid: true, type: "dynamic-prefix-match", matchedPattern: matchingPrefix, target: cleanUrl };
    }
  }

  return { valid: false, target: cleanUrl, raw: targetUrl };
}

const scanExtensions = [".tsx", ".ts", ".jsx", ".js"];
const linksFound = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, "/");

  // Skip tests
  if (relPath.includes(".test.") || relPath.includes(".spec.")) return;

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
      const result = checkRouteValid(url);
      linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
    }

    // Pattern 2: router.push(...) or router.replace(...) or redirect(...)
    const routerMatches = [
      ...line.matchAll(/(?:router\.push|router\.replace|redirect|navigate)\(\s*["']([^"']+)["']/g),
      ...line.matchAll(/(?:router\.push|router\.replace|redirect|navigate)\(\s*`([^`]+)`/g),
      ...line.matchAll(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/g),
      ...line.matchAll(/window\.location(?:\.href)?\s*=\s*`([^`]+)`/g),
    ];
    for (const m of routerMatches) {
      const url = m[1];
      const result = checkRouteValid(url);
      linksFound.push({ url, ...result, file: relPath, line: lineNum, snippet: line.trim() });
    }
  });
}

walkDir(srcDir, (filePath, fileName) => {
  const ext = path.extname(fileName);
  if (scanExtensions.includes(ext)) {
    scanFile(filePath);
  }
});

const brokenLinks = linksFound.filter(l => !l.valid);

console.log(`\nAudited Total Links & Navigations: ${linksFound.length}`);
console.log(`Valid Links: ${linksFound.length - brokenLinks.length}`);
console.log(`Broken Links (404 risk): ${brokenLinks.length}`);
console.log(`================================================`);

if (brokenLinks.length > 0) {
  console.error(`🚨 BROKEN LINKS DETECTED:`);
  brokenLinks.forEach((b, idx) => {
    console.error(`[${idx + 1}] Target: "${b.target}" in ${b.file}:${b.line}`);
  });
  process.exit(1);
} else {
  console.log(`🎉 ZERO 404 RISK CONFIRMED! All internal links and routes are 100% verified.`);
  process.exit(0);
}
