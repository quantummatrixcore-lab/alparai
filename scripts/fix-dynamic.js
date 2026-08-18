const fs = require('fs');
const path = require('path');

const adminDir = path.join('d:', 'Alparai', 'src', 'app', '[locale]', 'admin');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(adminDir);
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  if (content.includes('import dynamic from "next/dynamic"')) {
    // Check if it has export const dynamic
    if (content.includes('export const dynamic =')) {
      content = content.replace('import dynamic from "next/dynamic";', 'import nextDynamic from "next/dynamic";');
      // replace all dynamic(() => ...) with nextDynamic(() => ...)
      content = content.replace(/dynamic\(\(\)\s*=>\s*import/g, 'nextDynamic(() => import');
      
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed conflict in ' + file);
      fixedCount++;
    }
  }
});
console.log('Fixed ' + fixedCount + ' files.');
