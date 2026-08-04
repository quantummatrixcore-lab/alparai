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
  console.log(r.status, t.slice(0, 200));
  return r.ok;
}

async function main() {
  console.log("Dropping storage policies...");
  await q(`
    do $$
    declare r record;
    begin
      for r in (select policyname from pg_policies where schemaname = 'storage') loop
        execute format('drop policy if exists %I on storage.objects', r.policyname);
      end loop;
    end $$;
  `);
  console.log("Dropping public schema...");
  await q(`
    drop schema if exists public cascade;
    create schema public;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  `);
  console.log("\nOK — ready to re-apply migrations");
}
main();
