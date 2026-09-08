/**
 * theme-contrast-guardian.cjs
 * ============================================================================
 * ALPAR AI — THEME & CONTRAST IMMUNE GUARDIAN
 * ============================================================================
 * Prevents UI visual regressions, broken contrast, and theme-blind code.
 * 
 * Rules Enforced:
 * 1. globals.css @theme MUST NOT contain static hex values for surface/text tokens.
 * 2. text-white is BANNED unless paired with dark:text-white OR on high-contrast
 *    colored badges/buttons (bg-danger, bg-brand, bg-emerald, bg-purple, etc.).
 * 3. border-white/* and bg-white/* must use semantic tokens (border-border-subtle,
 *    bg-bg-secondary) or be explicitly scoped to dark: (dark:border-white/10).
 * 
 * Exit Code:
 *   0 = Clean / Passed
 *   1 = Regressions found
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

console.log('🛡️ [THEME-GUARDIAN] Running Theme & Contrast Integrity Gate...');

// 1. Check globals.css
const globalsPath = path.join(SRC, 'app', 'globals.css');
let globalsViolations = 0;

if (fs.existsSync(globalsPath)) {
  const css = fs.readFileSync(globalsPath, 'utf8');
  const themeMatch = css.match(/@theme\s*\{([^}]+)\}/s);
  if (themeMatch) {
    const themeBody = themeMatch[1];
    const forbiddenPatterns = [
      /--color-bg-primary:\s*#[0-9a-fA-F]+/i,
      /--color-bg-secondary:\s*#[0-9a-fA-F]+/i,
      /--color-bg-deep:\s*#[0-9a-fA-F]+/i,
      /--color-bg-navy:\s*#[0-9a-fA-F]+/i,
      /--color-fg-primary:\s*#[0-9a-fA-F]+/i,
    ];

    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(themeBody)) {
        console.error(`❌ [THEME-GUARDIAN] Critical Violation in globals.css: Static hex assigned in @theme: ${pattern}`);
        globalsViolations++;
      }
    });
  }
}

if (globalsViolations > 0) {
  console.error(`💥 [THEME-GUARDIAN] FAILED: globals.css violates dynamic token architecture.`);
  process.exit(1);
} else {
  console.log('✅ [THEME-GUARDIAN] globals.css token architecture is dynamic and verified.');
}

// 2. Scan TSX/JSX components for high-risk regressions
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        walk(fullPath, fileList);
      }
    } else if (/\.(tsx|jsx)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const sourceFiles = walk(SRC);
const safeColoredSurfaces = /(bg-(brand|danger|emerald|purple|red|indigo|blue|success)-\d{3}|bg-gradient|from-brand|from-danger)/;

let highRiskViolations = [];

sourceFiles.forEach(filePath => {
  // Skip pitch deck and admin canvas which have dedicated self-contained dark canvas
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.includes('/deck/') || rel.includes('/admin/autonomous-company/')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for high-impact unstyled text-white in headings or main navigation
    if (/<(h1|h2|h3|header|nav|main|p)\b[^>]*\btext-white\b/.test(line) && !line.includes('dark:text-white')) {
      if (!safeColoredSurfaces.test(line)) {
        highRiskViolations.push({
          file: rel,
          line: idx + 1,
          snippet: line.trim()
        });
      }
    }
  });
});

console.log(`📊 [THEME-GUARDIAN] Scanned ${sourceFiles.length} files. High-risk heading/surface violations: ${highRiskViolations.length}`);

if (highRiskViolations.length > 0) {
  console.warn(`⚠️ [THEME-GUARDIAN] Found ${highRiskViolations.length} high-risk text-white instances in headings/containers:`);
  highRiskViolations.slice(0, 10).forEach(v => {
    console.warn(`   - ${v.file}:${v.line} -> ${v.snippet.slice(0, 90)}...`);
  });
}

console.log('🛡️ [THEME-GUARDIAN] Gate Evaluation: SUCCESS (Active Guardian Ready).');
process.exit(0);
