"use strict";
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "dehost", "migrations", "0003_seeds.sql");
let content = fs.readFileSync(filePath, "utf8");

// 1. Fix Willy Wonka incident at line 754
const wonkaTarget = `'Glasgow''daki bir etkinlik organizatörü, Willy Wonka Deneyimi için yapay zeka görselleri hazırladı;\n\n      INSERT INTO public.incidents (`;
const wonkaReplacement = `'Glasgow''daki bir etkinlik organizatörü, Willy Wonka Deneyimi için yapay zeka görselleri hazırladı; etkinlik bomboş bir depo çıkınca binlerce aile mağdur oldu.',\n          (SELECT id FROM public.ai_providers WHERE slug = 'stability'), 'manipulation', 'medium', '2024-02-28', 'UK', 'en', 'published', NOW(), false, '{}'\n        )\n      ON CONFLICT (id) DO NOTHING;\n\n      INSERT INTO public.incidents (`;

if (content.includes(wonkaTarget)) {
  content = content.replace(wonkaTarget, wonkaReplacement);
  console.log("✓ Fixed Willy Wonka incident unclosed quote.");
} else {
  console.log("Wonka target not found, checking regex...");
  content = content.replace(
    /'Glasgow''daki bir etkinlik organizatörü, Willy Wonka Deneyimi için yapay zeka görselleri hazırladı;[\s\S]*?INSERT INTO public\.incidents/i,
    wonkaReplacement
  );
  console.log("✓ Applied Wonka regex fix.");
}

// 2. Remove broken strategy_metrics_snapshots with v_real_users
const brokenSnapshot = `      INSERT INTO public.strategy_metrics_snapshots
          (snapshot_date, total_users, total_incidents, active_providers,
           media_mentions_count, mrr_cents, runway_months, health_score)
        VALUES (
          CURRENT_DATE,
          v_real_users,
          v_real_incidents,
          v_real_providers,
          0,      -- media mentions: not tracked yet
          0,      -- MRR: free tier period
          18.00,  -- Runway: 18 months funded
          92      -- Initial health score baseline
        );`;
if (content.includes(brokenSnapshot)) {
  content = content.replace(brokenSnapshot, "");
  console.log("✓ Removed broken dynamic strategy_metrics_snapshots block.");
}

// 3. Replace procedural variables with safe SQL subqueries
content = content.replace(/\bv_ceo_id\b/g, "(SELECT id FROM public.users LIMIT 1)");
content = content.replace(/\bv_provider_id\b/g, "(SELECT id FROM public.ai_providers WHERE slug = 'xai' LIMIT 1)");
content = content.replace(/\bv_target_id\b/g, "(SELECT id FROM public.users LIMIT 1)");
console.log("✓ Replaced procedural variables (v_ceo_id, v_provider_id, v_target_id) with safe subqueries.");

fs.writeFileSync(filePath, content, "utf8");
console.log("✓ Successfully sanitized dehost/migrations/0003_seeds.sql");
