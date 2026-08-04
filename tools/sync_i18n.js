/* eslint-disable */
const fs = require("fs");
const path = require("path");

const messagesDir = path.resolve(__dirname, "..", "messages");
const enPath = path.join(messagesDir, "en.json");

function deepKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) return deepKeys(v, p);
    return [p];
  });
}

function deepGet(obj, parts) {
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function deepSet(obj, parts, value) {
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function syncJsonStrict(srcPath, destPath) {
  const src = JSON.parse(fs.readFileSync(srcPath, "utf-8"));
  const dest = JSON.parse(fs.readFileSync(destPath, "utf-8"));

  const srcKeys = deepKeys(src);
  const destKeys = deepKeys(dest);
  const srcKeySet = new Set(srcKeys);

  const result = {};
  for (const key of srcKeys) {
    const parts = key.split(".");
    const destVal = deepGet(dest, parts);
    if (destVal !== undefined) {
      deepSet(result, parts, destVal);
    } else {
      const enVal = deepGet(src, parts);
      deepSet(result, parts, enVal);
      console.log(`  [+] Added: ${key}`);
    }
  }

  for (const key of destKeys) {
    if (!srcKeySet.has(key)) {
      console.log(`  [-] Removed: ${key}`);
    }
  }

  fs.writeFileSync(destPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`  Done: ${path.basename(destPath)}`);
}

syncJsonStrict(enPath, path.join(messagesDir, "de.json"));
syncJsonStrict(enPath, path.join(messagesDir, "fr.json"));
console.log("Sync complete.");
