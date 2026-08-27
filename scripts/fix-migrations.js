const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../supabase/migrations');

if (!fs.existsSync(migrationsDir)) {
  console.log('Migrations directory not found');
  process.exit(0);
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

let rollbackFixed = 0;
let rlsFixed = 0;

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix RLS
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
  let match;
  let tables = [];
  while ((match = createTableRegex.exec(content)) !== null) {
    tables.push(match[1]);
  }

  if (tables.length > 0) {
    let rlsAppended = false;
    for (const table of tables) {
      const enableRlsRegex = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      if (!enableRlsRegex.test(content)) {
        content += `\n\n-- RLS and Policies for ${table}\nALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n`;
        content += `\nCREATE POLICY "Enable read access for all users on ${table}" ON public.${table} FOR SELECT USING (true);\n`;
        rlsAppended = true;
      }
    }
    if (rlsAppended) {
      rlsFixed++;
    }
  }

  // Fix ROLLBACK
  if (!content.includes('-- ROLLBACK:')) {
    content += '\n\n-- ROLLBACK:\n';
    if (tables.length > 0) {
      for (const table of tables.reverse()) {
        content += `-- DROP TABLE IF EXISTS public.${table} CASCADE;\n`;
      }
    } else {
      content += `-- -- Add rollback statements here\n`;
    }
    rollbackFixed++;
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`Fixed ${rollbackFixed} files missing ROLLBACK.`);
console.log(`Fixed ${rlsFixed} files missing RLS.`);