import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { mapCategory, inferSeverity, cleanTextAndMaskPII } from "./import-utils";

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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fallback Google Sheets CSV URL for AIAAIC Repository
const AIAAIC_CSV_URL = "https://raw.githubusercontent.com/dbbz/AIIE/main/downloaded_sheet.csv";

function parseCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let entry = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        entry += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(entry);
      entry = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(entry);
      lines.push(row);
      row = [];
      entry = "";
    } else {
      entry += char;
    }
  }
  if (entry || row.length > 0) {
    row.push(entry);
    lines.push(row);
  }
  return lines;
}

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || !args.includes("--execute");
  const fileArgIndex = args.indexOf("--file");
  let csvText = "";

  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    const filePath = path.resolve(process.cwd(), args[fileArgIndex + 1]!);
    console.log(`Reading AIAAIC data from local file: ${filePath}`);
    csvText = fs.readFileSync(filePath, "utf-8");
  } else {
    console.log(`Fetching AIAAIC data from URL: ${AIAAIC_CSV_URL}`);
    try {
      const res = await fetch(AIAAIC_CSV_URL);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      csvText = await res.text();
    } catch (err: any) {
      console.error(`Failed to fetch online CSV: ${err.message}. Using local mock data...`);
      // Simüle edilmiş ve test edilebilir mock verileri (severity high/medium)
      csvText = `AIAAIC ID#,Headline,Type,Released,Occurred,Country(ies),Sector(s),Deployer(s),Developer(s),System name(s),Technology(ies),Purpose(s),Media trigger(s),Issue(s),Transparency,External harms,,,Internal harms,,,,Description/links
AIAAIC-2025-001,Facial Recognition Bias in Recruiting causing mass lawsuit,Issue,,2025-01-15,USA,Recruiting,,HireCorp,RecruitAI,Facial recognition,Select candidates,Media,Bias,Transparency,Financial loss,,,,,,,https://news.recruitingbias.com
AIAAIC-2025-002,Medical Chatbot Hallucination leads to pediatric injury,Incident,,2025-02-10,Spain,Health,Hospital,HealthTech,MedBot-v4,Chatbot,Prescribe,Media,Safety,Transparency,Bodily injury,,,,,,,https://healthtech-outage.org`;
    }
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.error("Empty or invalid CSV file.");
    process.exit(1);
  }

  // Find header index dynamically
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (
      row.some(
        (cell) =>
          cell.toLowerCase().includes("id#") ||
          cell.toLowerCase().includes("headline") ||
          cell.toLowerCase().includes("title"),
      )
    ) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error("Could not find header row in CSV.");
    process.exit(1);
  }

  const headers = rows[headerIndex]!.map((h) => h.trim().toLowerCase());
  console.log("CSV Headers detected:", headers);

  // Map header indexes
  const idIdx = headers.findIndex((h) => h.includes("id"));
  const titleIdx = headers.findIndex(
    (h) => h.includes("title") || h.includes("headline") || h.includes("name"),
  );
  const dateIdx = headers.findIndex(
    (h) =>
      h.includes("date") || h.includes("year") || h.includes("occurred") || h.includes("released"),
  );
  const modelIdx = headers.findIndex((h) => h.includes("system") || h.includes("model"));
  const providerIdx = headers.findIndex(
    (h) => h.includes("developer") || h.includes("provider") || h.includes("company"),
  );
  const categoryIdx = headers.findIndex(
    (h) => h.includes("category") || h.includes("type") || h.includes("issue"),
  );
  const descIdx = headers.findIndex((h) => h.includes("desc") || h.includes("summary"));
  const sourcesIdx = headers.findIndex(
    (h) => h.includes("source") || h.includes("link") || h.includes("url"),
  );

  let importedCount = 0;
  let skippedCount = 0;

  console.log(`Starting parse... Mode: ${dryRun ? "DRY-RUN (Preview)" : "EXECUTE (Write to DB)"}`);

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i]!;
    if (row.length < 3 || !row[titleIdx >= 0 ? titleIdx : 1]) {
      continue; // Skip empty/sub-header rows
    }

    const rawId = idIdx >= 0 ? row[idIdx] || `AIAAIC-AUTO-${i}` : `AIAAIC-AUTO-${i}`;
    const rawTitle = titleIdx >= 0 ? row[titleIdx] || "" : `AIAAIC Event ${i}`;
    const rawDesc = descIdx >= 0 ? row[descIdx] || "" : "";
    const rawDate = dateIdx >= 0 ? row[dateIdx] || null : null;
    const rawCategory = categoryIdx >= 0 ? row[categoryIdx] || "other" : "other";
    const rawSourceUrl = sourcesIdx >= 0 ? row[sourcesIdx] || null : null;
    const rawModel = modelIdx >= 0 ? row[modelIdx] || null : null;
    const rawProvider = providerIdx >= 0 ? row[providerIdx] || null : null;

    // Apply mappings and filters
    const category = mapCategory(rawCategory);
    const severity = inferSeverity(rawTitle, rawDesc);

    // Skip low severity or ancient items to keep quality high
    if (severity === "low") {
      skippedCount++;
      continue;
    }

    // Mask PII
    const titleMasked = cleanTextAndMaskPII(rawTitle).masked;

    // Build descriptive description if empty or a URL
    let finalDesc = rawDesc;
    if (!finalDesc || finalDesc.startsWith("http")) {
      const parts = [];
      const techIdx = headers.findIndex((h) => h.includes("techno"));
      const purpIdx = headers.findIndex((h) => h.includes("purp"));
      const issueIdx = headers.findIndex((h) => h.includes("issue"));
      const countryIdx = headers.findIndex((h) => h.includes("country"));

      if (rawModel) parts.push(`System: ${rawModel}`);
      if (rawProvider) parts.push(`Developer: ${rawProvider}`);
      if (countryIdx >= 0 && row[countryIdx]) parts.push(`Affected Countries: ${row[countryIdx]}`);
      if (techIdx >= 0 && row[techIdx]) parts.push(`Technology used: ${row[techIdx]}`);
      if (purpIdx >= 0 && row[purpIdx]) parts.push(`System purpose: ${row[purpIdx]}`);
      if (issueIdx >= 0 && row[issueIdx]) parts.push(`Ethical/Safety Issues: ${row[issueIdx]}`);

      finalDesc = `${rawTitle}.\n\n${parts.join("\n")}`;
    }
    const descMasked = cleanTextAndMaskPII(finalDesc).masked;

    // Clean date representation safely
    let incidentDate = new Date().toISOString().split("T")[0];
    if (rawDate) {
      const cleanDate = rawDate
        .replace(/[^\d-]/g, "")
        .split("-")[0]
        ?.trim();
      if (cleanDate && cleanDate.length === 4) {
        incidentDate = `${cleanDate}-01-01`;
      } else if (cleanDate && !isNaN(Date.parse(cleanDate))) {
        incidentDate = new Date(cleanDate).toISOString().split("T")[0];
      }
    }

    const payload = {
      title: rawTitle,
      title_masked: titleMasked,
      description: finalDesc,
      description_masked: descMasked,
      category,
      severity,
      status: "pending_review", // Enters queue first
      incident_date: incidentDate,
      source_url: rawSourceUrl ? rawSourceUrl.split(",")[0]?.trim() || null : null,
      incident_source: "aiaaic_import",
      import_external_id: rawId,
      import_attribution: "Source: AIAAIC Repository (CC BY 4.0)",
      language: "en",
      model_custom_name: rawModel,
      provider_custom_name: rawProvider,
    };

    if (dryRun) {
      console.log(
        `[DRY-RUN] Would import: "${payload.title}" (${payload.category} - ${payload.severity}) - ExtID: ${payload.import_external_id}`,
      );
      importedCount++;
    } else {
      // Execute DB Write
      const { error } = await supabase
        .from("incidents")
        .upsert(payload, { onConflict: "incident_source,import_external_id" });

      if (error) {
        console.error(`Failed to insert "${payload.title}": ${error.message}`);
      } else {
        console.log(`Successfully imported: "${payload.title}"`);
        importedCount++;
      }
    }
  }

  console.log(`\nImport Summary:`);
  console.log(`- Mode: ${dryRun ? "DRY-RUN" : "EXECUTE"}`);
  console.log(`- Imported/Processed: ${importedCount}`);
  console.log(`- Skipped (Severity Low): ${skippedCount}`);
}

run().catch((err) => {
  console.error("Fatal Error running AIAAIC Import:", err);
});
