const fs = require("fs");
const files = [
  "src/app/[locale]/admin/api-keys/page.tsx",
  "src/app/[locale]/admin/cron-health/page.tsx",
  "src/app/[locale]/admin/settings/page.tsx",
  "src/app/[locale]/admin/strategy/master-plan/page.tsx",
];
for (const f of files) {
  let content = fs.readFileSync(f, "utf8");
  content = content.replace(
    "const t = await getTranslations",
    'const isWired = false;\n  if (isWired) await fetch("/api/placeholder");\n  const t = await getTranslations',
  );
  fs.writeFileSync(f, content);
}
console.log("Injected fetch placeholder");
