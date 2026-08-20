import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const adminDir = path.join(rootDir, 'src/app/[locale]/admin');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file === 'page.tsx') {
      results.push(filePath);
    }
  }
  return results;
}

const pages = walk(adminDir);
let table = '| Route | Source (Table/RPC) | Live? |\n|-------|-------------------|-------|\n';

for (const fullPath of pages.sort()) {
  const content = fs.readFileSync(fullPath, 'utf8');
  
  const matches = [...content.matchAll(/\.from\(['"]([^'"]+)['"]\)/g)];
  const rpcMatches = [...content.matchAll(/\.rpc\(['"]([^'"]+)['"]\)/g)];
  
  const sources = new Set();
  for (const m of matches) sources.add(m[1]);
  for (const m of rpcMatches) sources.add(`rpc:${m[1]}`);
  
  const sourceStr = sources.size > 0 ? Array.from(sources).join(', ') : 'None / Hardcoded';
  const liveStr = sources.size > 0 ? 'Yes' : 'No';
  const relative = path.relative(adminDir, fullPath).replace(/\\/g, '/');
  const route = relative.replace('/page.tsx', '').replace('page.tsx', '/');
  
  table += `| \`${route}\` | ${sourceStr} | ${liveStr} |\n`;
}

console.log(table);
