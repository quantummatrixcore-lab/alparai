const fs = require('fs');
const path = require('path');

const schemaPath = 'D:\\AlparAi\\dehost\\migrations\\0001_full_schema.sql';
const content = fs.readFileSync(schemaPath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines in 0001_full_schema.sql: ${lines.length}`);

let headlessCount = 0;
const headlessLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  if (trimmed.startsWith('on public.') && !lines[i-1]?.includes('INDEX') && !lines[i-1]?.includes('POLICY') && !lines[i-1]?.includes('TRIGGER')) {
    headlessCount++;
    headlessLines.push({ lineNum: i + 1, prevLine: lines[i-1]?.trim(), line: trimmed });
  }
}

console.log(`Found ${headlessCount} headless 'on public.' lines in 0001_full_schema.sql.`);
console.log('First 10 sample headless lines:');
console.log(headlessLines.slice(0, 10));
