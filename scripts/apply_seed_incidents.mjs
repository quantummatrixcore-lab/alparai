import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Helper to convert 'seed-001' into a stable valid UUID
function stringToUUID(str) {
  const hash = createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting ALPAR AI Incident Seeder...");

  // 1. Ensure Microsoft provider exists
  const microsoftId = stringToUUID("provider-microsoft");
  const { error: providerErr } = await supabase.from("ai_providers").upsert({
    id: microsoftId,
    slug: "microsoft",
    name: "Microsoft",
    description: "Creator of Copilot, Bing AI",
    website_url: "https://microsoft.com",
    logo_url: "/logos/providers/microsoft.svg",
    is_verified: true,
  });

  if (providerErr) {
    console.error("Error upserting Microsoft provider:", providerErr);
    process.exit(1);
  }
  console.log("✓ Microsoft provider verified in database.");

  // 2. Fetch all providers to build slug -> UUID map
  const { data: providers, error: fetchProvidersErr } = await supabase
    .from("ai_providers")
    .select("id, slug");

  if (fetchProvidersErr) {
    console.error("Error fetching providers:", fetchProvidersErr);
    process.exit(1);
  }

  const providersMap = {};
  for (const p of providers) {
    providersMap[p.slug] = p.id;
  }
  console.log(`✓ Loaded ${providers.length} providers from database.`);

  // 3. Read seed SQL file
  const seedPath = join("supabase", "migrations", "20260608000006_seed_incidents.sql");
  const sqlContent = readFileSync(seedPath, "utf8");
  const lines = sqlContent.split("\n");

  const incidentsToInsert = [];
  const stringRegex = /'([^']*(?:''[^']*)*)'/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("('seed-")) {
      const matches = [];
      let match;
      // Reset regex index
      stringRegex.lastIndex = 0;
      while ((match = stringRegex.exec(line)) !== null) {
        matches.push(match[1].replace(/''/g, "'")); // Clean double single-quotes
      }

      if (matches.length !== 13) {
        console.error(`Error on line ${i + 1}: Expected 13 quoted strings, found ${matches.length}`);
        console.error(line);
        process.exit(1);
      }

      const [
        rawId,
        title,
        description,
        titleMasked,
        descriptionMasked,
        rawProviderId,
        category,
        severity,
        incidentDate,
        locationCountry,
        language,
        status,
        piiCategoriesStr
      ] = matches;

      const providerSlug = rawProviderId.replace("provider-", "");
      const providerId = providersMap[providerSlug];

      if (!providerId) {
        console.error(`Error: Provider slug "${providerSlug}" not found in database! (from ${rawProviderId})`);
        process.exit(1);
      }

      // Base engagement counts (randomized slightly for realism)
      const views = Math.floor(Math.random() * 450) + 50;
      const upvotes = Math.floor(Math.random() * 40) + 5;
      const shares = Math.floor(Math.random() * 12);

      // Determine date offset for published_at to spread them out
      const seedIndex = parseInt(rawId.replace("seed-", ""), 10);
      const publishedAt = new Date(Date.now() - (50 - seedIndex) * 24 * 60 * 60 * 1000).toISOString();

      incidentsToInsert.push({
        id: stringToUUID(rawId),
        user_id: null,
        is_anonymous: false,
        title,
        description,
        title_masked: titleMasked,
        description_masked: descriptionMasked,
        ai_provider_id: providerId,
        category,
        severity,
        incident_date: incidentDate,
        location_country: locationCountry,
        language,
        status,
        published_at: publishedAt,
        views_count: views,
        upvotes_count: upvotes,
        shares_count: shares,
        comments_count: 0,
        contains_pii: false,
        pii_categories: [],
      });
    }
  }

  console.log(`✓ Parsed ${incidentsToInsert.length} incidents successfully from migration file.`);

  // 4. Upsert into supabase
  console.log("Upserting incidents to Supabase...");
  const { error: insertErr } = await supabase
    .from("incidents")
    .upsert(incidentsToInsert, { onConflict: "id" });

  if (insertErr) {
    console.error("Error upserting incidents:", insertErr);
    process.exit(1);
  }

  console.log("🎉 Seeding completed successfully! 50 incidents upserted.");
}

run().catch((err) => {
  console.error("Unhandled exception:", err);
  process.exit(1);
});
