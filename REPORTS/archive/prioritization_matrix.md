# ALPARAI - GÖREV ÖNCELİKLENDİRME MATRİSİ (PRIORITIZATION MATRIX)

## P0: Kritik & Acil (Hemen Yapılacak)
1. **CSP Güvenlik Güncellemesi:** `next.config.mjs` içindeki `'unsafe-inline'` ve `'unsafe-eval'` CSP kurallarının kaldırılması, nonce/hash bazlı sıkı bir Content Security Policy uygulanması. (XSS Riskini Önler)
2. **Kapsamlı TypeScript Temizliği:** Projedeki diğer tüm dosyalardaki `@ts-nocheck` ve hatalı `any` dökümlerinin düzeltilerek sıkı tip güvenliğinin (strict mode) tam anlamıyla sağlanması.

## P1: Yüksek Öncelik (Kısa Vadeli)
1. **Bağımlılık Güvenlik Taraması (Audit):** `pnpm audit` çalıştırılarak zafiyet barındıran paketlerin güncellenmesi.
2. **i18n İyileştirmeleri:** `i18n/request.ts` ve dil dosyalarındaki uyuşmazlıkların giderilmesi, kullanılmayan anahtarların temizlenmesi.

## P2: Orta Öncelik (Performans & Optimizasyon)
1. **Build Optimizasyonu:** `knip` kullanılarak analiz yapıldı, rapor alındı. (Çekirdek dosyaların silinmesi manuel onaya bırakıldı). ✅
2. **Sentry Error Tracking İyileştirmeleri:** Sentry config dosyalarına gürültü (noise) filtreleme (`ignoreErrors`) eklendi. ✅

## P3: Düşük Öncelik (Mimari & Dökümantasyon)
1. **Task Runner Geçişi:** `concurrently` yerine `Turborepo` kuruldu, `turbo.json` yaratıldı ve `package.json` güncellendi. ✅
2. **Yönlendirme Gözden Geçirmesi:** `next.config.mjs` içerisindeki geçici yönlendirmeler kalıcı (`permanent: true`) hale getirildi. ✅
3. **Dökümantasyon:** Yeni mühendisler için `scripts/README_SCRIPTS.md` oluşturuldu. ✅
