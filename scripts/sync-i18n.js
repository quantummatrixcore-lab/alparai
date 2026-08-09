const fs = require("fs");
const path = require("path");

const localesDir = path.join(__dirname, "../messages");
const baseFile = path.join(localesDir, "en.json");
const otherLocales = ["tr.json", "de.json", "fr.json", "ru.json"];

function syncStructure(baseObj, targetObj) {
  const result = {};
  for (const key in baseObj) {
    if (typeof baseObj[key] === "object" && baseObj[key] !== null && !Array.isArray(baseObj[key])) {
      result[key] = syncStructure(baseObj[key], targetObj?.[key] || {});
    } else {
      if (targetObj && targetObj[key] !== undefined && targetObj[key] !== "") {
        result[key] = targetObj[key];
      } else {
        result[key] = baseObj[key];
      }
    }
  }
  return result;
}

try {
  const baseContent = JSON.parse(fs.readFileSync(baseFile, "utf8"));

  let enUpdated = false;
  function fixEmptyInBase(obj, path = "") {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        fixEmptyInBase(obj[key], path ? `${path}.${key}` : key);
      } else if (obj[key] === "") {
        obj[key] = `[TODO: ${path ? `${path}.${key}` : key}]`;
        enUpdated = true;
      }
    }
  }
  fixEmptyInBase(baseContent);
  if (enUpdated) {
    fs.writeFileSync(baseFile, JSON.stringify(baseContent, null, 2) + "\n", "utf8");
    console.log("Fixed empty values in en.json");
  }

  for (const locale of otherLocales) {
    const localeFile = path.join(localesDir, locale);
    let targetContent = {};
    if (fs.existsSync(localeFile)) {
      targetContent = JSON.parse(fs.readFileSync(localeFile, "utf8"));
    }

    const synced = syncStructure(baseContent, targetContent);
    fs.writeFileSync(localeFile, JSON.stringify(synced, null, 2) + "\n", "utf8");
    console.log(`Synced ${locale}`);
  }
} catch (e) {
  console.error(e);
}
