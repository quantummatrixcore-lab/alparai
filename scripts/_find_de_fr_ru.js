const fs = require('fs');
const path = require('path');

function searchDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full, results);
    } else if (/\.(ts|tsx|js|jsx|json)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/Deutsch|Français|Русский|\b(de|fr|ru)\b/i.test(line) && !/node_modules|description|declaration|undefined|headers|default|true|false|return|function/i.test(line)) {
          results.push({ file: full, lineNum: idx + 1, text: line.trim() });
        }
      });
    }
  }
  return results;
}

const matches = searchDir('D:\\AlparAi\\src');
console.log(`Found ${matches.length} matches`);
matches.slice(0, 50).forEach(m => console.log(`${m.file}:${m.lineNum} -> ${m.text}`));
