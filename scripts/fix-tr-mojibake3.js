const fs = require("fs");
const path = "messages/tr.json";

let content = fs.readFileSync(path, "utf8");

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
};

for (const [bad, good] of Object.entries(map)) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(path, content, "utf8");
console.log("tr.json updated with manual replace");
