const { execSync } = require('child_process');
const fs = require('fs');

const SSH_KEY = 'C:/Users/ercum/.ssh/id_ed25519_vds';
const REMOTE_HOST = '-p 18222 root@45.143.4.92';

const raw = execSync(`ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "docker exec postgres-master psql -U postgres -d alparai_prod -t -A -c 'SELECT json_agg(t) FROM (SELECT id, section, question FROM public.strategic_questions ORDER BY id) t;'"`, { encoding: 'utf8' });

const questions = JSON.parse(raw.trim());
console.log('Fetched', questions.length, 'questions.');

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v.toString();
  return "'" + v.replace(/'/g, "''") + "'";
}

const valueRows = questions.map(q => 
  `        (${sqlVal(q.id)}, ${sqlVal(q.section)}, ${sqlVal(q.question)})`
).join(',\n');

const newBlock = `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategic_questions') THEN
    IF NOT EXISTS (SELECT 1 FROM public.strategic_questions LIMIT 1) THEN
      INSERT INTO public.strategic_questions (id, section, question)
      VALUES
${valueRows}
      ON CONFLICT (id) DO UPDATE SET section = EXCLUDED.section, question = EXCLUDED.question;
    END IF;
  END IF;
END $$;`;

const path = 'dehost/migrations/0003_seeds.sql';
let content = fs.readFileSync(path, 'utf8');

const targetHeader = '-- Table: public.strategic_questions';
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
console.log('Successfully patched strategic_questions in 0003_seeds.sql');