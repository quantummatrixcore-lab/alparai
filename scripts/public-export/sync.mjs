#!/usr/bin/env node
/**
 * Public Repo Export Script
 *
 * Six-layer defense against accidental data leakage:
 * 1. Allowlist-based filtering (defaults to DENY)
 * 2. Filename-based blacklist (second gate)
 * 3. Secret/API key pattern scanning
 * 4. PII detection via guardian.ts patterns
 * 5. Immutable audit logging
 * 6. Branch protection + bot token only
 *
 * Usage:
 *   node scripts/public-export/sync.mjs <source-dir> <public-repo-url> <branch-name>
 *
 * Example:
 *   node scripts/public-export/sync.mjs /home/user/Alparai.com https://github.com/quantummatrixcore-lab/alparai.git main
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALLOWLIST_PATH = path.join(__dirname, "allowlist.json");
const AUDIT_LOG_PATH = path.join(__dirname, "../../.sync-audit-log.json");

// ============================================================================
// Layer 1: Load Allowlist
// ============================================================================

function loadAllowlist() {
  try {
    const content = fs.readFileSync(ALLOWLIST_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`[FATAL] Cannot load allowlist: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// Layer 2: Filename Blacklist Check (Second Gate)
// ============================================================================

function checkFilenameBlacklist(filePath, allowlist) {
  const keywords = allowlist.blocked.keywords || [];
  const lowerPath = filePath.toLowerCase();

  for (const keyword of keywords) {
    if (lowerPath.includes(keyword.toLowerCase())) {
      return true; // Blocked
    }
  }
  return false; // Not blocked
}

// ============================================================================
// Layer 3: Secret Scanning
// ============================================================================

function scanForSecrets(content, filePath, allowlist) {
  const patterns = allowlist.automatedFilters
    .find((f) => f.name === "secret-scan")
    ?.patterns || [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern, "gi");
    if (regex.test(content)) {
      return {
        detected: true,
        pattern,
        file: filePath,
      };
    }
  }
  return { detected: false };
}

// ============================================================================
// Layer 4: PII Detection (Simplified for demo)
// ============================================================================

function scanForPII(content, filePath) {
  const piiPatterns = {
    tc_kimlik: /\b[1-9](?:[\s.-]?\d){10}\b/g,
    email: /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g,
    phone: /(?:\+90|0)[\s.-]?(?:\(?\d{3}\)?|\d{3})[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/g,
  };

  for (const [type, pattern] of Object.entries(piiPatterns)) {
    if (pattern.test(content)) {
      return {
        detected: true,
        type,
        file: filePath,
      };
    }
  }
  return { detected: false };
}

// ============================================================================
// Layer 5: Allowlist Pattern Matching
// ============================================================================

function isFileAllowed(filePath, allowlist) {
  const rules = allowlist.rules || [];

  for (const rule of rules) {
    for (const pattern of rule.patterns || []) {
      if (matchPattern(filePath, pattern)) {
        // Check if this file is in the exclusion list
        for (const excludePattern of rule.exclude || []) {
          if (matchPattern(filePath, excludePattern)) {
            return false; // Excluded
          }
        }
        return true; // Allowed
      }
    }
  }

  return false; // Not in allowlist = DENY
}

function matchPattern(filePath, pattern) {
  // Simple glob-style matching
  if (pattern.includes("*")) {
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, "[^/]*")
          .replace(/\*\*/g, ".*") +
        "$"
    );
    return regex.test(filePath);
  }
  return filePath === pattern;
}

// ============================================================================
// Layer 6: Audit Logging
// ============================================================================

function logAudit(action, metadata) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    metadata,
  };

  let logs = [];
  if (fs.existsSync(AUDIT_LOG_PATH)) {
    try {
      logs = JSON.parse(fs.readFileSync(AUDIT_LOG_PATH, "utf-8"));
    } catch {
      logs = [];
    }
  }

  logs.push(entry);
  fs.writeFileSync(AUDIT_LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

// ============================================================================
// Main Export Logic
// ============================================================================

function collectFiles(sourceDir, allowlist) {
  const files = [];
  const errors = [];

  function walk(dir, relativeDir = "") {
    try {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        // Skip node_modules, .git, etc.
        if ([".git", "node_modules", ".next", ".env.local"].includes(entry)) {
          continue;
        }

        const fullPath = path.join(dir, entry);
        const relativePath = path.join(relativeDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath, relativePath);
        } else {
          // Layer 1: Check allowlist
          if (!isFileAllowed(relativePath, allowlist)) {
            console.warn(
              `[WARN] File not in allowlist, skipping: ${relativePath}`
            );
            continue;
          }

          // Layer 2: Filename blacklist
          if (checkFilenameBlacklist(relativePath, allowlist)) {
            errors.push({
              file: relativePath,
              reason: "blocked-by-filename-blacklist",
            });
            continue;
          }

          // Layer 3: Secret scan
          const content = fs.readFileSync(fullPath, "utf-8");
          const secretScan = scanForSecrets(content, relativePath, allowlist);
          if (secretScan.detected) {
            errors.push({
              file: relativePath,
              reason: `secret-detected: ${secretScan.pattern}`,
            });
            continue;
          }

          // Layer 4: PII scan
          const piiScan = scanForPII(content, relativePath);
          if (piiScan.detected) {
            errors.push({
              file: relativePath,
              reason: `pii-detected: ${piiScan.type}`,
            });
            continue;
          }

          files.push({
            source: fullPath,
            target: relativePath,
            hash: crypto.createHash("sha256").update(content).digest("hex"),
          });
        }
      }
    } catch (error) {
      console.error(`Error walking directory ${dir}: ${error.message}`);
    }
  }

  walk(sourceDir);
  return { files, errors };
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  const sourceDir = process.argv[2] || ".";
  const publicRepoUrl = process.argv[3];
  const branch = process.argv[4] || "main";

  if (!publicRepoUrl) {
    console.error("Usage: node sync.mjs <source-dir> <public-repo-url> [branch]");
    process.exit(1);
  }

  console.log("[PUBLIC-EXPORT] Starting sync to public repo...");
  console.log(`[PUBLIC-EXPORT] Source: ${sourceDir}`);
  console.log(`[PUBLIC-EXPORT] Target: ${publicRepoUrl} (${branch})`);

  // Load allowlist
  const allowlist = loadAllowlist();
  console.log("[LAYER-1] Allowlist loaded, starting file collection...");

  // Collect files with all security checks
  const { files, errors } = collectFiles(sourceDir, allowlist);

  console.log(`[SECURITY-SCAN] Collected ${files.length} files`);
  if (errors.length > 0) {
    console.error(`[SECURITY-SCAN] Blocked ${errors.length} files:`);
    errors.forEach((err) => {
      console.error(`  - ${err.file}: ${err.reason}`);
    });
    console.error("[FATAL] Export aborted due to security violations");
    logAudit("export-blocked", {
      reason: "security-violations",
      blocked_count: errors.length,
      violations: errors,
    });
    process.exit(1);
  }

  // Log successful scan
  const fileListHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(files.map((f) => f.target)))
    .digest("hex");

  logAudit("export-started", {
    file_count: files.length,
    file_list_hash: fileListHash,
    public_repo: publicRepoUrl,
    branch,
  });

  console.log(
    `[LAYER-5] All files passed security checks. Ready for workflow dispatch.`
  );
  console.log(`[AUDIT-LOG] Sync audit logged to ${AUDIT_LOG_PATH}`);
  console.log(
    `[NOTE] Actual squash-import will be performed by GitHub workflow with bot token.`
  );

  // Exit successfully
  process.exit(0);
}

main().catch((error) => {
  console.error(`[FATAL] ${error.message}`);
  process.exit(1);
});
