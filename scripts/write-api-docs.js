import fs from 'fs';
import { execSync } from 'child_process';

const output = execSync('node scripts/route-checker.js', { encoding: 'utf8' });
fs.writeFileSync('docs/API.md', output, 'utf8');
console.log("API.md written");
