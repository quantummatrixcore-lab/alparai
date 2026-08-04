import { readFileSync, writeFileSync, statSync } from "node:fs";

const ROOT = "D:\\Alparai";

const sources = [
  {
    file: "ALPARAI-360-AUDIT-REPORT-CLAUDE.md",
    id: "claude",
    sig: "Antigravity (Claude Opus 4.6 Model) — OMEGA PRIME 360 Protocol",
    date: "2026-06-06",
    score: "420/1000",
    status: "🔴 NÜKLEER (REJECTED)",
  },
  {
    file: "ALPARAI-360-AUDIT-REPORT.md",
    id: "gemini",
    sig: "Antigravity (Gemini 3.1 Pro - High) — Google DeepMind Advanced Agentic Coding",
    date: "2026-06-06",
    score: "75/100",
    status: "🟡 UYARI",
    splitAt: "<!-- ======================================================================== -->",
  },
  {
    file: "ALPARAI-360-AUDIT-REPORT.md",
    id: "deepseek-omega",
    sig: "opencode deepseek v4 flash — OMEGA-360 framework (8 repo deneyimi)",
    date: "2026-06-06",
    score: "72/100",
    status: "🟡 GELİŞTİRİLMELİ",
  },
  {
    file: "ALPARAI-360-V2-REPORT.md",
    id: "deepseek-v2",
    sig: "opencode deepseek v4 flash — V2 Denetimi (P0'lar kapatıldıktan sonra)",
    date: "2026-06-08",
    score: "84/100",
    status: "🟢 PRODUCTION READY",
  },
  {
    file: "ALPARAI-360-MIMO-V2-5-REPORT.md",
    id: "mimo",
    sig: "mimo v2.5",
    date: "2026-06-08",
    score: "78/100",
    status: "🟡 DİKKAT GEREKTİRİR",
  },
  {
    file: "ALPARAI-360-MINIMAX-M3-REPORT.md",
    id: "minimax",
    sig: "minimax m3 (opencode/minimax-m3-free)",
    date: "2026-06-08",
    score: "73/100",
    status: "🟡 DİKKAT",
  },
];

const headers = {
  claude: "# 1. Claude Opus 4.6 — Antigravity — 420/1000",
  gemini: "# 2. Gemini 3.1 Pro High — Antigravity — 75/100",
  "deepseek-omega": "# 3. opencode deepseek v4 flash — OMEGA-360 Ek Analiz — 72/100",
  "deepseek-v2": "# 4. opencode deepseek v4 flash — V2 — 84/100",
  mimo: "# 5. mimo v2.5 — 78/100",
  minimax: "# 6. minimax m3 (`opencode/minimax-m3-free`) — 73/100",
};

const anchors = {
  claude: "1-claude-opus-46--antigravity--4201000",
  gemini: "2-gemini-31-pro-high--antigravity--75100",
  "deepseek-omega": "3-opencode-deepseek-v4-flash--omega-360-ek-analiz--72100",
  "deepseek-v2": "4-opencode-deepseek-v4-flash--v2--84100",
  mimo: "5-mimo-v25--78100",
  minimax: "6-minimax-m3-opencodeminimax-m3-free--73100",
};

let out = `# ALPAR AI — 360° Tüm AI Denetim Raporları (Konsolide)

> **5 farklı AI modeli** tarafından **6-8 Haziran 2026** tarihleri arasında  
> **bağımsız canlı analiz** ile üretilmiş 360° denetim raporlarının konsolidasyonu.  
> **Proje:** \`D:\\Alparai\` (ALPAR AI v1.0.0 — Production Release)  
> **Konsolide edildi:** 8 Haziran 2026  
> **Lisans:** AGPL-3.0

---

## 📊 Puan Tablosu Özet

| # | Model | Tarih | Puan | Seviye | Kaynak Dosya |
|:-:|:---|:-:|---:|:---|:---|
| 1 | Claude Opus 4.6 (Antigravity) | 06.06.2026 | **420/1000** | 🔴 NÜKLEER | \`ALPARAI-360-AUDIT-REPORT-CLAUDE.md\` |
| 2 | Gemini 3.1 Pro High (Antigravity) | 06.06.2026 | **75/100** | 🟡 UYARI | \`ALPARAI-360-AUDIT-REPORT.md\` (Bölüm 1) |
| 3 | deepseek v4 flash — OMEGA-360 | 06.06.2026 | **72/100** | 🟡 GELİŞTİRİLMELİ | \`ALPARAI-360-AUDIT-REPORT.md\` (Bölüm 2) |
| 4 | deepseek v4 flash — V2 | 08.06.2026 | **84/100** | 🟢 PRODUCTION READY | \`ALPARAI-360-V2-REPORT.md\` |
| 5 | mimo v2.5 | 08.06.2026 | **78/100** | 🟡 DİKKAT | \`ALPARAI-360-MIMO-V2-5-REPORT.md\` |
| 6 | minimax m3 (\`opencode/minimax-m3-free\`) | 08.06.2026 | **73/100** | 🟡 DİKKAT | \`ALPARAI-360-MINIMAX-M3-REPORT.md\` |

> **Not:** Konuşma geçmişinde 6. rapor olarak **"Nemotron 3 Ultra — 74/100"** bahsedilmiş ancak dosyaya kaydedilmemiştir. Diskte 5 rapor mevcuttur, bu konsolidasyon 5 rapor üzerinden yapılmıştır.

---

## İçindekiler

1. [Claude Opus 4.6 — 420/1000 (06.06.2026)](#${anchors.claude})
2. [Gemini 3.1 Pro High — 75/100 (06.06.2026)](#${anchors.gemini})
3. [deepseek v4 flash (OMEGA-360) — 72/100 (06.06.2026)](#${anchors["deepseek-omega"]})
4. [deepseek v4 flash (V2) — 84/100 (08.06.2026)](#${anchors["deepseek-v2"]})
5. [mimo v2.5 — 78/100 (08.06.2026)](#${anchors.mimo})
6. [minimax m3 — 73/100 (08.06.2026)](#${anchors.minimax})

---

`;

const cache = new Map();

function loadReport(file) {
  if (!cache.has(file)) {
    cache.set(file, readFileSync(`${ROOT}\\${file}`, "utf8"));
  }
  return cache.get(file);
}

for (const s of sources) {
  const full = loadReport(s.file);
  let body = full;

  if (s.id === "gemini") {
    const idx = full.indexOf(s.splitAt);
    if (idx > 0) body = full.substring(0, idx);
  } else if (s.id === "deepseek-omega") {
    const idx = full.indexOf(s.splitAt);
    if (idx > 0) body = full.substring(idx);
    body = body.replace(/^<!--[^\n]*-->\s*\n/m, "");
  }

  out += `<a id="${anchors[s.id]}"></a>\n`;
  out += `${headers[s.id]}\n\n`;
  out += `<sub>İmza: **${s.sig}**</sub>  \n`;
  out += `<sub>Tarih: ${s.date} · Puan: ${s.score} · Durum: ${s.status}</sub>\n\n`;
  out += `---\n\n`;
  out += body.trim();
  out += `\n\n---\n\n`;
}

out += `## 📊 Tüm Modellerin Karşılaştırması\n\n`;
out += `| # | Model | Puan | KRİTİK | YÜKSEK | ORTA | TS Hata | as never | i18n Hardcoded |\n`;
out += `|:-:|:---|---:|---:|---:|---:|---:|---:|---:|\n`;
out += `| 1 | Claude Opus 4.6 (OMEGA) | 420/1000 | 2 | 6 | 8 | n/a | "extensive" | n/a |\n`;
out += `| 2 | Gemini 3.1 Pro High | 75/100 | n/a | n/a | 4 | 35+ | n/a | n/a |\n`;
out += `| 3 | deepseek v4 flash (OMEGA-360) | 72/100 | 2 | 5 | — | 35+ | 23 | 60+ |\n`;
out += `| 4 | deepseek v4 flash (V2) | 84/100 | 0 | 7 | — | 35+ | 23+ | ~40 |\n`;
out += `| 5 | mimo v2.5 | 78/100 | 4 | 5 | 6 | 0 ✅ | 29 | 100+ |\n`;
out += `| 6 | minimax m3 | 73/100 | 3 | 5 | 7 | 0 ✅ | 27 | 60+ |\n\n`;
out += `> **Ortak bulgular (tüm raporlarda tekrar eden):**\n`;
out += `> - 🔴 \`database.ts\` manuel, migration'larla senkron değil → 23-29 \`as never\` bypass\n`;
out += `> - 🔴 CSP \`'unsafe-inline'\` + \`'unsafe-eval'\` aktif (Next.js zorunluluğu)\n`;
out += `> - 🔴 IP_SALT fallback (\`"alpar-default-salt"\`) 4-5 dosyada\n`;
out += `> - 🔴 Open Redirect: \`auth/callback/route.ts\` \`next\` parametresi doğrulanmıyor\n`;
out += `> - 🔴 Moderatör → Admin yetki yükseltme riski (admin.ts)\n`;
out += `> - 🟡 Husky hook'ları boş, lint-staged çalışmıyor\n`;
out += `> - 🟡 Prettier config çakışması (Tailwind plugin devre dışı)\n`;
out += `> - 🟡 Magic link rate limit eksik\n`;
out += `> - 🟡 contact-form.tsx tamamen i18n dışı\n\n`;
out += `> **Puan Tutarsızlığı Notu:**\n`;
out += `> - 4 model (Gemini/deepseek×2/mimo/minimax) 100 üzerinden puan verdi, ortalama **77.2/100**\n`;
out += `> - Claude Opus 4.6 1000 üzerinden puan verdi (farklı ölçek, çok daha sert kriter)\n`;
out += `> - \`pnpm typecheck\` gerçekte **0 hata** döndürüyor (V2 raporu 35+ hata iddiası yanlış)\n`;
out += `> - \`incident_votes\`, \`contains_pii\`, \`pii_categories\` migration'ları 08.06.2026'da uygulandı → V2 raporu sonrası P0'lar kapatıldı\n\n`;

out += `---\n\n`;
out += `*🔒 MÜHÜRLÜ: ALPAR AI 360° TÜM AI DENETİM RAPORLARI KONSOLİDASYONU | 8 Haziran 2026*\n`;
out += `*5 model · 6-8 Haziran 2026 · 143 kaynak dosya · 24 test dosyası · 14 tablo · 9 migration*\n`;

const outPath = `${ROOT}\\ALPARAI-360-ALL-REPORTS.md`;
writeFileSync(outPath, out, "utf8");
const size = statSync(outPath).size;
console.log(`OK: ${outPath} (${size} bytes, ${(size / 1024).toFixed(1)} KB)`);
