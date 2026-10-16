# ADR 0015: DORA Elite Engineering Manifesto

**Tarih:** 2026-10-07
**Durum:** Yürürlükte
**Bağlam:** Başlangıç fazında (HASAT öncesi) MVP yetiştirme telaşıyla sistemin DORA metrikleri açısından "DÜŞÜK" (Low) seviyede olduğu tespit edilmiştir (manuel PM2 komutları, saatler süren debug süreçleri, kirlenmiş root dizinleri, 50-restart döngüleri). Kurumsal itibarın korunması ve teknik borcun (technical debt) engellenmesi adına altyapı disiplini şarttır.
**Karar:** Aşağıdaki 10 kural "AlparAI DORA Elite" mühendislik anayasası olarak kabul edilmiştir:

1. **Gövde-temelli geliştirme (Trunk-based):** Uzun ömürlü dal (branch) yok. `CODEOWNERS` devrede.
2. **Kökte çöp yok:** Dump, log ve geçici script artıkları root dizinde barınamaz, CI'da engellenir. Tek seferlik scriptler `scripts/` altına taşınır.
3. **Altyapı Kod Olarak (IaC):** PM2 ecosystem ve Traefik kuralları kodla (declarative) yönetilir, sunucuda el yordamı (SSH terminal ameliyatları) yasaktır.
4. **ADR Zorunluluğu:** Karar kayıtsız (ADR yazılmadan) majör kodlama yapılamaz.
5. **Sırlar Kasada:** `.env` ve SSH anahtarları repoda asla tutulamaz.
6. **Test Kapısı (Quality Gate):** "KES" (Kesin/Katı) kapısı yeşil olmadan merge işlemi yapılamaz.
7. **Tek Komutla Dağıtım:** Deploy süreçleri (`deploy.sh` vb.) tek bir komuta indirgenir ve belgelenir.
8. **Gözlemlenebilirlik (Observability):** Loglar, metrikler ve traceler standart JSON/Structured formatında tutulur.
9. **Geri Alma (Rollback):** Snapshot ve revert mekanizması tek komutluk bir prosedüre bağlanır.
10. **Bağımlılık Kilitli (Lockfile):** `pnpm-lock.yaml` sıkı denetlenir ve güvenlik taramasından geçirilir.

**Sonuçlar:** Sistemin kodlama hızı (Lead Time) artacak, hata oranı (Change Failure Rate) düşecektir. Yapay zeka ajanları bu 10 kurala göre kod yazmakla mükelleftir.
