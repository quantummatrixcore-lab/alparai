import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const envContent = readFileSync('.env.local', 'utf-8');
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)?.[1];

if (!serviceKey || !url) {
  console.error("Missing SUPABASE URL or SERVICE ROLE KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  console.log("🔍 Fetching incidents for sample dataset export...");

  const { data: incidents, error } = await supabase
    .from("incidents")
    .select(`
      id,
      title_masked,
      description_masked,
      category,
      severity,
      eu_act_risk_category,
      incident_date,
      views_count,
      upvotes_count,
      cross_audit_truth_score,
      cross_audit_confidence,
      is_expert,
      expert_fix,
      created_at,
      ai_providers (
        name,
        slug
      ),
      ai_models (
        name
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("❌ Error fetching incidents:", error.message);
    process.exit(1);
  }

  const out = (incidents ?? []).map((row) => {
    const provider = row.ai_providers;
    const model = row.ai_models;
    return {
      id: row.id,
      title: row.title_masked,
      description: row.description_masked,
      category: row.category,
      severity: row.severity,
      eu_act_risk_category: row.eu_act_risk_category ?? null,
      incident_date: row.incident_date,
      views: row.views_count ?? 0,
      upvotes: row.upvotes_count ?? 0,
      provider: provider ? { name: provider.name, slug: provider.slug } : null,
      model: model ? model.name : null,
      truth_score: row.cross_audit_truth_score ?? null,
      confidence: row.cross_audit_confidence ?? null,
      verification_level: row.is_expert ? "expert" : "community",
      expert_fix: row.expert_fix ?? null,
      created_at: row.created_at,
    };
  });

  // Ensure exports directory exists
  const exportsDir = 'exports';
  mkdirSync(exportsDir, { recursive: true });

  const filePath = join(exportsDir, 'sample-dataset-v1.1.json');
  writeFileSync(filePath, JSON.stringify(out, null, 2), 'utf-8');

  console.log(`\n🎉 Exported ${out.length} incidents to ${filePath} successfully.`);
  console.log(`Preview of first item:\n`, JSON.stringify(out[0], null, 2));
}

run();
