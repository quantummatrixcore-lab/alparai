# Güvenlik Remediasyonu 2026-10 — 22 zafiyetten 6 saf dışı kalan

> Tarih: 2026-10-20. Güncelleme: 2026-10-21 (vite 6.4.4 bump). Yöntem: kanıtlı denetim, ölçülü pinleme, dürüst istisna.

## Sonuç

- `pnpm audit --prod`: **0 zafiyet**. HARD GATE YEŞİL.
- Full-tree: **22 → 6** (2 critical + 2 high + 2 moderate; tamamı dev-only/yamasız-upstream).

## Kapatılanlar (pin + kaldırma)

1. `fast-xml-parser` critical + 2 high: 4.2.5 → 4.5.5 pini, sonra tüketici bulunamayınca pin SİLİNDİ (ölü bağımlılık). Kalan moderate (GHSA-gh4j) 5.x major ister — tüketici yok, risk yok.
2. `shell-quote` critical: 1.9.0 (concurrently zinciri) → 1.12.0 direkt pin; concurrently 10.0.4 → 10.0.6.
3. `qs` moderate x3: 6.16.0 direkt pin (3 snapshot dedupe oldu).
4. `uuid` moderate: tüketici yok → pin eklenmedi, 11.1.1 kurulu kopya budandı.
5. `@opennextjs/cloudflare` 2 high: 1.3.1 → 1.20.2 direkt bump.
6. `@ai-sdk/provider-utils` low: 5.0.25 → 5.0.34; ölü `@ai-sdk/ui-utils@1.2.11` direkt bağımlılığı SİLİNDİ (src'de import yok, 2.2.8 zincirini taşıyordu).

## SEC-002 — kalan 6 (bilinçli kabul, dev-only / upstream)

1. `tinypool@1.1.1` critical x2 — vitest 3 worker havuzu. Üretimde koşmaz (test runner). Fix = vitest 4 major + vite 7 kaskadı; ayrı sprintte ele alınacak.
2. `vitest`/`@vitest/mocker` moderate x2 — aynı gerekçe, dev-only.
3. `semver@5.3.0` high — SEC-001'de kayıtlı (`imap-simple > imap > utf7`), devDependencies ops scripti.
4. `braces` high — upstreamde yama YOK (patched: none). Geçici kabul; micromatch zinciri dev tooling.
5. 2026-10-21: `vite` 6.4.3 → 6.4.4 (1 high + 2 moderate kapatıldı, 9 → 6). `pnpm.overrides` bloğu bu repoda ETKİSİZDİR (kurulu sürümler kanıt); pinler direkt bağımlılıkla yapılır.

## Alınan ders (kalıcı)

- `pnpm-workspace.yaml` overrides bu repoda ETKİSİZ (kanıt: next 16.3.3 override'a rağmen 16.4.1 kurulu; SEC-001'de de kayıtlı). Güvenlik pinleri `package.json` direkt bağımlılık + lockfile ile yapılır.
- `pnpm add -w` bu repoda virtual-store hatası veriyor; düzenleme `package.json` + `pnpm install` ile yapılır.
