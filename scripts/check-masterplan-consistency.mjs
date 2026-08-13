import fs from 'fs';
import path from 'path';

const planPath = 'docs/MASTER_PLAN.md';
const itemsDir = 'docs/plan/items';

if (!fs.existsSync(planPath)) {
  console.error(`ERROR: ${planPath} not found.`);
  process.exit(1);
}

const planContent = fs.readFileSync(planPath, 'utf-8');
const itemLinks = [...planContent.matchAll(/\[.*?\]\((plan\/items\/([A-Z0-9a-z-]+)\.md)\)/g)];

let hasError = false;
const linkedFiles = new Set();

// 1. Check all linked items exist and are not stubs
for (const match of itemLinks) {
  const relPath = match[1]; // e.g. plan/items/SYNC-2.md
  const fileId = match[2];
  const fullPath = path.join('docs', relPath);
  
  linkedFiles.add(fileId + '.md');

  if (!fs.existsSync(fullPath)) {
    console.error(`ERROR: Linked item ${fullPath} does not exist!`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  
  // A proper item file should be at least a few words.
  if (content.trim().length < 20) {
    console.error(`ERROR: Item file ${fullPath} is suspiciously short (${content.length} chars). Potential data loss.`);
    hasError = true;
  }
}

// 2. Check for orphaned files in docs/plan/items
if (fs.existsSync(itemsDir)) {
  const files = fs.readdirSync(itemsDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    if (!linkedFiles.has(file)) {
      console.warn(`WARN: File ${file} exists in ${itemsDir} but is not linked in ${planPath}.`);
      // Warning only, not a failure.
    }
  }
}

if (hasError) {
  console.error('\n❌ MASTER_PLAN consistency check FAILED. Data loss or missing files detected.');
  process.exit(1);
}

console.log('✅ MASTER_PLAN consistency check PASSED. All items are intact.');
