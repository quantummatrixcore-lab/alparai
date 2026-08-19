const fs = require("fs");
const files = [
  "src/app/[locale]/admin/advisory-board/page.tsx",
  "src/app/[locale]/admin/analytics-hub/k-benchmark/page.tsx",
  "src/app/[locale]/admin/dsar/page.tsx",
  "src/app/[locale]/admin/experts/page.tsx",
  "src/app/[locale]/admin/investors/page.tsx",
  "src/app/[locale]/admin/marketing/page.tsx",
  "src/app/[locale]/admin/metrics-hub/ai-pulse/page.tsx",
  "src/components/admin/grants-list.tsx",
  "src/components/admin/linkedin-contacts-list.tsx",
  "src/components/admin/platforms-list.tsx",
];
files.forEach((f) => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, "utf8");
    c = c.replace(
      /import \{ MetricCard \} from \"@\/components\/admin\/metric-card\";/g,
      'import { TrendMetricCard } from "@/components/admin/metric-card";',
    );
    c = c.replace(/<MetricCard/g, "<TrendMetricCard");
    fs.writeFileSync(f, c);
  }
});
console.log("Done");
