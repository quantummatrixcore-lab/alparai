const fs = require("fs");
const files = [
  "next.config.mjs",
  "refactor-kanban.cjs",
  "scripts/replace.js",
  "src/app/[locale]/admin/advisor/page.tsx",
  "src/components/admin/AiBudgetTransparencyScore.tsx",
  "src/components/admin/audit-log-client.tsx",
  "src/components/admin/master-plan-client.tsx",
  "src/components/admin/moderation-queue.tsx",
  "src/components/deck/pitch-deck.tsx",
  "src/types/database_utf8.ts",
  ".eslintignore",
  "messages/en.json",
  "messages/tr.json",
  "messages/de.json",
  "messages/fr.json",
  "messages/ru.json",
];

let totalFixed = 0;
files.forEach((f) => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f);
    let modified = false;

    // 1. Remove BOM
    if (content[0] === 0xef && content[1] === 0xbb && content[2] === 0xbf) {
      console.log("Removed BOM from " + f);
      content = content.slice(3);
      modified = true;
    }

    let text = content.toString("utf8");
    let orig = text;

    // 2. Safe Mojibake Replace
    text = text
      .replace(/Ä±/g, "ı")
      .replace(/Ã¼/g, "ü")
      .replace(/Ã¶/g, "ö")
      .replace(/ÅŸ/g, "ş")
      .replace(/Ã§/g, "ç")
      .replace(/ÄŸ/g, "ğ");
    text = text
      .replace(/Ä°/g, "İ")
      .replace(/Ãœ/g, "Ü")
      .replace(/Ã–/g, "Ö")
      .replace(/Åž/g, "Ş")
      .replace(/Ã‡/g, "Ç")
      .replace(/Äž/g, "Ğ");
    text = text
      .replace(/—/g, "—")
      .replace(/–/g, "–")
      .replace(/’/g, "’")
      .replace(/“/g, "“")
      .replace(/”\x9D/g, "”");
    text = text
      .replace(/”/g, "”")
      .replace(/•/g, "•")
      .replace(/â/g, "â")
      .replace(/âˆ’/g, "−")
      .replace(/â† /g, "←");

    if (orig !== text) {
      console.log("Fixed mojibake in " + f);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(f, text, "utf8");
      totalFixed++;
    }
  }
});
console.log("Total files modified:", totalFixed);
