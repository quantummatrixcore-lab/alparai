import fs from "fs";
import path from "path";

const projectRoot = "D:/01_SaaS_Products/Alparai";
const appDir = path.join(projectRoot, "src/app");
const messagesDir = path.join(projectRoot, "messages");
const contentDir = path.join(projectRoot, "src/content");

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

  for (const d of dynamicRoutes) {
    if (d.regex.test(clean)) return { ok: true, type: "dynamic-page", route: d.pattern };
  }

  return { ok: false, clean };
}

const foundLinks = [];

// Scan messages
function scanJsonObj(obj, prefix, file) {
  for (const [k, v] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      // Find markdown links [text](/url)
      const mdMatches = [...v.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
      for (const m of mdMatches) {
        const url = m[2];
        const res = verify(url);
        foundLinks.push({ file, key: currentKey, url, res, text: m[1] });
      }
      // Find direct URLs in values starting with /
      if (v.startsWith("/") && !v.includes(" ") && v.length < 100) {
        const res = verify(v);
        foundLinks.push({ file, key: currentKey, url: v, res, text: "raw url" });
      }
    } else if (typeof v === "object" && v !== null) {
      scanJsonObj(v, currentKey, file);
    }
  }
}

walk(messagesDir, (f) => {
  if (f.endsWith(".json")) {
    try {
      const data = JSON.parse(fs.readFileSync(f, "utf8"));
      scanJsonObj(data, "", path.relative(projectRoot, f).replace(/\\/g, "/"));
    } catch (e) {
      console.error("Error parsing", f, e.message);
    }
  }
});

// Scan content markdown files
walk(contentDir, (f) => {
  if (f.endsWith(".md") || f.endsWith(".mdx")) {
    const c = fs.readFileSync(f, "utf8");
    const mdMatches = [...c.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    for (const m of mdMatches) {
      const url = m[2];
      const res = verify(url);
      foundLinks.push({ file: path.relative(projectRoot, f).replace(/\\/g, "/"), key: "content", url, res, text: m[1] });
    }
  }
});

console.log(`\n======================================================`);
console.log(`🧭 [COLUMBUS MESSAGES & CONTENT LINK AUDIT]`);
console.log(`======================================================`);
console.log(`Total Links Found in Messages & Content: ${foundLinks.length}`);

const broken = foundLinks.filter(l => !l.res.ok);
console.log(`Valid Links: ${foundLinks.length - broken.length}`);
console.log(`Broken Links: ${broken.length}`);

if (broken.length > 0) {
  console.log(`\n🚨 BROKEN LINKS IN MESSAGES / CONTENT:`);
  for (const b of broken) {
    console.log(`- File: ${b.file} (${b.key})`);
    console.log(`  Target: "${b.url}" -> clean: "${b.res.clean}"`);
    console.log(`  Anchor: "${b.text}"`);
    console.log(`------------------------------------------------------`);
  }
} else {
  console.log(`✨ ALL MESSAGES & CONTENT LINKS ARE 100% VALID!`);
}
