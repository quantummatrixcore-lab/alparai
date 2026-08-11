const fs = require("fs");
const files = [
  "src/app/[locale]/admin/ai-hub/page.tsx",
  "src/app/[locale]/admin/analytics-hub/page.tsx",
  "src/app/[locale]/admin/cockpit/page.tsx",
  "src/app/[locale]/admin/metrics-hub/page.tsx",
  "src/app/[locale]/admin/page.tsx",
  "src/app/[locale]/admin/question-bank/page.tsx",
];

files.forEach((f) => {
  if (!fs.existsSync(f)) {
    console.log("Not found:", f);
    return;
  }
  let content = fs.readFileSync(f, "utf8");
  if (content.includes("requireAdmin")) {
    console.log("Already fixed:", f);
    return;
  }

  if (!content.includes("import { requireAdmin }")) {
    const importRegex = /import\s+.*?\n/g;
    let match;
    let lastImportIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    content =
      content.slice(0, lastImportIndex) +
      `import { requireAdmin } from '@/lib/auth';\n` +
      content.slice(lastImportIndex);
  }

  content = content.replace(/export\s+default\s+async\s+function\s+\w+\(.*?\)\s*\{/, (match) => {
    return match + "\n  await requireAdmin();";
  });

  fs.writeFileSync(f, content);
  console.log("Fixed", f);
});
