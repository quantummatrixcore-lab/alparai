const fs = require("fs");
const en = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
const de = JSON.parse(fs.readFileSync("messages/de.json", "utf8"));

function findIdenticalKeys(obj1, obj2, path = "") {
  let identical = [];
  for (const key in obj1) {
    if (
      path === "" &&
      (key === "admin" || key === "autopilot" || key === "badge" || key === "takedown")
    ) {
      continue;
    }
    const newPath = path ? `${path}.${key}` : key;
    if (typeof obj1[key] === "object" && obj1[key] !== null) {
      identical = identical.concat(findIdenticalKeys(obj1[key], obj2[key] || {}, newPath));
    } else {
      if (obj1[key] === obj2[key]) {
        identical.push({ key: newPath, en: obj1[key] });
      }
    }
  }
  return identical;
}

const identical = findIdenticalKeys(en, de);
console.log(JSON.stringify(identical, null, 2));
