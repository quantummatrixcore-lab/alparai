import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hasError = false;

function error(msg) {
  console.error('[ERROR]', msg);
  hasError = true;
}

function warn(msg) {
  console.warn('[GUARDIAN WARN]', msg);
}

function success(msg) {
  console.log('[OK]', msg);
}

const basePath = path.resolve(__dirname, '..');

function countDeepKeys(obj) {
  let count = 0;
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      count += countDeepKeys(obj[k]);
    } else {
      count++;
    }
  }
  return count;
}

function checkMessages() {
  const messagesDir = path.join(basePath, 'messages');
  const files = ['en.json', 'tr.json'];
  let en = {};
  let tr = {};
  
  files.forEach(file => {
    const filePath = path.join(messagesDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (file === 'en.json') en = data;
        if (file === 'tr.json') tr = data;
        const topLevelCount = Object.keys(data).length;
        const deepCount = countDeepKeys(data);
        
        if (topLevelCount < 80) {
          error(`${file} has only ${topLevelCount} top-level namespaces. Expected at least 80.`);
        }
        if (deepCount < 3000) {
          error(`${file} has only ${deepCount} deep keys. Expected at least 3000.`);
        }

        const requiredKeys = ['hero', 'segments', 'marketing', 'common', 'nav', 'admin'];
        for (const rk of requiredKeys) {
          if (!data[rk]) {
            error(`${file} is missing critical namespace: '${rk}'`);
          }
        }
      } catch (e) {
        error(`Could not parse ${file}: ${e.message}`);
      }
    } else {
      error(`${file} not found in messages directory.`);
    }
  });

  // Check nested namespaces
  const nestedChecks = [
    ['about', 'advisoryBoardTitle'],
    ['suggestions', 'signInToSuggest'],
    ['transparency', 'obligation_header'],
    ['products', 'eu_ai_act_page'],
  ];
  for (const [ns, key] of nestedChecks) {
    if (!en[ns]?.[key]) warn(`EN missing: ${ns}.${key}`);
    if (!tr[ns]?.[key]) warn(`TR missing: ${ns}.${key}`);
  }
}

function walk(dir, fileCallback) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walk(fullPath, fileCallback);
      }
    } else {
      fileCallback(fullPath);
    }
  });
}

function checkSrcCode() {
  const srcDir = path.join(basePath, 'src');
  if (!fs.existsSync(srcDir)) return;
  
  walk(srcDir, (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Prohibit inc-demo in production files
      if (content.includes('inc-demo-') && !filePath.includes('.test.') && !filePath.includes('.spec.')) {
        error(`Found forbidden 'inc-demo-' pattern in ${filePath}`);
      }
      
      if (filePath.endsWith('page.tsx')) {
        if (content.includes('as unknown as IncidentListItem[]') || content.includes('as LeaderboardEntry[]')) {
          error(`Found forbidden mock fallbacks in ${filePath}`);
        }
      }
    } catch (e) {
      // Ignore read errors
    }
  });
}

function checkSeedFiles() {
  const dehostDir = path.join(basePath, 'dehost');
  if (!fs.existsSync(dehostDir)) return;
  walk(dehostDir, (filePath) => {
    if (filePath.endsWith('.sql') && path.basename(filePath).includes('seed')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('-- PRODUCTION SEED') && !content.includes('-- TEST ONLY')) {
          error(`Seed SQL file missing production/test tag: ${filePath}`);
        }
      } catch(e) {}
    }
  });
}

function checkPublicDir() {
  const publicDir = path.join(basePath, 'public');
  if (!fs.existsSync(publicDir)) return;
  
  walk(publicDir, (filePath) => {
    const fileName = path.basename(filePath);
    if (fileName === 'index.html' || fileName === '_redirects') {
      error(`Found forbidden file in public directory: ${filePath}. These hijack the Next.js App Router.`);
    }
  });
}

console.log('--- Running ALPAR AI Guardian & Integrity Gate ---');
checkMessages();
checkSrcCode();
checkSeedFiles();
checkPublicDir();

if (hasError) {
  console.error('\n[GUARDIAN REJECTED] Commit/Build aborted due to security or integrity violations.');
  process.exit(1);
} else {
  success('All system integrity and zero-mock constraints passed!');
  process.exit(0);
}
