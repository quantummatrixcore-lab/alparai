#!/usr/bin/env node
/**
 * ALPAR AI — Deployment Preflight (secrets & connectivity)
 * ============================================================================
 * Verifies that every credential the production runtime needs is actually
 * present BEFORE a build is shipped. It prints key NAMES and their presence
 * only — never a secret value.
 *
 * Why this exists
 * ---------------
 * The vault (`D:\00_MATRIX\master_vault.enc` via `vault_loader.js`) currently
 * injects only 10 secrets for the 03_ALPARAI project:
 *
 *   GOOGLE_CLIENT_ID, GOOGLE_OAUTH_CLIENT_ID, NEXT_PUBLIC_GOOGLE_CLIENT_ID,
 *   POLAR_ACCESS_TOKEN, POLAR_ORGANIZATION_ID, POLAR_WEBHOOK_SECRET,
 *   PURELYMAIL_API_KEY, PURELYMAIL_API_TOKEN, REDIS_PASS, REDIS_PASSWORD
 *
 * The DATABASE credentials are NOT among them. Because every `vault.read()`
 * call degrades silently to `undefined`, a build produced without those
 * credentials ships a registry that renders "healthy" while serving zero
 * real data. This script makes that state impossible to miss.
 *
 * Usage:
 *   node scripts/preflight-secrets.mjs            # report only
 *   node scripts/preflight-secrets.mjs --strict   # exit 1 on any missing key
 * ============================================================================
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * Required credentials, grouped by the subsystem that consumes them.
 * `required: true` means the application cannot function without it.
 */
const REQUIREMENTS = [
  // --- Database (registry) -------------------------------------------------
  { key: "DATABASE_URL", group: "database", required: false, note: "Preferred: full Postgres DSN" },
  { key: "DEHOST_HOST", group: "database", required: false, note: "Postgres host" },
  { key: "DEHOST_PORT", group: "database", required: false, note: "Postgres port (5432 / 6543)" },
  { key: "DEHOST_USER", group: "database", required: false, note: "Postgres role" },
  {
    key: "DEHOST_PASSWORD",
    group: "database",
    required: true,
    note: "Postgres password / service key",
  },
  { key: "DEHOST_DB", group: "database", required: false, note: "Database name (alparai_prod)" },
  {
    key: "DEHOST_SERVICE_ROLE_KEY",
    group: "database",
    required: false,
    note: "Service-role equivalent",
  },
  {
    key: "DEHOST_SQL_ENDPOINT",
    group: "database",
    required: false,
    note: "HTTP SQL gateway (edge transport)",
  },

  // --- Session & security --------------------------------------------------
  { key: "SESSION_SECRET", group: "security", required: true, note: "HMAC session cookie signing" },
  { key: "CRON_SECRET", group: "security", required: false, note: "Fallback for SESSION_SECRET" },
  { key: "IP_SALT", group: "security", required: true, note: "IP hashing salt (>= 16 chars)" },
  {
    key: "VAULT_ENCRYPTION_KEY",
    group: "security",
    required: false,
    note: "At-rest encryption key",
  },

  // --- OAuth / mail / redis ------------------------------------------------
  { key: "GOOGLE_CLIENT_ID", group: "integrations", required: false, note: "Google OAuth" },
  { key: "GOOGLE_CLIENT_SECRET", group: "integrations", required: false, note: "Google OAuth" },
  { key: "REDIS_PASSWORD", group: "integrations", required: false, note: "Upstash Redis" },
  { key: "UPSTASH_REDIS_REST_URL", group: "integrations", required: false, note: "Upstash Redis" },
  {
    key: "UPSTASH_REDIS_REST_TOKEN",
    group: "integrations",
    required: false,
    note: "Upstash Redis",
  },
  { key: "PURELYMAIL_API_KEY", group: "integrations", required: false, note: "Outbound mail" },

  // --- Payments ------------------------------------------------------------
  { key: "STRIPE_SECRET_KEY", group: "payments", required: false, note: "Stripe subscriptions" },
  { key: "STRIPE_PRO_PRICE_ID", group: "payments", required: false, note: "Stripe Pro price" },
  {
    key: "STRIPE_ENTERPRISE_PRICE_ID",
    group: "payments",
    required: false,
    note: "Stripe Enterprise price",
  },
  {
    key: "LEMONSQUEEZY_API_KEY",
    group: "payments",
    required: false,
    note: "LemonSqueezy checkout",
  },
  {
    key: "LEMONSQUEEZY_VARIANT_ID",
    group: "payments",
    required: false,
    note: "LemonSqueezy variant",
  },

  // --- Application ---------------------------------------------------------
  { key: "NEXT_PUBLIC_APP_URL", group: "app", required: false, note: "Canonical public URL" },
];

/**
 * Loads the Matrix vault into process.env when running on the founder
 * workstation. A missing vault is not fatal here — the report then reflects
 * whatever the ambient environment provides.
 */
function loadVault() {
  try {
    const loader = require("D:/00_MATRIX/vault_loader.js");
    loader("D:/03_ALPARAI");
  } catch {
    // Optional: the vault is only present on the founder workstation.
  }
}

function present(key) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

function main() {
  loadVault();

  const strict = process.argv.includes("--strict");
  const groups = new Map();
  for (const req of REQUIREMENTS) {
    if (!groups.has(req.group)) groups.set(req.group, []);
    groups.get(req.group).push(req);
  }

  let missingRequired = 0;
  let missingOptional = 0;

  console.log("=== ALPAR AI — Deployment Preflight ===\n");

  for (const [group, items] of groups) {
    console.log(`[${group.toUpperCase()}]`);
    for (const item of items) {
      const ok = present(item.key);
      const status = ok ? "OK     " : item.required ? "MISSING*" : "absent ";
      console.log(`  ${status} ${item.key.padEnd(30)} ${item.note}`);
      if (!ok) {
        if (item.required) missingRequired += 1;
        else missingOptional += 1;
      }
    }
    console.log("");
  }

  const hasDatabasePath =
    present("DATABASE_URL") ||
    (present("DEHOST_HOST") && present("DEHOST_PASSWORD")) ||
    present("DEHOST_SQL_ENDPOINT");

  console.log("--- Verdict ---");
  console.log(`  database transport configured : ${hasDatabasePath ? "YES" : "NO"}`);
  console.log(`  missing REQUIRED keys          : ${missingRequired}`);
  console.log(`  missing optional keys          : ${missingOptional}`);

  if (!hasDatabasePath) {
    console.log(
      "\n  [!] NO DATABASE TRANSPORT. The registry will answer every query with an\n" +
        "      explicit DEHOST_NO_TRANSPORT error. Seal the database credentials\n" +
        "      into the Matrix vault before building.",
    );
  }

  if (missingRequired > 0) {
    console.log(
      "\n  [!] REQUIRED KEYS MISSING. The application throws on boot in production\n" +
        "      (see src/lib/utils/hash.ts and src/lib/auth/session.ts).",
    );
  }

  if (strict && (missingRequired > 0 || !hasDatabasePath)) {
    console.log("\n  [FAIL] Strict mode: refusing to continue.");
    process.exit(1);
  }

  console.log(
    "\n  Remediation: seal the missing keys into D:\\00_MATRIX\\master_vault.enc\n" +
      "  (the vault loader injects them at build time). Values are never printed.",
  );
}

main();
