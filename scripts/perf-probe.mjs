// Basit üretim nabız ölçümü: herkese açık uçlara GET, TTFB + durum kaydı.
// Kullanım: node scripts/perf-probe.mjs [baseUrl]
// Çıktı: docs/PERF_BASELINE.md tablosunu günceller (stdout'a basar).
const BASE = process.argv[2] || "https://alparai.com";
const TARGETS = [
  "/api/health",
  "/api/v1/stats",
  "/api/badge?provider=openai",
  "/api/v1/models/openai/badge.svg",
  "/api/v1/academy/lessons?locale=tr",
  "/api/v1/arena/rankings",
  "/api/v1/public/domain-count?domain=openai.com",
  "/tr",
];

const BUDGET_MS = { "/api/health": 1500, default: 3000 };

async function probe(path) {
  const url = BASE + path;
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    await res.arrayBuffer();
    return { path, status: res.status, ms: Date.now() - started, ok: res.ok };
  } catch (e) {
    return { path, status: 0, ms: Date.now() - started, ok: false, error: String(e).slice(0, 120) };
  }
}

async function main() {
  const rows = [];
  for (const t of TARGETS) rows.push(await probe(t));
  const lines = [];
  lines.push(`# PERF nabız — ${new Date().toISOString()} (base: ${BASE})`);
  lines.push("");
  lines.push("| uç | durum | süre (ms) | bütçe (ms) | sonuç |");
  lines.push("|---|---|---|---|---|");
  for (const r of rows) {
    const budget = BUDGET_MS[r.path] ?? BUDGET_MS.default;
    const verdict = !r.ok ? "HATA" : r.ms > budget ? "YAVAŞ" : "OK";
    lines.push(`| \`${r.path}\` | ${r.status} | ${r.ms} | ${budget} | ${verdict} |`);
  }
  lines.push("");
  console.log(lines.join("\n"));
}

main();
