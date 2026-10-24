# CHECKLIST.md — ALPAR AI Ortak Görev Panosu

> **KURALLAR:**
> 1. Satır silinmez.
> 2. Durum değişimleri strictly tarih damgalıdır.
> 3. Başkasının ait olduğu satır işaretlenmez / değiştirilmez (Tespit = FAIL).

| # | Hedef | Sahip | Durum | Son Güncelleme |
|---|---|---|---|---|
| 1 | `scheduled-crons.yml` cron zamanlayıcısını saatlik (`0 * * * *`) olarak düzeltme ve izin sıkılaştırma (`contents: read`) | Antigravity | TAMAMLANDI | 2026-09-25 20:50 UTC |
| 2 | `heartbeat.yml` otonom 4 saatlik veri senkronizasyon workflow'u oluşturma | Antigravity | TAMAMLANDI | 2026-09-25 20:50 UTC |
| 3 | `heartbeat.yml` güvenlik sıkılaştırması (cevap gövdesi log basımını kaldırma, `-o /dev/null`) | Antigravity | TAMAMLANDI | 2026-09-25 20:50 UTC |
| 4 | Ajan Haberleşme Hattı Dizin Yapısı (`.agents/bus/INBOX/`, `.agents/bus/SONUC/`) | Antigravity | TAMAMLANDI | 2026-09-25 20:58 UTC |
| 5 | Dosya Kilit Protokolü (`lock-ack` mekanizması `.agents/bus/locks/`) | Antigravity | TAMAMLANDI | 2026-09-25 20:58 UTC |
| 6 | İlk Canlı Tur Test Raporu Üretimi (`RPT-TEST-20260925.md` — 1311 PASS) | Antigravity | TAMAMLANDI | 2026-09-25 20:59 UTC |
| 7 | GitHub Actions `heartbeat.yml` ve `scheduled-crons.yml` master dalına pushlama | Antigravity | TAMAMLANDI | 2026-10-05 19:09 UTC |
| 8 | `v59 Night Watch` & `spark_agent` otonom arka plan nöbetçisi entegrasyonu | AGİ (OpenCode) | BEKLEYEN | 2026-09-25 20:59 UTC |
| 9 | `v60 Chronic Problem Immune Sentinel` DeHost/cloudflare konfigürasyon karantinası denetimi | AGİ (OpenCode) | BEKLEYEN | 2026-09-25 20:59 UTC |
| 10 | Ajanlar Arası Otomatik Yoklama (Polling & IPC Sync Loop) Aktifleştirme | Ortak (Antigravity + AGİ) | BEKLEYEN | 2026-09-25 20:59 UTC |
