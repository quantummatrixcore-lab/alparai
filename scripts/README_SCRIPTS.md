# Alparai Scripts - Mühendislik Rehberi

Bu dizin, Alparai projesinin otomasyon, güvenlik denetimi, i18n senkronizasyonu ve veritabanı operasyonlarını yürüten bağımsız script'leri içerir.

## 🚀 Anahtar Araçlar ve Kullanımları

### Güvenlik ve Denetim (Security & Audit)
- **`audit_security_vulnerabilities.mjs`**: DeHost RLS (Row Level Security) kurallarını tarar ve güvensiz (`USING (true)`) durumları raporlar. Düzenli aralıklarla veya veritabanı migrasyonlarından sonra çalıştırılmalıdır.
- **`check-internal-links.mjs`**: Uygulama içindeki tüm statik linkleri tarayarak kırık (404) olanları tespit eder.

### Uluslararasılaştırma (i18n)
- **`check-i18n.mjs`**: `en.json`, `tr.json` vb. dil dosyalarındaki eksik anahtarları, boş bırakılmış değerleri ve admin paneli paritelerini doğrular. CI/CD'de kalite kapısı (`pnpm validate`) olarak yer alır.
- **`update-all-i18n.mjs` / `apply-i18n.mjs`**: Toplu dil çevirilerini ve senkronizasyon operasyonlarını yönetir.

### Test ve Doğrulama (Validation)
- **`test-negative-checks.mjs`**: Hatalı giriş verildiğinde denetim scriptlerinin gerçekten hata (FAIL) fırlatıp fırlatmadığını sınayan meta-test aracıdır. Güvenilirlik için şarttır.

### Mimari Geliştirme (Architecture)
- **`fix-imports.js` / `refactor-admin.js`**: Eski veya kırık içe aktarma yollarını ve refactor işlemlerini toplu olarak düzeltir.

## 🛠️ Otopilot (Autopilot) & Görev Yönetimi
`pnpm validate` veya `turbo run validate` komutu, proje kalitesini test ederken arka planda i18n denetim scriptini de tetikler.

> **Uyarı:** Bu klasördeki scriptler üretim (production) ortamı düşünülerek optimize edilmiştir, Node.js v20+ ortamında doğrudan çalıştırılabilir.
