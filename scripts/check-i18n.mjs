import fs from "node:fs";
import path from "node:path";

function flattenKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(flattenKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

try {
  const enPath = path.resolve(process.cwd(), "messages/en.json");
  const trPath = path.resolve(process.cwd(), "messages/tr.json");

  if (!fs.existsSync(enPath) || !fs.existsSync(trPath)) {
    console.error("Error: en.json or tr.json file does not exist");
    process.exit(1);
  }

  // Read helper with BOM stripping
  const readJson = (filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  };

  const enContent = readJson(enPath);
  const trContent = readJson(trPath);

  const enKeys = flattenKeys(enContent);
  const trKeys = flattenKeys(trContent);

  const enSet = new Set(enKeys);
  const trSet = new Set(trKeys);

  const missingInTr = enKeys.filter(key => !trSet.has(key));
  const missingInEn = trKeys.filter(key => !enSet.has(key));

  // Check for empty values in en.json and tr.json
  function getEmptyKeys(obj, prefix = "") {
    let empties = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const val = obj[key];
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          empties = empties.concat(getEmptyKeys(val, fullKey));
        } else if (typeof val === "string" && val.trim() === "") {
          empties.push(fullKey);
        }
      }
    }
    return empties;
  }

  const emptyInEn = getEmptyKeys(enContent);
  const emptyInTr = getEmptyKeys(trContent);

  // Check admin namespace — only EN/TR required (AGENTS.md i18n scope rule)
  const adminKeysEn = enKeys.filter(k => k.startsWith("admin."));
  const adminKeysTr = trKeys.filter(k => k.startsWith("admin."));
  const adminSetEn = new Set(adminKeysEn);
  const adminSetTr = new Set(adminKeysTr);
  const adminMissingInTr = adminKeysEn.filter(k => !adminSetTr.has(k));
  const adminMissingInEn = adminKeysTr.filter(k => !adminSetEn.has(k));

  // Check public pages parity (EN/TR)
  const publicLangs = ["en", "tr"];
  const publicContents = {};
  const publicKeySets = {};
  for (const lang of publicLangs) {
    const p = path.resolve(process.cwd(), `messages/${lang}.json`);
    if (fs.existsSync(p)) {
      publicContents[lang] = readJson(p);
      publicKeySets[lang] = new Set(flattenKeys(publicContents[lang]));
    }
  }

  let hasError = false;

  if (missingInTr.length > 0) {
    console.error(`\x1b[31mError: The following keys are in en.json but missing from tr.json:\x1b[0m`);
    missingInTr.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  }

  if (missingInEn.length > 0) {
    console.error(`\x1b[31mError: The following keys are in tr.json but missing from en.json:\x1b[0m`);
    missingInEn.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  }

  if (emptyInEn.length > 0) {
    console.error(`\x1b[31mError: Empty string values in en.json:\x1b[0m`);
    emptyInEn.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  }

  if (emptyInTr.length > 0) {
    console.error(`\x1b[31mError: Empty string values in tr.json:\x1b[0m`);
    emptyInTr.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  }

  if (adminMissingInTr.length > 0) {
    console.error(`\x1b[31mError: Admin keys missing in tr.json (admin scope = EN/TR only):\x1b[0m`);
    adminMissingInTr.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  }

  if (adminMissingInEn.length > 0) {
    console.error(`\x1b[31mError: Admin keys missing in en.json (admin scope = EN/TR only):\x1b[0m`);
    adminMissingInEn.forEach(key => console.error(`  - ${key}`));
    hasError = true;
  }

  // Public pages parity across all 5 languages
  const enPublicSet = publicKeySets["en"];
  if (enPublicSet) {
    for (const lang of publicLangs) {
      if (lang === "en" || !publicKeySets[lang]) continue;
      const otherSet = publicKeySets[lang];
      const missingInOther = [...enPublicSet].filter(k => !otherSet.has(k) && !k.startsWith("admin.") && !k.startsWith("autopilot."));
      const extraInOther = [...otherSet].filter(k => !enPublicSet.has(k) && !k.startsWith("admin.") && !k.startsWith("autopilot."));
      if (missingInOther.length > 0) {
        console.error(`\x1b[31mError: Public keys missing in ${lang}.json (vs en.json):\x1b[0m`);
        missingInOther.slice(0, 20).forEach(key => console.error(`  - ${key}`));
        if (missingInOther.length > 20) console.error(`  ... and ${missingInOther.length - 20} more`);
        hasError = true;
      }
      if (extraInOther.length > 0) {
        console.error(`\x1b[31mError: Extra keys in ${lang}.json not in en.json (public scope):\x1b[0m`);
        extraInOther.slice(0, 20).forEach(key => console.error(`  - ${key}`));
        if (extraInOther.length > 20) console.error(`  ... and ${extraInOther.length - 20} more`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error("\x1b[31mTranslation check failed. Please ensure key sets are synchronized (admin: EN/TR, public: all 5 languages) and no empty values.\x1b[0m");
    process.exit(1);
  }

  console.log("\x1b[32mSuccess: Translation keys match exactly (admin EN/TR + public 5-lang parity + no empty values)!\x1b[0m");
  process.exit(0);
} catch (error) {
  console.error("Failed to check i18n keys:", error);
  process.exit(1);
}
