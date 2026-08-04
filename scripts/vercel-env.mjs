#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const envPath = resolve(repoRoot, ".env.local");
const env = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
}

const TOKEN = env.VERCEL_TOKEN;
const PROJECT = env.VERCEL_PROJECT_ID;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SRK = env.SUPABASE_SERVICE_ROLE_KEY;

if (!TOKEN) { console.error("VERCEL_TOKEN missing"); process.exit(1); }

const IP_SALT = createHash("sha256")
  .update(`alpar-${Date.now()}-${Math.random()}`)
  .digest("hex");

const desired = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", value: SUPABASE_URL, type: "plain", targets: ["production", "preview", "development"] },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: ANON, type: "plain", targets: ["production", "preview", "development"] },
  { key: "SUPABASE_URL", value: SUPABASE_URL, type: "plain", targets: ["production", "preview", "development"] },
  { key: "SUPABASE_ANON_KEY", value: ANON, type: "plain", targets: ["production", "preview", "development"] },
  ...(SRK ? [
    { key: "SUPABASE_SERVICE_ROLE_KEY", value: SRK, type: "encrypted", targets: ["production", "preview", "development"] },
    { key: "SUPABASE_SERVICE_ROLE", value: SRK, type: "encrypted", targets: ["production", "preview", "development"] },
  ] : []),
  { key: "IP_SALT", value: IP_SALT, type: "encrypted", targets: ["production", "preview"] },
  { key: "NEXT_PUBLIC_APP_URL", value: "https://alparai.com", type: "plain", targets: ["production"] },
  { key: "RESEND_API_KEY", value: env.RESEND_API_KEY || "", type: "encrypted", targets: ["production", "preview"] },
];

const vFetch = async (path, init = {}) => {
  const r = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const t = await r.text();
  let d; try { d = JSON.parse(t); } catch { d = t; }
  if (!r.ok) throw new Error(`${path} -> ${r.status}: ${typeof d === "string" ? d : JSON.stringify(d)}`);
  return d;
};

const main = async () => {
  console.log("🔍 Mevcut env'ler okunuyor...");
  const current = await vFetch(`/v10/projects/${PROJECT}/env?decrypt=true`);
  const byKey = new Map(current.envs.map((e) => [e.key, e]));

  for (const d of desired) {
    const e = byKey.get(d.key);
    if (e) {
      await vFetch(`/v10/projects/${PROJECT}/env/${e.id}`, {
        method: "PATCH",
        body: JSON.stringify({ value: d.value, target: d.targets }),
      });
      console.log(`🔄 ${d.key} guncellendi`);
    } else {
      // Create once per env, with all targets in single call
      await vFetch(`/v10/projects/${PROJECT}/env`, {
        method: "POST",
        body: JSON.stringify({ key: d.key, value: d.value, type: d.type, target: d.targets }),
      });
      console.log(`➕ ${d.key} eklendi [${d.targets.join(",")}]`);
    }
  }
  console.log(`\n🔑 IP_SALT: ${IP_SALT}`);
  if (!SRK) {
    console.log("\n⚠️  SUPABASE_SERVICE_ROLE_KEY .env.local'de yok.");
    console.log("   Bana Supabase Dashboard > Settings > API > service_role key'i yapistir");
    console.log("   ya da Vercel dashboard'dan manuel ekle.");
  }
  console.log("\n✅ Tum env'ler ayarlandi");
};

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
