const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const replacements = {
  "/admin/ai-orchestrator": "/admin/ai-hub/orchestrator",
  "/admin/ai-pulse": "/admin/metrics-hub/ai-pulse",
  "/admin/analysis": "/admin/analytics-hub/analysis",
  "/admin/api-metrics": "/admin/metrics-hub/api-metrics",
  "/admin/autopilot/analytics": "/admin/ai-hub/autopilot/analytics",
  "/admin/autopilot": "/admin/ai-hub/autopilot",
  "/admin/expert-analysis": "/admin/analytics-hub/expert-analysis",
  "/admin/jules": "/admin/ai-hub/jules",
  "/admin/k-benchmark": "/admin/analytics-hub/k-benchmark",
  "/admin/login": "/login",
  "/admin/master-plan": "/admin/strategy/master-plan",
  "/admin/signals": "/admin/metrics-hub/signals",
  "/admin/slo-dashboard": "/admin/metrics-hub/slo-dashboard",
};

const files = execSync(
  "git ls-files src/app/[locale]/admin src/actions/admin src/components/admin src/lib",
)
  .toString()
  .split("\n")
  .filter(Boolean);
let changedCount = 0;
for (const f of files) {
  let content = fs.readFileSync(f, "utf8");
  let original = content;
  for (const [oldPath, newPath] of Object.entries(replacements)) {
    content = content.split('"' + oldPath + '"').join('"' + newPath + '"');
    content = content.split("`" + oldPath + "`").join("`" + newPath + "`");
    content = content.split("'" + oldPath + "'").join("'" + newPath + "'");
    content = content.split("`/${locale}" + oldPath + "`").join("`/${locale}" + newPath + "`");
    content = content.split("`/[locale]" + oldPath + "`").join("`/[locale]" + newPath + "`");
    content = content.split('"/[locale]' + oldPath + '"').join('"/[locale]' + newPath + '"');
  }
  if (content !== original) {
    fs.writeFileSync(f, content);
    changedCount++;
    console.log("Fixed", f);
  }
}
console.log("Total fixed:", changedCount);
