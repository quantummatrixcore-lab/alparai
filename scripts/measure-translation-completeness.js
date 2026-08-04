const fs = require("fs");
const path = require("path");

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
  if (str.length < 3) return false;
  if (str.startsWith("http://") || str.startsWith("https://")) return false;
  if (str === "ALPAR AI") return false;
  if (!/[a-zA-Z]/.test(str)) return false;
  return true;
}

function measureLanguage(lang) {
  const enPath = path.join(__dirname, "../messages/en.json");
  const targetPath = path.join(__dirname, `../messages/${lang}.json`);

  if (!fs.existsSync(targetPath)) {
    console.error(`Language file missing for ${lang}`);
    return;
  }

  const enObj = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const targetObj = JSON.parse(fs.readFileSync(targetPath, "utf8"));

  const enPairs = getKeyValuePairs(enObj);
  const targetPairsMap = new Map(getKeyValuePairs(targetObj).map((p) => [p.key, p.val]));

  let totalTranslatable = 0;
  let missingOrCopied = 0;

  for (const { key, val } of enPairs) {
    if (!isTranslatable(val)) {
      continue;
    }
    totalTranslatable++;
    const targetVal = targetPairsMap.get(key);
    if (!targetVal || targetVal === val) {
      missingOrCopied++;
    }
  }

  const completed = totalTranslatable - missingOrCopied;
  const percentage = totalTranslatable > 0 ? (completed / totalTranslatable) * 100 : 0;

  console.log(`[${lang.toUpperCase()}]`);
  console.log(`  Total translatable keys: ${totalTranslatable}`);
  console.log(`  Untranslated / Identical: ${missingOrCopied}`);
  console.log(`  Translated keys:          ${completed}`);
  console.log(`  Completeness:             ${percentage.toFixed(2)}%`);
}

function main() {
  const languages = ["de", "fr", "ru", "tr"];
  for (const lang of languages) {
    measureLanguage(lang);
  }
}

main();
