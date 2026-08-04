import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

function levenshtein(s: string, t: string): number {
  if (s === t) return 0;
  if (s.length === 0) return t.length;
  if (t.length === 0) return s.length;

  const v0 = new Array(t.length + 1);
  const v1 = new Array(t.length + 1);

  for (let i = 0; i < v0.length; i++) v0[i] = i;

  for (let i = 0; i < s.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < t.length; j++) {
      const cost = s[i] === t[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j < v0.length; j++) v0[j] = v1[j];
  }
  return v1[t.length];
}

function normalizedDistance(a: string, b: string): number {
  const distance = levenshtein(a.toLowerCase().trim(), b.toLowerCase().trim());
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 0 : distance / maxLength;
}

async function runAudit() {
  console.log("Fetching incidents from database...");
  const { data: incidents, error } = await supabase
    .from("incidents")
    .select(
      "id, title, description, category, severity, incident_date, source_url, provider_custom_name, ai_provider_id",
    );

  if (error) {
    console.error("Error fetching incidents:", error.message);
    process.exit(1);
  }

  if (!incidents || incidents.length === 0) {
    console.log("No incidents found in database.");
    process.exit(0);
  }

  console.log(`Total incidents fetched: ${incidents.length}\n`);

  const flaggedShortDescription: any[] = [];
  const flaggedMissingSourceUrl: any[] = [];
  const flaggedProviderGap: any[] = [];
  const flaggedDuplicates: any[] = [];

  // 1. Descriptions < 50 chars
  // 2. Missing source_url
  // 3. Provider mapping gaps
  for (const inc of incidents) {
    const desc = inc.description || "";
    if (desc.trim().length < 50) {
      flaggedShortDescription.push(inc);
    }

    if (!inc.source_url || !inc.source_url.trim()) {
      flaggedMissingSourceUrl.push(inc);
    }

    if (inc.provider_custom_name && !inc.ai_provider_id) {
      flaggedProviderGap.push(inc);
    }
  }

  // 4. Duplicate titles (Levenshtein distance < 0.2)
  console.log("Analyzing title similarity...");
  for (let i = 0; i < incidents.length; i++) {
    for (let j = i + 1; j < incidents.length; j++) {
      const incA = incidents[i]!;
      const incB = incidents[j]!;
      const dist = normalizedDistance(incA.title, incB.title);
      if (dist < 0.2) {
        flaggedDuplicates.push({
          incA: { id: incA.id, title: incA.title },
          incB: { id: incB.id, title: incB.title },
          distance: dist.toFixed(4),
        });
      }
    }
  }

  // 5. Category distribution
  const categoryCounts: Record<string, number> = {};
  for (const inc of incidents) {
    const cat = inc.category || "unknown";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => {
    const percentage = (count / incidents.length) * 100;
    let status = "OK";
    if (percentage > 40) status = "⚠️ TOO HIGH (>40%)";
    if (percentage < 2) status = "⚠️ TOO LOW (<2%)";
    return { category, count, percentage: percentage.toFixed(2) + "%", status };
  });

  // 6. Date range coverage (spread)
  const years: Record<string, number> = {};
  let minDate: string | null = null;
  let maxDate: string | null = null;
  for (const inc of incidents) {
    if (inc.incident_date) {
      if (!minDate || inc.incident_date < minDate) minDate = inc.incident_date;
      if (!maxDate || inc.incident_date > maxDate) maxDate = inc.incident_date;
      const year = new Date(inc.incident_date).getFullYear().toString();
      years[year] = (years[year] || 0) + 1;
    } else {
      years["unknown"] = (years["unknown"] || 0) + 1;
    }
  }

  // Print Summary Report
  console.log("=== INCIDENT QUALITY AUDIT SUMMARY ===");
  console.log(`Total Incidents Checked: ${incidents.length}`);
  console.log(`Date Range: ${minDate || "N/A"} to ${maxDate || "N/A"}`);
  console.log("\n--- Categories Distribution ---");
  console.table(categoryDistribution);

  console.log("\n--- Date Distribution ---");
  console.table(Object.entries(years).map(([year, count]) => ({ year, count })));

  console.log("\n--- Quality Gaps Detected ---");
  console.log(`1. Descriptions < 50 characters: ${flaggedShortDescription.length}`);
  console.log(`2. Missing Source URLs:          ${flaggedMissingSourceUrl.length}`);
  console.log(`3. Provider Mapping Gaps:        ${flaggedProviderGap.length}`);
  console.log(`4. Potential Title Duplicates:   ${flaggedDuplicates.length}`);

  if (flaggedShortDescription.length > 0) {
    console.log("\n=== DETAILS: Short Descriptions (first 10) ===");
    flaggedShortDescription.slice(0, 10).forEach((inc) => {
      console.log(
        `- [${inc.id}] Title: "${inc.title}" (Length: ${(inc.description || "").length})`,
      );
    });
  }

  if (flaggedMissingSourceUrl.length > 0) {
    console.log("\n=== DETAILS: Missing Source URLs (first 10) ===");
    flaggedMissingSourceUrl.slice(0, 10).forEach((inc) => {
      console.log(`- [${inc.id}] Title: "${inc.title}"`);
    });
  }

  if (flaggedProviderGap.length > 0) {
    console.log("\n=== DETAILS: Provider Mapping Gaps (first 10) ===");
    flaggedProviderGap.slice(0, 10).forEach((inc) => {
      console.log(`- [${inc.id}] Title: "${inc.title}" | Provider: "${inc.provider_custom_name}"`);
    });
  }

  if (flaggedDuplicates.length > 0) {
    console.log("\n=== DETAILS: Potential Duplicates (first 10) ===");
    flaggedDuplicates.slice(0, 10).forEach((d) => {
      console.log(
        `- Match (Dist: ${d.distance}):\n  A: [${d.incA.id}] "${d.incA.title}"\n  B: [${d.incB.id}] "${d.incB.title}"`,
      );
    });
  }
}

runAudit().catch((err) => {
  console.error("Audit failed with error:", err);
  process.exit(1);
});
