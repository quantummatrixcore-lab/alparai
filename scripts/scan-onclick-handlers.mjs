import fs from "fs";
import path from "path";

const projectRoot = "D:/01_SaaS_Products/Alparai";
const srcDir = path.join(projectRoot, "src");
const appDir = path.join(projectRoot, "src/app");
const publicDir = path.join(projectRoot, "public");

const pageRoutes = new Set();
const apiRoutes = new Set();
const dynamicRoutes = [];
const staticFiles = new Set();

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

walk(publicDir, (f) => {
  const rel = path.relative(publicDir, f).replace(/\\/g, "/");
  staticFiles.add("/" + rel);
});

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

function verify(url) {
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

  if (pageRoutes.has(clean)) return { ok: true, type: "page", route: clean };
  if (apiRoutes.has(clean)) return { ok: true, type: "api", route: clean };
  if (staticFiles.has(clean)) return { ok: true, type: "static", route: clean };

  for (const d of dynamicRoutes) {
    if (d.regex.test(clean)) return { ok: true, type: "dynamic-page", route: d.pattern };
  }

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

const onClickNavigations = [];

walk(srcDir, (filePath) => {
  if (!/\.(tsx|jsx)$/.test(filePath)) return;
  const rel = path.relative(projectRoot, filePath).replace(/\\/g, "/");
  if (rel.includes(".test.") || rel.includes(".spec.")) return;

  const content = fs.readFileSync(filePath, "utf8");
  
  // Search for onClick handlers
  const onClickRegex = /onClick=\{([^}]+)\}/g;
  let match;
  while ((match = onClickRegex.exec(content)) !== null) {
    const handlerBody = match[1];
    
    // Check if handler body triggers navigation
    const navMatch = handlerBody.match(/(?:router\.push|router\.replace|window\.location(?:\.href)?\s*=|window\.open)\(\s*[`"']([^`"']+)`?["']/);
    if (navMatch) {
      const targetUrl = navMatch[1];
      const linesUpToMatch = content.substring(0, match.index).split("\n");
      const lineNum = linesUpToMatch.length;
      const res = verify(targetUrl);
      
      onClickNavigations.push({
        file: rel,
        line: lineNum,
        handler: handlerBody.trim(),
        targetUrl,
        valid: res.ok,
        verifiedRoute: res.route,
        clean: res.clean,
      });
    }
  }
});

console.log(`\n======================================================`);
console.log(`🧭 [COLUMBUS BUTTON onClick REDIRECTION AUDIT]`);
console.log(`======================================================`);
console.log(`Total onClick Navigations Detected: ${onClickNavigations.length}`);

const brokenOnClicks = onClickNavigations.filter(o => !o.valid);
const validOnClicks = onClickNavigations.filter(o => o.valid);

console.log(`Valid Verified onClick Navigations: ${validOnClicks.length}`);
console.log(`Broken onClick Navigations: ${brokenOnClicks.length}`);

if (brokenOnClicks.length > 0) {
  console.log(`\n🚨 BROKEN ONCLICK NAVIGATION TARGETS:`);
  for (const b of brokenOnClicks) {
    console.log(`- Target: "${b.targetUrl}" (clean: "${b.clean}")`);
    console.log(`  File: ${b.file}:${b.line}`);
    console.log(`  Handler: ${b.handler}`);
    console.log(`------------------------------------------------------`);
  }
} else {
  console.log(`✨ ALL BUTTON onClick REDIRECTIONS ARE 100% VALID & VERIFIED!`);
}

for (const v of validOnClicks) {
  console.log(`✔ [${v.file}:${v.line}] -> "${v.targetUrl}" => Valid (${v.verifiedRoute || 'external'})`);
}
