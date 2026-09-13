const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dehost', 'migrations', '0001_full_schema.sql');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original length:', content.length);

// Regex for "    id text NOT NULL," inside table definitions
const targetRegex = /^    id text NOT NULL,/gm;
const matches = content.match(targetRegex);
console.log(`Found ${matches ? matches.length : 0} occurrences of '    id text NOT NULL,'`);

content = content.replace(targetRegex, '    id text DEFAULT gen_random_uuid()::text NOT NULL,');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated 0001_full_schema.sql');
