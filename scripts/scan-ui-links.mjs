import fs from "fs";
import path from "path";

const projectRoot = "D:/01_SaaS_Products/Alparai";
const srcDir = path.join(projectRoot, "src");
const appDir = path.join(projectRoot, "src/app");

// 1. Discover all defined routes
const pageRoutes = new Set();
const apiRoutes = new Set();
const dynamicRoutes = [];

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "dist"].includes(entry.name)) continue;
      walk(p, fn);
    } else {
      fn(p);
    }
  }
}

walk(appDir, (file) => {
  const rel = path.relative(appDir, file).replace(/\\/g, "/");
  if (/^(.+\/)?page\.(tsx|ts|jsx|js)$/.test(rel)) {
    let r = "/" + rel.replace(/\/page\.(tsx|ts|jsx|js)$/, "").replace(/^page\.(tsx|ts|jsx|js)$/, "");
    r = r.replace(/^\/\[locale\]/, "").replace(/\/\([^)]+\)/g, "");
    if (!r.startsWith("/")) r = "/" + r;
    if (r.length > 1 && r.endsWith("/")) r = r.slice(0, -1);
    pageRoutes.add(r);
    if (r.includes("[")) {
      const reg = "^" + r
        .replace(/\[\.\.\.([^\]]+)\]/g, "(.+)")
        .replace(/\[\[\.\.\.([^\]]+)\]\]/g, "(.*)")
        .replace(/\[([^\]]+)\]/g, "([^/]+)")
        .replace(/\//g, "\\/") + "$";
      dynamicRoutes.push({ pattern: r, regex: new RegExp(reg) });
    }
  } else if (/^(.+\/)?route\.(tsx|ts|jsx|js)$/.test(rel)) {
    let r = "/" + rel.replace(/\/route\.(tsx|ts|jsx|js)$/, "").replace(/^route\.(tsx|ts|jsx|js)$/, "");
    r = r.replace(/^\/\[locale\]/, "").replace(/\/\([^)]+\)/g, "");
    if (!r.startsWith("/")) r = "/" + r;
    if (r.length > 1 && r.endsWith("/")) r = r.slice(0, -1);
    apiRoutes.add(r);
  }
});

console.log(`Total App Routes: ${pageRoutes.size} pages, ${apiRoutes.size} APIs`);

// Verify function
function verifyLink(url) {
  if (!url || url === "#" || url.startsWith("#") || url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("blob:") || url.startsWith("data:")) {
    return { ok: true, type: "external" };
  }
  let clean = url.split("?")[0].split("#")[0];
  clean = clean
    .replace(/^\/\$\{locale\}/, "")
    .replace(/^\/\{locale\}/, "")
    .replace(/^\/\$\{[^}]+\}/, "")
    .replace(/^\/(en|tr)(\/|$)/, "/")
    .replace(/^\/\[locale\]/, "");
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);

  if (pageRoutes.has(clean)) return { ok: true, type: "static-page", route: clean };
  if (apiRoutes.has(clean)) return { ok: true, type: "api", route: clean };

  for (const d of dynamicRoutes) {
    if (d.regex.test(clean)) return { ok: true, type: "dynamic-page", route: d.pattern };
  }

  // Template literal check
  if (clean.includes("${") || clean.includes("`") || clean.includes("+")) {
    const gen = clean.replace(/\$\{[^}]+\}/g, "ANY_PARAM").replace(/\+[^/]+/g, "ANY_PARAM");
    for (const d of dynamicRoutes) {
      const dGen = d.pattern.replace(/\[[^\]]+\]/g, "ANY_PARAM");
      if (gen === dGen) return { ok: true, type: "dynamic-template", route: d.pattern };
    }
    const prefix = clean.split("${")[0];
    const match = Array.from(pageRoutes).find(r => r.startsWith(prefix) && r.includes("["));
    if (match) return { ok: true, type: "dynamic-prefix", route: match };
  }

  return { ok: false, clean };
}

// 2. Scan Header, Footer, Nav, Breadcrumbs, Sidebars, Buttons specifically
const detailedFindings = [];

walk(srcDir, (file) => {
  if (!/\.(tsx|ts|jsx|js)$/.test(file)) return;
  const rel = path.relative(projectRoot, file).replace(/\\/g, "/");
  if (rel.includes(".test.") || rel.includes(".spec.")) return;

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // 1. Link / TrackedLink / a tags
    const linkMatches = [
      ...line.matchAll(/(?:href|to)=["']([^"']+)["']/g),
      ...line.matchAll(/(?:href|to)=\{`([^`]+)`\}/g),
      ...line.matchAll(/(?:href|to)=\{["']([^"']+)["']\}/g),
    ];
    for (const m of linkMatches) {
      const url = m[1];
      if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../") || url.startsWith("http")) {
        const res = verifyLink(url);
        if (!res.ok) {
          detailedFindings.push({
            type: "Broken Link/Href",
            url,
            clean: res.clean,
            file: rel,
            line: lineNum,
            snippet: line.trim(),
          });
        }
      }
    }

    // 2. onClick / router / navigate
    const routerMatches = [
      ...line.matchAll(/(?:router\.push|router\.replace|redirect|navigate)\(\s*["']([^"']+)["']/g),
      ...line.matchAll(/(?:router\.push|router\.replace|redirect|navigate)\(\s*`([^`]+)`/g),
      ...line.matchAll(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/g),
      ...line.matchAll(/window\.location(?:\.href)?\s*=\s*`([^`]+)`/g),
    ];
    for (const m of routerMatches) {
      const url = m[1];
      if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../") || url.startsWith("http")) {
        const res = verifyLink(url);
        if (!res.ok) {
          detailedFindings.push({
            type: "Broken Router Push/Redirect",
            url,
            clean: res.clean,
            file: rel,
            line: lineNum,
            snippet: line.trim(),
          });
        }
      }
    }

    // 3. Navigation item objects: { title: "...", href: "..." } or { label: "...", url: "..." }
    const navObjMatches = [
      ...line.matchAll(/(?:href|url|path):\s*["']([^"']+)["']/g),
      ...line.matchAll(/(?:href|url|path):\s*`([^`]+)`/g),
    ];
    for (const m of navObjMatches) {
      const url = m[1];
      if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../") || url.startsWith("http")) {
        // Exclude svg path data or regex or mock test strings
        if (url.startsWith("/api/cron/") && line.includes(".replace(")) continue;
        if (url === "/api/" || url === "/embed" || url.includes("/admin-v2")) continue;
        const res = verifyLink(url);
        if (!res.ok) {
          detailedFindings.push({
            type: "Broken Nav/Breadcrumb/Config Path",
            url,
            clean: res.clean,
            file: rel,
            line: lineNum,
            snippet: line.trim(),
          });
        }
      }
    }
  });
});

console.log(`\n=================================================`);
console.log(`🧭 [DETAILED UI & COMPONENT AUDIT FINDINGS]`);
console.log(`=================================================`);
console.log(`Total Issues Found: ${detailedFindings.length}`);

for (const f of detailedFindings) {
  console.log(`[${f.type}] Target: "${f.url}" (clean: "${f.clean}")`);
  console.log(`  Location: ${f.file}:${f.line}`);
  console.log(`  Snippet: ${f.snippet}`);
  console.log(`-------------------------------------------------`);
}
