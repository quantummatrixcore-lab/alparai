import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, "../src");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".tsx")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(baseDir);
const hardcodedSuspicious = [];

// Look for JSX text between > and < with at least 4 letters, not whitespace, not pure symbols
const jsxTextRegex = />([^<>{}\n\r]+)</g;

for (const file of files) {
  // Skip test files
  if (file.includes(".test.") || file.includes(".spec.")) continue;
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(baseDir, file);

  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length >= 4 && /[a-zA-Z]/.test(text)) {
      // Ignore common CSS / SVG / code artifacts
      if (text.startsWith("&") || text.endsWith("&") || text === "..." || /^[0-9.,%$/+-]+$/.test(text)) continue;
      // Ignore brand names
      if (["ALPAR AI", "Alpar AI", "ALPAR", "GitHub", "DeHost", "OpenAI", "Anthropic"].includes(text)) continue;
      // Check if it looks like natural language
      if (text.includes(" ") || text.length > 8) {
        hardcodedSuspicious.push({
          file: relPath,
          text: text.slice(0, 80),
        });
      }
    }
  }
}

console.log(`Found ${hardcodedSuspicious.length} suspicious JSX text occurrences.`);
const byFile = {};
for (const item of hardcodedSuspicious) {
  byFile[item.file] = (byFile[item.file] || 0) + 1;
}
console.log("Top files with suspicious hardcoded text:", Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 20));
fs.writeFileSync(path.join(__dirname, "suspicious_jsx.json"), JSON.stringify(hardcodedSuspicious, null, 2), "utf8");
