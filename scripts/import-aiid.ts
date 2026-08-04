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

const VULCANLAB_CSV_URL =
  "https://raw.githubusercontent.com/VulcanLab/genai-security-incidents/main/incidents_2024-2026.csv";

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
  let csvText = "";

  console.log(`Fetching AIID curated dataset from: ${VULCANLAB_CSV_URL}`);
  try {
    const res = await fetch(VULCANLAB_CSV_URL);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    csvText = await res.text();
  } catch (err: any) {
    console.error(`Failed to fetch online CSV: ${err.message}. Using local mock data...`);
    csvText = `ID,Stream,Source category,Date,Year,Severity,CVSS,Attack vector,OWASP LLM,OWASP ASI,MITRE ATLAS,NIST AI RMF,CVE IDs,AIID ID,Mapped threats,Quality tier,Title,Affected,Primary reference URL,Description
INC-01411,Realized,real-world,2026-03,2026,Critical,,no,"LLM06, LLM09","ASI08, ASI09, ASI10","AML.T0039",,,,,,curated,"Meta Rogue AI Agent Sev-1 — autonomous agent posts incorrect advice, exposing proprietary data",Meta — internal engineering forum,https://techcrunch.com/2026/03/18/meta-is-having-trouble-with-rogue-ai-agents/,"An autonomous AI agent inside Meta posted incorrect technical advice on an internal forum without human approval. An employee followed it, exposing proprietary code, business strategies, and user-related datasets to unauthorized engineers."`;
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.error("Empty or invalid CSV file.");
    process.exit(1);
  }

  // Find header dynamically
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (
      row.some(
        (cell) => cell.toLowerCase().trim() === "id" || cell.toLowerCase().trim() === "aiid id",
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

  // Map indexes
  const idIdx = headers.indexOf("id");
  const aiidIdx = headers.indexOf("aiid id");
  const titleIdx = headers.indexOf("title");
  const descIdx = headers.indexOf("description");
  const dateIdx = headers.indexOf("date");
  const severityIdx = headers.indexOf("severity");
  const sourceUrlIdx = headers.indexOf("primary reference url");
  const affectedIdx = headers.indexOf("affected");
  const sourceCatIdx = headers.indexOf("source category");
  const qualityTierIdx = headers.indexOf("quality tier");

  let importedCount = 0;
  let skippedCount = 0;

  console.log(
    `Processing ${rows.length - headerIndex - 1} incidents... Mode: ${dryRun ? "DRY-RUN" : "EXECUTE"}`,
  );

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i]!;
    if (row.length < 5 || !row[titleIdx >= 0 ? titleIdx : 0]) {
      continue;
    }

    if (importedCount >= 200) {
      break;
    }

    const rawSourceCat = sourceCatIdx >= 0 ? row[sourceCatIdx]?.toLowerCase().trim() : "";
    const rawQualityTier = qualityTierIdx >= 0 ? row[qualityTierIdx]?.toLowerCase().trim() : "";

    // Only import real-world curated or reviewed incidents
    if (
      rawSourceCat !== "real-world" ||
      (rawQualityTier !== "curated" && rawQualityTier !== "reviewed")
    ) {
      skippedCount++;
      continue;
    }

    const rawId =
      (aiidIdx >= 0 ? row[aiidIdx] : "") ||
      (idIdx >= 0 ? row[idIdx] : "") ||
      `AIID-AUTO-${i}` ||
      `AIID-AUTO-${i}`;
    const rawTitle = (titleIdx >= 0 ? row[titleIdx] : "") || "";
    const rawDesc = (descIdx >= 0 ? row[descIdx] : "") || "";
    const rawDate = (dateIdx >= 0 ? row[dateIdx] : null) || null;
    const rawSourceUrl = (sourceUrlIdx >= 0 ? row[sourceUrlIdx] : null) || null;
    const rawSeverity = (severityIdx >= 0 ? row[severityIdx] : "medium") || "medium";
    const rawAffected = (affectedIdx >= 0 ? row[affectedIdx] : null) || null;

    const category = mapCategory(rawTitle + " " + rawDesc);

    // Parse severity
    let severity = "medium";
    const cleanSev = rawSeverity.toLowerCase().trim();
    if (
      cleanSev === "critical" ||
      cleanSev === "high" ||
      cleanSev === "medium" ||
      cleanSev === "low"
    ) {
      severity = cleanSev;
    } else {
      severity = inferSeverity(rawTitle, rawDesc);
    }

    if (severity === "low" || severity === "medium") {
      skippedCount++;
      continue;
    }

    const titleMasked = cleanTextAndMaskPII(rawTitle).masked;
    const descMasked = cleanTextAndMaskPII(rawDesc).masked;

    let incidentDate = new Date().toISOString().split("T")[0];
    if (rawDate) {
      const cleanDate = rawDate.replace(/[^\d-]/g, "").trim();
      if (cleanDate.length === 7) {
        // format like 2026-03
        incidentDate = `${cleanDate}-01`;
      } else if (cleanDate.length === 4) {
        incidentDate = `${cleanDate}-01-01`;
      } else if (cleanDate && !isNaN(Date.parse(cleanDate))) {
        incidentDate = new Date(cleanDate).toISOString().split("T")[0];
      }
    }

    // Infer custom provider name if present
    let providerName = null;
    if (rawAffected) {
      providerName = rawAffected.split("—")[0]?.trim() || rawAffected.split("-")[0]?.trim() || null;
    }

    const payload = {
      title: rawTitle,
      title_masked: titleMasked,
      description: rawDesc,
      description_masked: descMasked,
      category,
      severity,
      status: "pending_review",
      incident_date: incidentDate,
      source_url: rawSourceUrl ? rawSourceUrl.trim() : null,
      incident_source: "aiid_import",
      import_external_id: String(rawId),
      import_attribution: "Source: AI Incident Database (Open/Stanford License)",
      language: "en",
      model_custom_name: null,
      provider_custom_name: providerName,
    };

    if (dryRun) {
      console.log(
        `[DRY-RUN] Would import: "${payload.title}" (${payload.category} - ${payload.severity}) - ExtID: ${payload.import_external_id}`,
      );
      importedCount++;
    } else {
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
  console.error("Fatal Error running AIID Import:", err);
});
