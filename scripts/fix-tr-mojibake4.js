const fs = require("fs");

const path = "messages/tr.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

const map = {
  "Ã§": "ç",
  "Ã‡": "Ç",
  "Ä±": "ı",
  "Ä°": "İ",
  ÄŸ: "ğ",
  Äž: "Ğ",
  "Ã¶": "ö",
  "Ã–": "Ö",
  "Ã¼": "ü",
  Ãœ: "Ü",
  ÅŸ: "ş",
  Åž: "Ş",
  "Ã¢": "â",
  "Ã‚": "Â",
  "Ã—": "×",
  "Â©": "©",
  "Â§": "§",
  "Â·": "·",
  "ÃƒÂ‡": "Ç",
  "Ã…ÂŸ": "ş",
  "ÃƒÂ¶": "ö",
  "ÃƒÂ¼": "ü",
  "ÃƒÂ§": "ç",
  ÃƒÂ: "ı",
  "Ã…Âž": "Ş",
  "ÃƒÂ¢": "â",
  ÃƒÂœ: "Ü",
  "ÃƒÂ–": "Ö",
  "resmÃ®": "resmî",
};

function traverseAndFix(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      let val = obj[key];
      for (const [bad, good] of Object.entries(map)) {
        val = val.split(bad).join(good);
      }
      obj[key] = val;
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      traverseAndFix(obj[key]);
    }
  }
}

traverseAndFix(data);

fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("tr.json updated with AST replacement");
