const fs = require("fs");

const path = "messages/tr.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

function fixString(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/Å/g, "Ş")
    .replace(/Â°/g, "°")
    .replace(/ResmÃ®/g, "Resmî")
    .replace(/resmÃ®/g, "resmî")
    .replace(/Ã®/g, "î")
    .replace(/Â/g, ""); // any orphaned Â before punctuation/spaces
}

function traverse(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = fixString(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      traverse(obj[key]);
    }
  }
}

traverse(data);

fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("Finished AST fixing orphaned mojibake in tr.json");
