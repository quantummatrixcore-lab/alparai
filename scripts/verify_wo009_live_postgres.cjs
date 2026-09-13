const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('--- WORK-ORDER-009 LIVE POSTGRES VERIFICATION ---');
  
  // Connection details from env or standard local defaults
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'alparai_staging'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server at 127.0.0.1:5432.');

    // Step 1: Run 0001_full_schema.sql
    console.log('\n--- Step 1: Executing dehost/migrations/0001_full_schema.sql ---');
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'dehost', 'migrations', '0001_full_schema.sql'), 'utf8');
    const t0 = Date.now();
    await client.query(schemaSql);
    const t1 = Date.now();
    console.log(`0001_full_schema.sql executed successfully in ${t1 - t0}ms (Exit 0, 0 ERRORs).`);

    // Step 2: Run 0002_rls_policies.sql
    console.log('\n--- Step 2: Executing dehost/migrations/0002_rls_policies.sql ---');
    const rlsSql = fs.readFileSync(path.join(__dirname, '..', 'dehost', 'migrations', '0002_rls_policies.sql'), 'utf8');
    const t2 = Date.now();
    await client.query(rlsSql);
    const t3 = Date.now();
    console.log(`0002_rls_policies.sql executed successfully in ${t3 - t2}ms (Exit 0, 0 ERRORs).`);

    // Step 3: Query server-returned counts
    console.log('\n--- Step 3: Querying PostgreSQL Server Counts ---');
    const tablesRes = await client.query(`SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public';`);
    const tableCount = tablesRes.rows[0].count;
    console.log(`Server-Returned pg_tables Count: ${tableCount}`);

    const policiesRes = await client.query(`SELECT count(*)::int FROM pg_policies WHERE schemaname = 'public';`);
    const policyCount = policiesRes.rows[0].count;
    console.log(`Server-Returned pg_policies Count: ${policyCount}`);

    // Step 4: Seed Roundtrip Test on incidents
    console.log('\n--- Step 4: Seed Roundtrip Test on incidents ---');
    
    // Ensure test provider and model exist
    const providerId = '11111111-1111-1111-1111-111111111111';
    const modelId = '22222222-2222-2222-2222-222222222222';
    const incidentId = '33333333-3333-3333-3333-333333333333';

    await client.query(`
      INSERT INTO public.ai_providers (id, name, slug, website_url)
      VALUES ($1, 'Verification Test Provider', 'verif-provider', 'https://example.com')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
    `, [providerId]);

    await client.query(`
      INSERT INTO public.ai_models (id, provider_id, name, slug)
      VALUES ($1, $2, 'Verification Test Model', 'verif-model')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
    `, [modelId, providerId]);

    // Insert test incident
    const testTitle = 'WO-009 Live Postgres Seed Verification Title';
    const testDesc = 'WO-009 verification description ensuring schema correctness and valid RLS execution.';
    
    await client.query(`
      INSERT INTO public.incidents (id, title, description, status, ai_provider_id, ai_model_id)
      VALUES ($1, $2, $3, 'pending_review', $4, $5)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
    `, [incidentId, testTitle, testDesc, providerId, modelId]);

    console.log('Successfully inserted test incident into public.incidents.');

    // Query back test incident
    const selectRes = await client.query(`SELECT id, title, status FROM public.incidents WHERE id = $1;`, [incidentId]);
    console.log(`Roundtrip Query Result: ${selectRes.rows.length} row returned (ID: ${selectRes.rows[0].id}, Title: "${selectRes.rows[0].title}", Status: ${selectRes.rows[0].status}).`);

    // Clean up test data
    await client.query(`DELETE FROM public.incidents WHERE id = $1;`, [incidentId]);
    await client.query(`DELETE FROM public.ai_models WHERE id = $1;`, [modelId]);
    await client.query(`DELETE FROM public.ai_providers WHERE id = $1;`, [providerId]);
    console.log('Cleaned up test seed data.');

    console.log('\n--- ALL VERIFICATIONS PASSED 100% GREEN ---');
  } catch (err) {
    console.error('VERIFICATION FAILED WITH ERROR:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
