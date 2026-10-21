# PERF nabız — 2026-10-21 (scripts/perf-probe.mjs)

> Yöntem: herkese açık GET uçlarına tek seferlik TTFB ölçümü (Istanbul → prod).
> Gerçek kullanıcı ölçümü (RUM) ve yük testi henüz yok — bu tablo sadece baz çizgisidir.

| uç                                              | durum   | süre (ms) | bütçe (ms) | sonuç                 |
| ----------------------------------------------- | ------- | --------- | ---------- | --------------------- |
| `/api/health`                                   | 200     | 707       | 1500       | OK                    |
| `/api/v1/stats`                                 | 200     | 140       | 3000       | OK                    |
| `/api/badge?provider=openai`                    | 200     | 39        | 3000       | OK                    |
| `/api/v1/models/openai/badge.svg`               | 200     | 121       | 3000       | OK                    |
| `/api/v1/academy/lessons?locale=tr`             | 200     | 32        | 3000       | OK                    |
| `/api/v1/arena/rankings`                        | **500** | 44        | 3000       | **HATA → DÜZELTİLDİ** |
| `/api/v1/public/domain-count?domain=openai.com` | 200     | 72        | 3000       | OK                    |
| `/tr`                                           | 200     | 261       | 3000       | OK                    |

## Bulgu + düzeltme (2026-10-21)

- Arena 500 veriyordu: kodda `model_slug` sütunu istenmiş, tabloda yok (`model_id` var).
  Düzeltildi: `model_id` çek + `ai_providers.slug` eşle + test eklendi.
- Tekrar koş: `node scripts/perf-probe.mjs` (deploy sonrası).

## Sıradaki ölçümler (yapılmadı)

- [ ] RUM (gerçek kullanıcı hızı) toplama
- [ ] Yük testi: 100 → 1000 eşzamanlı istekte p95
- [ ] TTFB 122sn iddiasının kök nedeni (ErcuOS vitrin ölçümü)
