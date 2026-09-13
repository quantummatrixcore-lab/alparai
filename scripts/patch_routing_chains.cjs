const { execSync } = require('child_process');
const fs = require('fs');

const SSH_KEY = 'C:/Users/ercum/.ssh/id_ed25519_vds';
const REMOTE_HOST = 'root@45.143.4.92';

const raw = execSync(`ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "docker exec postgres-master psql -U postgres -d alparai_prod -t -A -c 'SELECT json_agg(t) FROM (SELECT id, capability_domain, primary_model_id, secondary_model_id, tertiary_model_id, judge_model_id, is_active, domain_name, models FROM public.ai_routing_chains ORDER BY capability_domain) t;'"`, { encoding: 'utf8' });

const chains = JSON.parse(raw.trim());
console.log('Fetched', chains.length, 'routing chains.');

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v.toString();
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'object') return "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
  return "'" + v.replace(/'/g, "''") + "'";
}

const valueRows = chains.map(c => 
  `        (${sqlVal(c.id)}, ${sqlVal(c.capability_domain)}, ${sqlVal(c.primary_model_id)}, ${sqlVal(c.secondary_model_id)}, ${sqlVal(c.tertiary_model_id)}, ${sqlVal(c.judge_model_id)}, ${sqlVal(c.is_active)}, ${sqlVal(c.domain_name)}, ${sqlVal(c.models)})`
).join(',\n');

const newBlock = `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_routing_chains') THEN
    IF NOT EXISTS (SELECT 1 FROM public.ai_routing_chains LIMIT 1) THEN
      INSERT INTO public.ai_routing_chains (id, capability_domain, primary_model_id, secondary_model_id, tertiary_model_id, judge_model_id, is_active, domain_name, models)
      VALUES
${valueRows}
      ON CONFLICT (id) DO UPDATE SET
        capability_domain = EXCLUDED.capability_domain,
        primary_model_id = EXCLUDED.primary_model_id,
        secondary_model_id = EXCLUDED.secondary_model_id,
        tertiary_model_id = EXCLUDED.tertiary_model_id,
        judge_model_id = EXCLUDED.judge_model_id,
        is_active = EXCLUDED.is_active,
        domain_name = EXCLUDED.domain_name,
        models = EXCLUDED.models,
        updated_at = NOW();
    END IF;
  END IF;
END $$;`;

const path = 'dehost/migrations/0003_seeds.sql';
let content = fs.readFileSync(path, 'utf8');

const targetHeader = '-- Table: public.ai_routing_chains';
const startIdx = content.indexOf(targetHeader);
if (startIdx === -1) {
  console.error('Header not found');
  process.exit(1);
}

const doStart = content.indexOf('DO $$', startIdx);
const doEnd = content.indexOf('END $$;', doStart);
if (doStart === -1 || doEnd === -1) {
  console.error('DO or END not found');
  process.exit(1);
}

const patched = content.slice(0, doStart) + newBlock + content.slice(doEnd + 'END $$;'.length);
fs.writeFileSync(path, patched, 'utf8');
console.log('Successfully patched ai_routing_chains in 0003_seeds.sql');