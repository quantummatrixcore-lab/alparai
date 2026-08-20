import fs from "fs";
import path from "path";
import { parseIncidentCSV } from "../src/lib/import/csv-parser";
import { importIncidents } from "../src/lib/import/incident-importer";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      if (line.startsWith("#") || !line.trim()) continue;
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        if (key) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const VULCANLAB_CSV_URL =
  "https://raw.githubusercontent.com/VulcanLab/genai-security-incidents/main/incidents_2024-2026.csv";

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || !args.includes("--execute");
  let csvText = "";

  console.log(`Fetching curated dataset from: ${VULCANLAB_CSV_URL}`);
  try {
    const res = await fetch(VULCANLAB_CSV_URL);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    csvText = (await res.text()).replace(/^\uFEFF/, "");
  } catch (err: any) {
    console.error(`Failed to fetch online CSV: ${err.message}.`);
    process.exit(1);
  }

  console.log("Parsing CSV...");
  const { rows, errors, total } = parseIncidentCSV(csvText, "aiid_import");

  if (errors.length > 0) {
    console.error(`Found ${errors.length} parsing errors. Showing first 5:`);
    console.error(errors.slice(0, 5));
  }

  console.log(`Successfully parsed ${rows.length} rows out of ${total} total.`);

  if (dryRun) {
    console.log("[DRY-RUN] Showing first 3 rows that would be imported:");
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
    console.log("Use --execute to actually import.");
    return;
  }

  console.log("Starting import process via incident-importer.ts with autoPublish: false...");

  const result = await importIncidents(rows, "aiid_import", { autoPublish: false });

  console.log("Import completed.");
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Skipped: ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`, result.errors);
  }
}

run().catch((err) => {
  console.error("Fatal Error running Import:", err);
});
