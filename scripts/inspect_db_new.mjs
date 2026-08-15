import fs from 'fs';

const buf = fs.readFileSync('D:/01_SaaS_Products/Alparai/database_new.ts');
let content = buf[0] === 0xff && buf[1] === 0xfe ? buf.toString('utf16le') : buf.toString('utf8');

const lines = content.split('\n');
console.log('Total lines in database_new.ts:', lines.length);
console.log(lines.slice(0, 60).join('\n'));

// Let's count how many `Tables: {` or table names exist
let inPublic = false;
let inTables = false;
const tablesFound = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('public: {')) inPublic = true;
  if (inPublic && line.includes('Tables: {')) inTables = true;
  if (inTables && line.match(/^\s{6}([a-zA-Z0-9_]+):\s*\{/)) {
    const t = line.match(/^\s{6}([a-zA-Z0-9_]+):\s*\{/)[1];
    tablesFound.push(t);
  }
  if (inTables && line.match(/^\s{4}\}/) && (lines[i+1]?.includes('Views:') || lines[i+1]?.includes('Functions:'))) {
    inTables = false;
  }
}

console.log('Tables found in database_new.ts:', tablesFound.length);
console.log('Table names in database_new.ts:', tablesFound);
