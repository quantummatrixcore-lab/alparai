const fs = require("fs");

let tr = fs.readFileSync("messages/tr.json", "utf8");
tr = tr
  .replace(/Makine Ã‡evirisi/g, "Makine Çevirisi")
  .replace(
    /Bu iÃ§erik makine Ã§evirisi ile sunulmuÅŸtur/g,
    "Bu içerik makine çevirisi ile sunulmuştur",
  );
fs.writeFileSync("messages/tr.json", tr);

let en = fs.readFileSync("messages/en.json", "utf8");
en = en
  .replace(/Trust Scoreâ„¢ Methodology/g, "Trust Score™ Methodology")
  .replace(/Ã—/g, "×")
  .replace(/ErcÃ¼ment/g, "Ercument")
  .replace(/â†’/g, "→")
  .replace(/â† /g, "←")
  .replace(/âš–ï¸ /g, "⚖️")
  .replace(/âœ…/g, "✅")
  .replace(/Â·/g, "·")
  .replace(/360Â°/g, "360°")
  .replace(/Â§/g, "§")
  .replace(/Ã¶lÃ§Ã¼lmedi/g, "Not measured")
  .replace(/Ã–lÃ§Ã¼lmedi/g, "Not measured")
  .replace(/Canlı AI Strateji Raporu/g, "Live AI Strategy Report")
  .replace(/SAÄžLIK SKORU:/g, "HEALTH SCORE:")
  .replace(/Stratejik Boşluklar/g, "Strategic Gaps")
  .replace(
    /Ajan boot dokümanları \(`docs\/BOOTSTRAP\.md`\) ~500 token seviyesinde tutulur\./g,
    "Agent boot documentation (`docs/BOOTSTRAP.md`) is kept at ~500 tokens.",
  )
  .replace(
    /Pre-commit hook'u ile 6,100\+ düğümlü AST mimari haritası otomatik güncellenir\./g,
    "6,100+ node AST architecture map is automatically updated via pre-commit hook.",
  )
  .replace(/— Canlı Ã–zellik Bayrakları Yönetimi/g, "— Live Feature Flags Management")
  .replace(
    /Sistem özelliklerini\.\.\./g,
    "Instantly toggle system features (PII Guardian, Sybil Shield, Cross-Audit, GEO Verifier) with ~0ms edge cache distribution on Upstash Redis.",
  )
  .replace(
    /ğŸš€ Launch Freeze Signal \(Lansman Dondurma Sinyali\) Nedir\?/g,
    "🚀 What is the Launch Freeze Signal?",
  )
  .replace(
    /Bu panel, ALPAR AI platformunun Hacker News \(Show HN\), Product Hunt ve X\/Twitter kamuoyuna\\n          lansman yapılmadan önceki platform hazır bulunurluk metriklerini, veri dondurma\\n          stabilitesini ve sunucu operasyonellik durumunu izleyen ana kontrol merkezidir\./g,
    "This panel is the main control center monitoring platform readiness metrics, data freeze stability, and server operational status prior to public launch on Hacker News (Show HN), Product Hunt, and X/Twitter.",
  )
  .replace(
    /\(EN sürümü aynı yapıda — TU München\/ETH\/Oxford için gerekirse eklenecektir\.\)/g,
    "(EN version in same structure — will be added for TU München/ETH/Oxford if necessary.)",
  )
  .replace(/"Aktif Risk"/g, '"Active Risk"')
  .replace(/"Yüksek Risk"/g, '"High Risk"')
  .replace(/"Kurum \/ Grantor"/g, '"Institution / Grantor"')
  .replace(/"Kategori \/ Category"/g, '"Category"')
  .replace(/â‚¬/g, "€");
fs.writeFileSync("messages/en.json", en);
console.log("Fixed translations");
