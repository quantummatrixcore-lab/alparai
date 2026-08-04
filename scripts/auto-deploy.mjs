#!/usr/bin/env node
// ALPAR AI — Full Auto-Deploy Script
// Tek seferde yapar: P0 migration + Vercel env + redeploy + saglik kontrolu
//
// Kullanim:
//   node scripts/auto-deploy.mjs
//
// Gerekli env var'lar (.env.local'den otomatik okunur):
//   VERCEL_TOKEN                 Vercel > Account > Tokens
//   VERCEL_PROJECT_ID            Vercel > Project > Settings > General > Project ID
//   SUPABASE_ACCESS_TOKEN        Supabase > Account > Tokens
//   SUPABASE_PROJECT_REF         supabase.co URL'indeki "xxxxx" kismi
//   SUPABASE_SERVICE_ROLE_KEY    .env.local'de zaten var
//   SUPABASE_DB_PASSWORD         Supabase > Settings > Database > Password (DB sifresi)

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const loadEnvLocal = () => {
  const envPath = resolve(repoRoot, ".env.local");
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
};

const env = { ...process.env, ...loadEnvLocal() };
const require = (key) => {
  const v = env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

const VERCEL_TOKEN = require("VERCEL_TOKEN");
const VERCEL_PROJECT_ID = require("VERCEL_PROJECT_ID");
const SUPABASE_ACCESS_TOKEN = require("SUPABASE_ACCESS_TOKEN");
const SUPABASE_PROJECT_REF = require("SUPABASE_PROJECT_REF");
const SUPABASE_SERVICE_ROLE_KEY = require("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_DB_PASSWORD = env.SUPABASE_DB_PASSWORD || "";
const SUPABASE_URL = require("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = require("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const vercelFetch = async (path, init = {}) => {
  const r = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(`Vercel ${path} ${r.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data;
};

const _supabaseFetch = async (path, init = {}) => {
  const r = await fetch(`https://api.supabase.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(`Supabase ${path} ${r.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data;
};

const log = (emoji, msg) => console.log(`${emoji}  ${msg}`);
const step = (n, total, msg) => console.log(`\n[${n}/${total}] ${msg}`);

// ============================================================================
// 1. P0 MIGRATIONS
// ============================================================================
const applyMigrations = async () => {
  step(1, 5, "P0 migrations uygulaniyor (Supabase DB)...");

  const sqlPath = resolve(repoRoot, "supabase/migrations/20260608000000_P0_production_critical.sql");
  const sql = readFileSync(sqlPath, "utf8");

  // Supabase Management API: database.query endpoint
  // Requires the user's DB password
  if (!SUPABASE_DB_PASSWORD) {
    log("⚠️", "SUPABASE_DB_PASSWORD yok — atlanıyor. Manuel olarak Supabase SQL Editor'den calistir:");
    log("📄", sqlPath);
    return false;
  }

  try {
    const r = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "dbPassword": SUPABASE_DB_PASSWORD,
        },
        body: JSON.stringify({ query: sql }),
      }
    );
    if (!r.ok) {
      const t = await r.text();
      log("❌", `Migration basarisiz: ${r.status} ${t}`);
      log("📄", "Manuel olarak SQL Editor'den calistirabilirsin:");
      log("📄", sqlPath);
      return false;
    }
    log("✅", "P0 migrations basariyla uygulandi");
    return true;
  } catch (e) {
    log("❌", `Migration hatasi: ${e.message}`);
    return false;
  }
};

// ============================================================================
// 2. VERCEL ENVIRONMENT VARIABLES
// ============================================================================
const setVercelEnv = async () => {
  step(2, 5, "Vercel environment variables ayarlaniyor...");

  // Get current env vars to avoid duplicates
  const current = await vercelFetch(`/v10/projects/${VERCEL_PROJECT_ID}/env?decrypt=true`);
  const existing = new Map(current.envs.map((e) => [e.key, e]));

  const IP_SALT = createHash("sha256")
    .update(`${VERCEL_PROJECT_ID}-${Date.now()}-${Math.random()}`)
    .digest("hex");

  const desired = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: SUPABASE_URL, target: ["production", "preview", "development"] },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: SUPABASE_ANON_KEY, target: ["production", "preview", "development"] },
    { key: "SUPABASE_SERVICE_ROLE_KEY", value: SUPABASE_SERVICE_ROLE_KEY, target: ["production", "preview", "development"] },
    { key: "SUPABASE_URL", value: SUPABASE_URL, target: ["production", "preview", "development"] },
    { key: "SUPABASE_ANON_KEY", value: SUPABASE_ANON_KEY, target: ["production", "preview", "development"] },
    { key: "SUPABASE_SERVICE_ROLE", value: SUPABASE_SERVICE_ROLE_KEY, target: ["production", "preview", "development"] },
    { key: "IP_SALT", value: IP_SALT, target: ["production"] },
    { key: "NEXT_PUBLIC_APP_URL", value: "https://alparai.com", target: ["production"] },
    { key: "RESEND_API_KEY", value: env.RESEND_API_KEY || "", target: ["production"] },
  ];

  for (const d of desired) {
    const e = existing.get(d.key);
    if (e) {
      // Update if value differs (only production for non-public)
      const needsUpdate = e.value !== d.value || JSON.stringify(e.target) !== JSON.stringify(d.target);
      if (needsUpdate) {
        await vercelFetch(`/v10/projects/${VERCEL_PROJECT_ID}/env/${e.id}`, {
          method: "PATCH",
          body: JSON.stringify({ value: d.value, target: d.target }),
        });
        log("🔄", `${d.key} guncellendi`);
      } else {
        log("✓", `${d.key} zaten dogru`);
      }
    } else {
      await vercelFetch(`/v10/projects/${VERCEL_PROJECT_ID}/env`, {
        method: "POST",
        body: JSON.stringify({
          key: d.key,
          value: d.value,
          type: d.key.startsWith("NEXT_PUBLIC_") ? "plain" : "encrypted",
          target: d.target,
        }),
      });
      log("➕", `${d.key} eklendi`);
    }
  }
  log("✅", "Tum env degiskenleri ayarlandi");
  log("🔑", `Yeni IP_SALT: ${IP_SALT.slice(0, 16)}...`);
};

// ============================================================================
// 3. TRIGGER REDEPLOY
// ============================================================================
const triggerRedeploy = async () => {
  step(3, 5, "Vercel redeploy tetikleniyor...");

  // Find latest production deployment
  const deployments = await vercelFetch(`/v6/deployments?projectId=${VERCEL_PROJECT_ID}&target=production&limit=1`);
  if (!deployments.deployments?.length) {
    log("❌", "Production deployment bulunamadi");
    return null;
  }
  const latest = deployments.deployments[0];
  log("📦", `Latest deploy: ${latest.uid} (${latest.state})`);

  if (latest.state === "READY") {
    // Redeploy with current state
    const redeploy = await vercelFetch(`/v13/deployments`, {
      method: "POST",
      body: JSON.stringify({
        deploymentId: latest.uid,
        name: VERCEL_PROJECT_ID,
        target: "production",
      }),
    });
    log("🚀", `Yeni deploy: ${redeploy.id}`);
    return redeploy.id;
  } else {
    log("⏳", `Latest deploy henuz ${latest.state}, bekleniyor`);
    return null;
  }
};

// ============================================================================
// 4. WAIT FOR DEPLOY
// ============================================================================
const waitForDeploy = async (deployId) => {
  if (!deployId) return null;
  step(4, 5, "Deploy tamamlanmasi bekleniyor...");
  for (let i = 0; i < 60; i += 1) {
    const d = await vercelFetch(`/v13/deployments/${deployId}`);
    log("⏱️", `[${i + 1}/60] ${d.readyState || d.state}`);
    if (d.readyState === "READY") return d;
    if (d.readyState === "ERROR" || d.readyState === "CANCELED") {
      log("❌", `Deploy ${d.readyState}`);
      return d;
    }
    await sleep(5000);
  }
  return null;
};

// ============================================================================
// 5. HEALTH CHECK
// ============================================================================
const healthCheck = async () => {
  step(5, 5, "Canli site saglik kontrolu...");
  const targets = [
    "https://alparai.com",
    "https://alparai.com/en",
    "https://alparai.com/tr",
    "https://alparai.com/en/incidents",
    "https://alparai.com/tr/incidents",
  ];
  for (const url of targets) {
    try {
      const r = await fetch(url, { redirect: "follow" });
      const body = (await r.text()).slice(0, 200);
      const hasDemo = body.includes("Demo mod") || body.includes("Supabase bağlantısı kurulamadı");
      const status = hasDemo ? "🟡 DEMO" : r.ok ? "🟢 OK" : "🔴 FAIL";
      log("•", `${status}  ${r.status}  ${url}`);
      if (hasDemo) log("  ", "⚠️  Hala demo mod — env degiskenlerini kontrol et");
    } catch (e) {
      log("🔴", `FAIL  ${url}  ${e.message}`);
    }
  }
};

// ============================================================================
// MAIN
// ============================================================================
const main = async () => {
  console.log("🤖 ALPAR AI Auto-Deploy\n");
  try {
    await applyMigrations();
    await setVercelEnv();
    const deployId = await triggerRedeploy();
    await waitForDeploy(deployId);
    await healthCheck();
    console.log("\n🎉 Auto-deploy tamamlandi!");
  } catch (e) {
    console.error("\n❌ Hata:", e.message);
    process.exit(1);
  }
};

main();
