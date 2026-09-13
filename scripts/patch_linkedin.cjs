const { execSync } = require('child_process');
const fs = require('fs');

const SSH_KEY = 'C:/Users/ercum/.ssh/id_ed25519_vds';
const REMOTE_HOST = 'root@45.143.4.92';

const raw = execSync(`ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${REMOTE_HOST} "docker exec postgres-master psql -U postgres -d alparai_prod -t -A -c 'SELECT json_agg(t) FROM (SELECT full_name, title, company, profile_url, category, status, priority, notes FROM public.linkedin_contacts ORDER BY full_name) t;'"`, { encoding: 'utf8' });

const contacts = JSON.parse(raw.trim());
console.log('Fetched', contacts.length, 'contacts.');

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v.toString();
  return "'" + v.replace(/'/g, "''") + "'";
}

const valueRows = contacts.map(c => 
  `        (${sqlVal(c.full_name)}, ${sqlVal(c.title)}, ${sqlVal(c.company)}, ${sqlVal(c.profile_url)}, ${sqlVal(c.category)}, ${sqlVal(c.status)}, ${sqlVal(c.priority)}, ${sqlVal(c.notes)})`
).join(',\n');

const newBlock = `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'linkedin_contacts') THEN
    IF NOT EXISTS (SELECT 1 FROM public.linkedin_contacts LIMIT 1) THEN
      INSERT INTO public.linkedin_contacts (full_name, title, company, profile_url, category, status, priority, notes)
      VALUES
${valueRows};
    END IF;
  END IF;
END $$;`;

const path = 'dehost/migrations/0003_seeds.sql';
let content = fs.readFileSync(path, 'utf8');

const targetHeader = '-- Table: public.linkedin_contacts';
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
console.log('Successfully patched linkedin_contacts in 0003_seeds.sql');