import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MESSAGES_DIR = path.join(__dirname, "../messages");
const EN_PATH = path.join(MESSAGES_DIR, "en.json");

function getKeyValuePairs(obj, prefix = "") {
  let pairs = [];
  for (const k in obj) {
    if (typeof obj[k] === "object" && obj[k] !== null) {
      pairs = pairs.concat(getKeyValuePairs(obj[k], prefix + k + "."));
    } else {
      pairs.push({ key: prefix + k, val: obj[k] });
    }
  }
  return pairs;
}

function isTranslatable(str) {
  if (typeof str !== "string") return false;
  if (str.trim().length < 3) return false;
  if (str.startsWith("http://") || str.startsWith("https://")) return false;
  if (str === "ALPAR AI") return false;
  if (!/[a-zA-Z]/.test(str)) return false;
  return true;
}

export function checkCompleteness(targetLocales = ["tr", "de", "fr", "ru"]) {
  if (!fs.existsSync(EN_PATH)) {
    console.error("en.json not found at " + EN_PATH);
    process.exit(1);
  }

  const enObj = JSON.parse(fs.readFileSync(EN_PATH, "utf8"));
  const enPairs = getKeyValuePairs(enObj);
  
  let translatableCount = 0;
  for (const { val } of enPairs) {
    if (isTranslatable(val)) {
      translatableCount++;
    }
  }
  const totalKeys = enPairs.length;

  const results = [];

  for (const locale of targetLocales) {
    const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    // If locale file doesn't exist, create it as a copy of en.json
    if (!fs.existsSync(localePath)) {
      fs.writeFileSync(localePath, JSON.stringify(enObj, null, 2), "utf8");
    }

    const localeObj = JSON.parse(fs.readFileSync(localePath, "utf8"));
    const localeMap = new Map(getKeyValuePairs(localeObj).map((p) => [p.key, p.val]));

    let translated = 0;
    for (const { key, val } of enPairs) {
      const localeVal = localeMap.get(key);
      if (!isTranslatable(val)) {
        // Non-translatable key (like URL, brand name) counts as translated
        translated++;
      } else if (localeVal && localeVal !== val) {
        translated++;
      }
    }

    const coveragePct = totalKeys > 0 ? ((translated / totalKeys) * 100).toFixed(1) + "%" : "0%";

    results.push({
      locale,
      total: totalKeys,
      translated,
      coverage: coveragePct,
    });
  }

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = checkCompleteness();
  console.log("i18n Completeness Report:");
  console.log(JSON.stringify(results, null, 2));
}
