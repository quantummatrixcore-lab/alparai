import fs from 'fs';
import path from 'path';

const migrationsDir = 'D:/01_SaaS_Products/Alparai/supabase/migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

const storagePolicies = [];
const bucketInserts = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  if (content.includes('storage.buckets') || content.includes('storage.objects')) {
    console.log(`Found storage config in migration: ${file}`);
    const bMatch = content.match(/INSERT\s+INTO\s+storage\.buckets[\s\S]*?;/gi);
    if (bMatch) {
      bucketInserts.push({ file, sql: bMatch });
    }
    const pMatch = content.match(/CREATE\s+POLICY\s+["']?([^"'\n]+)["']?\s+ON\s+storage\.objects[\s\S]*?;/gi);
    if (pMatch) {
      storagePolicies.push({ file, policies: pMatch });
    }
  }
}

console.log(`\n--- STORAGE BUCKETS INSERTED ---`);
console.log(JSON.stringify(bucketInserts, null, 2));

console.log(`\n--- STORAGE OBJECTS RLS POLICIES ---`);
console.log(JSON.stringify(storagePolicies, null, 2));
