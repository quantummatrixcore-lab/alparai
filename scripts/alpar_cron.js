/**
 * ALPAR AI Otonom Cron Motoru (True Autopilot)
 * Çalışma mantığı: Belirli aralıklarla Sürünün Omni-Tab scriptini tetikler.
 */

const { exec } = require("child_process");

console.log("[Alpar Cron] Gerçek Otopilot Devrede. Sürü (Wolf Pack) otonom devriyeye başlıyor...");

// Her 6 saatte bir Omni-Tab sızma operasyonunu çalıştır (Limitleri korumak için)
const INTERVAL_MS = 6 * 60 * 60 * 1000;

function runOmniTabSync() {
  console.log(`[Alpar Cron] ${new Date().toISOString()} - Omni-Tab Operasyonu Başlatılıyor...`);
  exec("node wolf_pack_omni_tab.js", (error, stdout, stderr) => {
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

// Sistemi ilk açılışta bir kez çalıştır
runOmniTabSync();

// Sonra periyodik olarak çalıştır
setInterval(runOmniTabSync, INTERVAL_MS);

console.log(
  "[Alpar Cron] Motor arka planda çalışmaya devam ediyor (CTRL+C ile durdurulana kadar).",
);
