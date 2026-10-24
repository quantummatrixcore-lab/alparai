/**
 * ALPAR AI Otonom Cron Motoru (True Autopilot)
 * Çalışma mantığı: Belirli aralıklarla Sürünün Omni-Tab scriptini tetikler.
 */

const path = require("path");
const { exec } = require("child_process");

console.log("[Alpar Cron] Gerçek Otopilot Devrede. Sürü (Wolf Pack) otonom devriyeye başlıyor...");

// Her 6 saatte bir Omni-Tab sızma operasyonunu çalıştır (Limitleri korumak için)
const INTERVAL_MS = 6 * 60 * 60 * 1000;
const omniTabScript = path.join(__dirname, "wolf_pack_omni_tab.js");

function runOmniTabSync() {
  console.log(`[Alpar Cron] ${new Date().toISOString()} - Omni-Tab Operasyonu Başlatılıyor...`);
  exec(`node "${omniTabScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Alpar Cron] Omni-Tab Hata: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`[Alpar Cron] Omni-Tab Uyarı: ${stderr}`);
    }
    console.log(`[Alpar Cron] Omni-Tab Başarılı:\n${stdout}`);
  });
}

// Komut satırı argümanları yönetimi
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Kullanım: node scripts/alpar_cron.cjs [--help | --once | --dry-run]");
  console.log("  --help, -h    : Bu yardım mesajını görüntüler");
  console.log("  --once        : Tek bir Omni-Tab döngüsü çalıştırıp çıkar");
  console.log("  --dry-run     : Döngüyü çalıştırmadan konfigürasyonu doğrular");
  process.exit(0);
}

if (process.argv.includes("--dry-run")) {
  console.log("[Alpar Cron] Dry-run başarılı. Hedef script:", omniTabScript);
  process.exit(0);
}

if (process.argv.includes("--once")) {
  console.log("[Alpar Cron] Tek seferlik çalışma modu devrede.");
  runOmniTabSync();
} else {
  // Sistemi ilk açılışta bir kez çalıştır
  runOmniTabSync();

  // Sonra periyodik olarak çalıştır
  setInterval(runOmniTabSync, INTERVAL_MS);

  console.log(
    "[Alpar Cron] Motor arka planda çalışmaya devam ediyor (CTRL+C ile durdurulana kadar).",
  );
}

module.exports = { runOmniTabSync, omniTabScript, INTERVAL_MS };
