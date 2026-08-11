const fs = require("fs");
const path = require("path");

const replacements = [
  {
    file: "src/app/[locale]/admin/page.tsx",
    replacements: [
      { old: '"$0"', new: '"ölçülmedi"' },
      { old: '"12 ms"', new: '"ölçülmedi"' },
      { old: '"92.4%"', new: '"ölçülmedi"' },
      { old: '"24/24 Active"', new: '"ölçülmedi"' },
      { old: '"100% Strict"', new: '"ölçülmedi"' },
      { old: '"+38.5%"', new: '"ölçülmedi"' },
      { old: '"68.2%"', new: '"ölçülmedi"' },
      { old: '"4/4 Approved"', new: '"ölçülmedi"' },
    ],
  },
  {
    file: "src/app/[locale]/admin/strategy/page.tsx",
    replacements: [{ old: '"89.8 / 100"', new: '"ölçülmedi"' }],
  },
  {
    file: "src/components/admin/AiBudgetTransparencyScore.tsx",
    replacements: [{ old: '"92.4%"', new: '"ölçülmedi"' }],
  },
  {
    file: "src/components/admin/ai-velocity-widget.tsx",
    replacements: [{ old: '"+42.8%"', new: '"ölçülmedi"' }],
  },
  {
    file: "src/components/admin/geo-dashboard-client.tsx",
    replacements: [
      { old: '"88.5 / 100"', new: '"ölçülmedi"' },
      { old: '"64.2 / 100"', new: '"ölçülmedi"' },
      { old: '"58.0 / 100"', new: '"ölçülmedi"' },
      { old: '"51.5 / 100"', new: '"ölçülmedi"' },
    ],
  },
  {
    file: "src/components/admin/test-360-meter.tsx",
    replacements: [
      { old: ">100%<", new: ">ölçülmedi<" },
      { old: '"100%"', new: '"ölçülmedi"' },
      { old: '"$0.00"', new: '"ölçülmedi"' },
    ],
  },
];

for (const { file, replacements: reps } of replacements) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, "utf8");
  for (const rep of reps) {
    content = content.replace(rep.old, rep.new);
    // some might be without quotes
    if (rep.old.startsWith('"') && rep.old.endsWith('"')) {
      content = content.replace(rep.old.slice(1, -1), "ölçülmedi");
    }
  }
  fs.writeFileSync(filePath, content);
}
console.log("Done");
