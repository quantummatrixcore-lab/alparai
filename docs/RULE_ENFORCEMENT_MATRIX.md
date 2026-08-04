# Rule Enforcement Matrix

Doktrin Kural 31 uyarınca, mevcut Kural 1-30 taranmış ve yaptırımı olmayan kurallar işaretlenmiştir.

| Kural No | Açıklama                                         | Yaptırım Tipi     | Yaptırım Dosyası                          | Durum                       |
| -------- | ------------------------------------------------ | ----------------- | ----------------------------------------- | --------------------------- |
| Kural 1  | Push before report                               | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 2  | Out-of-scope commit yasak (PROPOSALS/)           | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 3  | no-any (`any` kullanımı yasak)                   | ESLint            | `.eslintrc` / `pnpm lint`                 | YAPTIRIMLI                  |
| Kural 4  | Strict indexed access (noUncheckedIndexedAccess) | TypeScript        | `tsconfig.json` / `pnpm typecheck`        | YAPTIRIMLI                  |
| Kural 5  | Client-side `supabase.from().insert()` yasak     | ESLint / Vitest   | `pnpm lint` / `pnpm test`                 | YAPTIRIMLI                  |
| Kural 6  | İletişim onayı (External communications)         | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 7  | Her tablo RLS politikası içermeli                | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 8  | Kaynak zorunluluğu                               | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 9  | PII Guardian (Free-text maskeleme)               | Vitest            | `tests/lib/pii/`                          | YAPTIRIMLI                  |
| Kural 10 | Veriler (figures) kaynak göstermeli              | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 11 | Yedekleme (Backup snapshots)                     | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 12 | Migration'larda `-- ROLLBACK:` bloğu             | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 13 | i18n parity (EN ↔ TR tam kapsam)                 | Vitest            | `tests/i18n/missing-keys.test.ts`         | YAPTIRIMLI                  |
| Kural 14 | MASTER_PLAN.md'yi Executor değiştiremez          | Pre-commit Hook   | `.git/hooks/pre-commit`                   | YAPTIRIMLI                  |
| Kural 15 | Tek dal (`master`) ve PR yasak                   | Branch Protection | `GitHub Settings`                         | YAPTIRIMLI                  |
| Kural 16 | Tüm endpoint'lerde rate-limit                    | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 17 | v1 API auth (sha256 + timingSafeEqual)           | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 18 | Sırlar .env üzerinden yönetilir                  | Secret Scanning   | `GitHub / pnpm lint`                      | YAPTIRIMLI                  |
| Kural 19 | Numeric honesty                                  | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 20 | Maliyet alarm cron (Cost budget alarm)           | Cron Job          | `src/app/api/cron/cost-alarm/route.ts`    | YAPTIRIMLI                  |
| Kural 21 | Rule logger ile ihlal kaydı                      | tsc / Vitest      | `src/lib/audit/rule-logger.ts`            | YAPTIRIMLI                  |
| Kural 22 | Otonom döngü takibi                              | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 23 | Post-launch kuyrukta tarih kullanılmaz           | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 24 | Verified-Against hash bildirimi zorunlu          | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 25 | Executor kendini Architect imzalayamaz           | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 26 | PII loglanamaz (Hash ile loglanır)               | Vitest            | `tests/lib/hash.test.ts`                  | YAPTIRIMLI                  |
| Kural 27 | Dependency güvenlik taraması                     | CI Job            | `.github/workflows/architect-trigger.yml` | YAPTIRIMLI                  |
| Kural 28 | Otonom durdurma (Kota aşımlarında)               | Cron Job          | `src/app/api/cron/cost-alarm/route.ts`    | YAPTIRIMLI                  |
| Kural 29 | İngilizce profesyonel dil kullanımı              | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |
| Kural 30 | "Done" = Onaylı + Güvenli + Gerçek veri          | -                 | -                                         | **[TAVSİYE — yaptırımsız]** |

### Özet Analiz

- **Toplam Kural:** 30
- **Yaptırımlı Kural Sayısı:** 12
- **Yaptırımsız Kural Sayısı:** 18
- **Yaptırımlı Kural Oranı:** %40
