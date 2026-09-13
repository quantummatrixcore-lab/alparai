const { execSync } = require('child_process');
const fs = require('fs');

const SSH_KEY = 'C:/Users/ercum/.ssh/id_ed25519_vds';
const REMOTE_HOST = 'root@45.143.4.92';

const raw = execSync(`ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "docker exec postgres-master psql -U postgres -d alparai_prod -t -A -c 'SELECT json_agg(t) FROM (SELECT id, name, provider, context_length, pricing_prompt, pricing_completion, is_active FROM public.ai_free_models ORDER BY id) t;'"`, { encoding: 'utf8' });

const models = JSON.parse(raw.trim());
console.log('Fetched', models.length, 'free models.');

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v.toString();
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  return "'" + v.replace(/'/g, "''") + "'";
}

const valueRows = models.map(m => 
  `        (${sqlVal(m.id)}, ${sqlVal(m.name)}, ${sqlVal(m.provider)}, ${sqlVal(m.context_length)}, ${sqlVal(m.pricing_prompt)}, ${sqlVal(m.pricing_completion)}, ${sqlVal(m.is_active)})`
).join(',\n');

const newBlock = `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_free_models') THEN
    IF NOT EXISTS (SELECT 1 FROM public.ai_free_models LIMIT 1) THEN
      INSERT INTO public.ai_free_models (id, name, provider, context_length, pricing_prompt, pricing_completion, is_active)
      VALUES
${valueRows}
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        provider = EXCLUDED.provider,
        context_length = EXCLUDED.context_length,
        pricing_prompt = EXCLUDED.pricing_prompt,
        pricing_completion = EXCLUDED.pricing_completion,
        is_active = EXCLUDED.is_active,
        last_checked_at = NOW();
    END IF;
  END IF;
END $$;`;

const path = 'dehost/migrations/0003_seeds.sql';
let content = fs.readFileSync(path, 'utf8');

const targetHeader = '-- Table: public.ai_free_models';
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
console.log('Successfully patched ai_free_models in 0003_seeds.sql');