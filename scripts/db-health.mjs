const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = process.env.SUPABASE_PROJECT_REF;
const PASS = process.env.SUPABASE_DB_PASSWORD;

async function q(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, dbPassword: PASS, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const t = await r.text();
  if (!r.ok) return { error: t.slice(0, 200) };
  try { return JSON.parse(t); } catch { return t; }
}

async function main() {
  console.log("=== ALPAR AI Database Health Check ===\n");
  const tables = await q(`
    select table_name, (select count(*) from information_schema.columns c where c.table_name = t.table_name and c.table_schema = 'public') as cols
    from information_schema.tables t
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name;
  `);
  console.log("Public tables:");
  for (const t of tables) console.log("  -", t.table_name, "(" + t.cols + " cols)");

  const counts = await q(`
    select
      (select count(*) from public.users) as users,
      (select count(*) from public.ai_providers) as providers,
      (select count(*) from public.ai_models) as models,
      (select count(*) from public.incidents) as incidents,
      (select count(*) from public.incident_votes) as votes,
      (select count(*) from public.autopilot_runs) as autopilot_runs,
      (select count(*) from public.suggestions) as suggestions;
  `);
  console.log("\nRow counts:");
  const c = counts[0];
  console.log("  users:", c.users, "| providers:", c.providers, "| models:", c.models);
  console.log("  incidents:", c.incidents, "| votes:", c.votes, "| suggestions:", c.suggestions);
  console.log("  autopilot_runs:", c.autopilot_runs);

  const piiCheck = await q(`
    select column_name, data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'incidents' and column_name in ('contains_pii', 'pii_categories', 'search_vector');
  `);
  console.log("\nP0 column check:");
  for (const r of piiCheck) console.log("  -", r.column_name, ":", r.data_type);

  const voteCols = await q(`
    select column_name, data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'incident_votes' order by ordinal_position;
  `);
  console.log("\nincident_votes columns:");
  for (const r of voteCols) console.log("  -", r.column_name, ":", r.data_type);

  const providers = await q(`select slug, name from public.ai_providers order by name limit 5;`);
  console.log("\nFirst 5 providers:", providers.map(p => p.name).join(", "));
}
main();
