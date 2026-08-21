const fs = require("fs");
const path = "messages/tr.json";

// Read as string
let content = fs.readFileSync(path, "utf8");

// The file was likely saved as UTF-8 while the editor thought it was ANSI, or double-encoded.
// We can decode it properly:
try {
  // Convert double-encoded UTF-8 back to real UTF-8
  // If we take the string, turn it into latin1 bytes, and decode as utf8...
  const bytes = Buffer.from(content, "latin1");
  const decoded = bytes.toString("utf8");

  // Let's check if the decoded version looks better (no Ã)
  if (!decoded.includes("Ã") && !decoded.includes("Å")) {
    console.log("Latin1 -> UTF8 decoding worked!");
    content = decoded;
  } else {
    console.log("Latin1 -> UTF8 didn't fix it all, applying manual regex replacements...");
    // Fallback manual mapping for common artifacts
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
    };
    for (const [bad, good] of Object.entries(map)) {
      content = content.split(bad).join(good);
    }
  }
} catch (e) {
  console.log("Decoding error, doing manual replace.");
}

// Write back with UTF-8
fs.writeFileSync(path, content, "utf8");
console.log("tr.json updated");
