const fs = require("fs");
const path = require("path");

const messagesDir = path.join(__dirname, "messages");
const enPath = path.join(messagesDir, "en.json");
const trPath = path.join(messagesDir, "tr.json");
const dePath = path.join(messagesDir, "de.json");
const frPath = path.join(messagesDir, "fr.json");
const ruPath = path.join(messagesDir, "ru.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

function syncKeys(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const target = JSON.parse(fs.readFileSync(targetPath, "utf8"));
  let modified = false;

  function traverse(enObj, targetObj) {
    for (const key in enObj) {
      // Admin is EN/TR only
      if (key === "admin" && path.basename(targetPath) !== "tr.json") continue;

      if (typeof enObj[key] === "object" && enObj[key] !== null) {
        if (!targetObj[key]) {
          targetObj[key] = {};
          modified = true;
        }
        traverse(enObj[key], targetObj[key]);
      } else {
        if (targetObj[key] === undefined || targetObj[key] === "") {
          targetObj[key] = enObj[key]; // fallback to English
          modified = true;
        }
      }
    }
  }

  traverse(en, target);

  if (modified) {
    fs.writeFileSync(targetPath, JSON.stringify(target, null, 2) + "\n", "utf8");
    console.log(`Updated ${path.basename(targetPath)}`);
  }
}

syncKeys(trPath);
syncKeys(dePath);
syncKeys(frPath);
syncKeys(ruPath);
