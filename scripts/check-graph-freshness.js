import fs from "fs";
import path from "path";

const graphReportPath = path.join(process.cwd(), "graphify-out", "GRAPH_REPORT.md");

if (!fs.existsSync(graphReportPath)) {
  console.error("❌ graphify-out/GRAPH_REPORT.md not found!");
  process.exit(1);
}

const stats = fs.statSync(graphReportPath);
const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

console.log(`📊 Knowledge Graph last updated: ${stats.mtime.toISOString()} (${ageInDays.toFixed(1)} days ago)`);

if (ageInDays > 7) {
  console.warn("⚠️ Knowledge Graph is stale (>7 days). Consider running 'graphify update .'");
} else {
  console.log("✅ Knowledge Graph is fresh.");
}
