import fs from "fs";
import path from "path";

const files = [
  "src/actions/scout-intel.ts",
  "src/app/api/twins/chat/route.ts",
  "src/app/api/v1/personas/[twinId]/completions/route.ts",
  "src/app/[locale]/digital-twins/page.tsx",
  "src/app/[locale]/twins-leaderboard/page.tsx",
  "src/app/[locale]/twins-leaderboard/twins-leaderboard-client.tsx",
  "src/components/admin/strategy/advisor-roster.tsx",
  "src/components/admin/founder-admin-panel.tsx",
  "src/components/dashboard/ecosystem-dashboard.tsx",
  "src/components/admin/vc-readiness-widget.tsx",
  "src/lib/agent-os/scouts/ecosystem-scout.ts",
];

for (const file of files) {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, "utf8");
    content = content.replace(/\/\/ @ts-nocheck\r?\n/g, "");
    const lines = content.split(/\r?\n/);
    const newLines = lines.filter((line) => !line.includes("/lib/agent-os/"));
    fs.writeFileSync(p, newLines.join("\n"));
    console.log(`Processed ${file}`);
  }
}
