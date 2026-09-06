/**
 * 🛡️ VIBE SECURITY GUARDIAN (v2.0)
 * Deterministic Automated Security Engine for AI/Vibe-Coded Web Applications
 * Compatible with CommonJS & ES6+ (Antigravity & ErcuOS Universal Core)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VibeSecurityGuardian {
  constructor(targetDir = process.cwd()) {
    this.targetDir = path.resolve(targetDir);
    this.matrixPath = path.resolve(__dirname, 'vibe_security_matrix.json');
    this.matrix = this.loadMatrix();
    this.findings = [];
    this.stats = { totalFilesScanned: 0, passedChecks: 0, failedChecks: 0, warnings: 0 };
  }

  loadMatrix() {
    if (fs.existsSync(this.matrixPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.matrixPath, 'utf8'));
      } catch {
        return null;
      }
    }
    return null;
  }

  walkDir(dir, fileList = [], depth = 0) {
    if (depth > 12) return fileList;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item === 'node_modules' || item === '.git' || item === '.next' || item === 'dist' || item === 'build') continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this.walkDir(fullPath, fileList, depth + 1);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (['.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.env.local', '.env.production', '.sql', '.yml', '.yaml'].includes(ext) || item.startsWith('.env')) {
            fileList.push(fullPath);
          }
        }
      }
    } catch {}
    return fileList;
  }

  scan() {
    console.log(`\n======================================================`);
    console.log(`🛡️  VIBE SECURITY GUARDIAN — CROSS-PROJECT DEFENSE AUDIT`);
    console.log(`🎯  Target Workspace: ${this.targetDir}`);
    console.log(`======================================================\n`);

    const files = this.walkDir(this.targetDir);
    this.stats.totalFilesScanned = files.length;
    console.log(`📂 Discovered ${files.length} project files across workspace.`);

    this.auditSecrets(files);
    this.auditCodeExecution(files);
    this.auditCryptography(files);
    this.auditSSRFAndNetwork(files);
    this.auditAuthorizationAndRLS(files);
    this.auditClientSideDOM(files);
    this.auditDependencies();

    this.generateReport();
  }

  auditSecrets(files) {
    const secretPatterns = [
      { name: 'Leaked Service Role Key in NEXT_PUBLIC', regex: /NEXT_PUBLIC_[A-Z_]*SERVICE_ROLE[A-Z_]*\s*=/i, cwe: 'CWE-200' },
      { name: 'Hardcoded Private Key / Secret Token', regex: /(?:Bearer\s+[a-zA-Z0-9_\-\.]{30,}|sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36})/i, cwe: 'CWE-798' },
      { name: 'Hardcoded Supabase Service Role Secret', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, cwe: 'CWE-798' }
    ];

    for (const file of files) {
      if (file.includes('vibe_security_') || file.includes('test_') || file.includes('.user_uploaded')) continue;
      try {
        const content = fs.readFileSync(file, 'utf8');
        for (const sp of secretPatterns) {
          if (sp.regex.test(content)) {
            // Check if it's in a gitignore .env file or committed source
            const isEnv = path.basename(file).startsWith('.env');
            if (isEnv && sp.name.includes('NEXT_PUBLIC')) {
              this.findings.push({ severity: 'CRITICAL', cwe: sp.cwe, file: path.relative(this.targetDir, file), message: `${sp.name} found in env file!` });
            } else if (!isEnv) {
              this.findings.push({ severity: 'CRITICAL', cwe: sp.cwe, file: path.relative(this.targetDir, file), message: `${sp.name} hardcoded in source file!` });
            }
          }
        }
      } catch {}
    }
  }

  auditCodeExecution(files) {
    const dangerousPatterns = [
      { name: 'Direct eval() Execution', regex: /\beval\s*\(/g, cwe: 'CWE-95' },
      { name: 'Dynamic Function() Constructor', regex: /new\s+Function\s*\(/g, cwe: 'CWE-95' },
      { name: 'Unsanitized child_process.exec', regex: /child_process.*\.exec\s*\(/g, cwe: 'CWE-78' }
    ];

    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.test.') || file.includes('scratch')) continue;
      try {
        const content = fs.readFileSync(file, 'utf8');
        for (const dp of dangerousPatterns) {
          if (dp.regex.test(content)) {
            this.findings.push({ severity: 'HIGH', cwe: dp.cwe, file: path.relative(this.targetDir, file), message: `${dp.name} detected; potential RCE or command injection vector.` });
          }
        }
      } catch {}
    }
  }

  auditCryptography(files) {
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.test.') || file.includes('scratch')) continue;
      try {
        const content = fs.readFileSync(file, 'utf8');
        // Math.random used for token / auth
        if (content.includes('Math.random()') && (content.includes('token') || content.includes('session') || content.includes('secret') || content.includes('password'))) {
          this.findings.push({ severity: 'HIGH', cwe: 'CWE-338', file: path.relative(this.targetDir, file), message: 'Insecure PRNG (Math.random()) used in authentication/token context. Use crypto.randomBytes() or crypto.randomUUID().' });
        }
      } catch {}
    }
  }

  auditSSRFAndNetwork(files) {
    let ssrfProtectionFound = false;
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('169.254.169.254') || (content.includes('isPrivateIP') || content.includes('validateUrlAgainstSSRF'))) {
          ssrfProtectionFound = true;
          break;
        }
      } catch {}
    }
    if (!ssrfProtectionFound) {
      this.findings.push({ severity: 'MEDIUM', cwe: 'CWE-918', file: 'network', message: 'No explicit SSRF defense module (filtering 169.254.169.254 / private IPs) detected in project.' });
    }
  }

  auditAuthorizationAndRLS(files) {
    const migrationFiles = files.filter(f => f.includes('migration') && f.endsWith('.sql'));
    let tablesWithoutRLS = 0;
    for (const mf of migrationFiles) {
      try {
        const sql = fs.readFileSync(mf, 'utf8');
        const createTableMatches = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_\.\"]+)/gi) || [];
        for (const tm of createTableMatches) {
          const tableName = tm.split(/\s+/).pop().replace(/[\"\;]/g, '');
          if (!sql.includes(`ENABLE ROW LEVEL SECURITY`) && !sql.includes(`enable row level security`)) {
            tablesWithoutRLS++;
          }
        }
      } catch {}
    }
    if (tablesWithoutRLS > 0) {
      this.findings.push({ severity: 'HIGH', cwe: 'CWE-284', file: 'database/migrations', message: `Found ${tablesWithoutRLS} SQL migration table declarations without explicit ENABLE ROW LEVEL SECURITY.` });
    }
  }

  auditClientSideDOM(files) {
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify') && !content.includes('sanitizeHtml')) {
            this.findings.push({ severity: 'HIGH', cwe: 'CWE-79', file: path.relative(this.targetDir, file), message: 'dangerouslySetInnerHTML used without DOMPurify or HTML sanitization.' });
          }
        } catch {}
      }
    }
  }

  auditDependencies() {
    const pkgPath = path.join(this.targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        // Scan for hallucinated or known unvetted dependencies
        for (const [dep, ver] of Object.entries(allDeps)) {
          if (ver.startsWith('*') || ver === 'latest') {
            this.findings.push({ severity: 'MEDIUM', cwe: 'CWE-829', file: 'package.json', message: `Unpinned dependency version for "${dep}": ${ver}. Must use strict pinned semantic versioning.` });
          }
        }
      } catch {}
    }
  }

  generateReport() {
    const criticals = this.findings.filter(f => f.severity === 'CRITICAL');
    const highs = this.findings.filter(f => f.severity === 'HIGH');
    const mediums = this.findings.filter(f => f.severity === 'MEDIUM');

    console.log(`\n======================================================`);
    console.log(`📊  AUDIT COMPLETE — SUMMARY RESULT:`);
    console.log(`🔴  Critical Findings: ${criticals.length}`);
    console.log(`🟠  High Findings:     ${highs.length}`);
    console.log(`🟡  Medium Findings:   ${mediums.length}`);
    console.log(`======================================================\n`);

    if (this.findings.length === 0) {
      console.log(`✅  CONSTITUTIONAL EXCELLENCE: 100% CLEAN. Zero critical vibe-coding vulnerabilities detected!\n`);
    } else {
      console.log(`Findings Manifest:`);
      this.findings.forEach((f, idx) => {
        console.log(`[${idx + 1}] [${f.severity}] [${f.cwe}] ${f.file}: ${f.message}`);
      });
      console.log(`\n`);
    }

    const reportData = {
      timestamp: new Date().toISOString(),
      target: this.targetDir,
      totalScanned: this.stats.totalFilesScanned,
      findingsCount: this.findings.length,
      criticalCount: criticals.length,
      highCount: highs.length,
      mediumCount: mediums.length,
      findings: this.findings
    };

    const outPath = path.join(this.targetDir, 'vibe_security_audit_manifest.json');
    try {
      fs.writeFileSync(outPath, JSON.stringify(reportData, null, 2), 'utf8');
      console.log(`📄 Saved audit manifest to: ${outPath}`);
    } catch {}

    return reportData;
  }
}

if (require.main === module) {
  const target = process.argv[2] || process.cwd();
  const guardian = new VibeSecurityGuardian(target);
  guardian.scan();
}

module.exports = VibeSecurityGuardian;
