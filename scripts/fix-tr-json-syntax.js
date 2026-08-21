const fs = require("fs");

let content = fs.readFileSync("messages/tr.json", "utf8");

// Fix known JSON syntax errors in tr.json
content = content.replace(
  '"alpar_ai_360_manage_surface": "ALPAR AI 360Â° Manage Surface "¢",',
  '"alpar_ai_360_manage_surface": "ALPAR AI 360Â° Manage Surface",',
);
content = content.split('"¦",').join('...",');
content = content.split('"¢ ').join("— ");

let passes = false;
while (!passes) {
  try {
    JSON.parse(content);
    passes = true;
    console.log("JSON is valid!");
  } catch (e) {
    let match = e.message.match(/line (\d+)/);
    if (match) {
      let lineIdx = parseInt(match[1]) - 1;
      let lines = content.split("\n");
      console.log("Error on line", lineIdx + 1, ":", lines[lineIdx]);

      // Auto-fix by removing all double quotes that are NOT at the start/end of the string value
      let line = lines[lineIdx];
      let colonIdx = line.indexOf(":");
      if (colonIdx > -1) {
        let keyPart = line.substring(0, colonIdx + 1);
        let valPart = line.substring(colonIdx + 1);

        // Keep the first and last quote of valPart
        let firstQuote = valPart.indexOf('"');
        let lastQuote = valPart.lastIndexOf('"');

        if (firstQuote > -1 && lastQuote > firstQuote) {
          let middle = valPart.substring(firstQuote + 1, lastQuote);
          middle = middle.replace(/"/g, "'"); // replace inner quotes with single quotes
          valPart = valPart.substring(0, firstQuote + 1) + middle + valPart.substring(lastQuote);
          lines[lineIdx] = keyPart + valPart;
          content = lines.join("\n");
          console.log("Fixed to:", lines[lineIdx]);
        } else {
          console.log("Could not auto-fix");
          break;
        }
      } else {
        console.log("No colon found");
        break;
      }
    } else {
      console.error("Unknown error format:", e.message);
      break;
    }
  }
}

fs.writeFileSync("messages/tr.json", content, "utf8");
