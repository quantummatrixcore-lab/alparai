# Alparai Mimari ve Bağımlılık Analizi Raporu

**Raporlayan:** Jül Sezar (CORE Engine)
**Tarih:** 29 Ağustos 2026
**Alıcı:** Atatürk (Supreme Commander)
**Kapsam:** D:\01_SaaS_Products\Alparai

## 1. Yönetici Özeti
Alparai projesinin paket, Turborepo ve kod yapılandırmaları Knip ve statik analiz yöntemleri kullanılarak taranmıştır. Sistemde 333 adet kullanılmayan dosya tespit edilmiş olup, Turborepo yapılandırmasının (turbo.json) genel olarak düzgün kurgulandığı ancak projenin temizliği (dead code) açısından ciddi bir refactoring ihtiyacı olduğu görülmüştür.

## 2. Turborepo ve Paket Yapılandırma Durumu
- **Paket Yöneticisi:** pnpm (workspace aktif ancak `apps/`, `core/`, vb. yapılar olsa da kök dizinde karmaşık bir dosya yığını var).
- **turbo.json:** `build`, `lint`, `typecheck`, `test`, `dev`, `i18n:check`, `validate` taskları tanımlı. Bağımlılık ağacı (dependsOn) genel olarak hatasız.
- **Darboğazlar:** Kök dizinde (root) haddinden fazla yapılandırma dosyası (`refactor_fast.cjs`, `refactor_routes.cjs`, vb.) ve test komut dosyaları birikmiş. Merkezi otoritenin monorepo hiyerarşisini netleştirmesi (ör. scripts klasörüne taşıma) gerekiyor.

## 3. Knip Analiz Bulguları (Ölü Kod ve Bağımlılıklar)
Knip taraması 1 hata koduyla sonuçlanmış olup başlıca sorunlar şunlardır:
1. **Unused Files (Kullanılmayan Dosyalar):** Projede herhangi bir import zincirine dahil olmayan, tamamen atıl 333 dosya bulunuyor. Bu dosyalar paket boyutunu ve build sürelerini artırmaktadır.
2. **Kullanılmayan/İzole Types:** `src/lib/autopilot/`, `src/lib/validation/`, `src/types/` dizinlerinde onlarca interface ve tip tanımı (ör: `OutreachItem`, `QueueJob`, vb.) hiçbir yerde import edilmiyor.
3. **Kopya İhracatlar (Duplicate Exports):** 
   - `AIEcosystemRadar` (src/components/admin/widgets/AIEcosystemRadar.tsx)
   - `FinancialOperations` (src/components/admin/widgets/FinancialOperations.tsx)
   - `VisitorAnalytics` (src/components/admin/widgets/VisitorAnalytics.tsx)
   - `FactCheckJsonLd` (src/components/seo/json-ld.tsx)
   Bu bileşenler, kod içinde duplicate export tanımlarına sahip ve build/lint süreçlerinde tutarsızlığa yol açabilir.
4. **Yapılandırma Eksikliği:** Knip için özel bir `knip.json` dosyası kök dizinde eksik, bu nedenle bazı workspace entry'leri Knip tarafından kör nokta olarak algılanıyor olabilir. 

## 4. Aksiyon Planı ve Öneriler
1. **Knip Konfigürasyonu:** Derhal bir `knip.json` eklenerek (monorepo/Next.js/Turborepo eklentileriyle) yanlış pozitifler filtrelenmelidir.
2. **Ölü Kod Temizliği (Purge):** 333 dosyanın listesi çıkarılarak, kullanılmayan tipler ve arayüzler kademeli olarak projeden silinmelidir.
3. **Kopya Export Düzeltmeleri:** Widget'lardaki `default` vs `named` export karmaşası çözülmelidir.
4. **Kök Dizin Temizliği:** `.cjs` ve `.mjs` analiz/refactor scriptleri `tools/` veya `scripts/` klasörüne izole edilmelidir.

**Sonuç:** Yapısal bütünlük için temel sağlam olsa da, entropi (dağınıklık) artış eğilimindedir. Düzenli `npm run knip` (CI entegreli) şarttır.
