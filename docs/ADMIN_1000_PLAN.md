# ADMIN 1000/1000 — Darboğaz/Körnokta Listesi + Uygulama Planı (2026-10-20)

> Kural: kanıtsız madde yok. Her madde dosya:satır ile doğrulanabilir.

## BÖLÜM 1 — DARBOĞAZLAR (10)

1. **DB select("\*") yağmuru — 87 nokta.** En ağırları admin hookları:
   `use-admin-benchmarks.ts:48-52` (3 paralel limitsiz), `use-admin-ecosystem.ts:39-42`
   (4 paralel), `use-admin-signals.ts:44-49` (sla_alarms limitsizdi). → DÜZELTİLDİ
   (limit 200/200/200/50). Kalan 80 nokta faz-2'de kolon budaması bekliyor.
2. **cron/backup tam tablo dump** — `api/cron/backup/route.ts:29` limitsiz select +
   edge runtime'da `Buffer` (çalışmaz). → DÜZELTİLDİ (limit 2000 + rowCounts +
   runtime nodejs).
3. **API'de JS-tarafı agregasyon** — `v1/stats`, `insurtech/risk-model` 1000 satır
   çekip reduce yapıyor. Faz-2: DB view/rpc'ye taşınacak.
4. **Ortak admin kabuk YOK sanılmıştı — VAR** (`admin/layout.tsx` auth+sidebar+
   topbar). Gerçek eksik: skip-link, landmark, topbar search etiketi. → DÜZELTİLDİ.
5. **Sayfa şişkinliği** — incidents 701 satır, dashboard 546 satır. Dashboard'daki
   66 satırlık ölü mock const silindi. → KISMEN (bölme faz-2).
6. **Middleware sıcak yol** — her istekte vault/env zinciri (`middleware.ts:107`
   öncesi). Fail-closed'a çevrildi (önceki tur).
7. **Rate-limit Redis bağımlı** — kesintide yerel LRU var ama metriği kör.
   `internal/guard` sayacı eklendi (önceki tur). Upstash yokluğunda davranış testi eksik.
8. **Sovereign probe gecikmesi** — her `isConfigured()` 1sn probe. Sıcak yolda
   çağrılıyorsa kuyruk yapar. Faz-2: probe sonucu 60sn cachelenecek.
9. **i18n borcu** — 31 hardcoded sayfa iddiası + duplicate about/advisory-board.
   Açık kalem.
10. **Test coverage %26** — regresyon körlüğü. Yeni modüller %100 (article73, merkle,
    sla, guard). Kalan suite faz-2.

## BÖLÜM 2 — KÖRNOKTALAR (8)

- K1. Yük testi yok (10k rps iddiası belgesiz).
- K2. Gerçek Core Web Vitals verisi yok (bütçe iskeleti var).
- K3. TTFB 122sn (ErcuOS vitrin ölçümü) kök nedeni bilinmiyor.
- K4. AI gateway çağrı maliyeti izlenmiyor.
- K5. 1.892 NULL attribution sürüyor.
- K6. Bus factor 1.
- K7. `pnpm-workspace.yaml` overrides ETKİSİZ (kanıtlandı: next 16.3.3 override'a
  rağmen 16.4.1 kurulu). Güvenlik pinleri `package.json` + lockfile ile yapılır.
- K8. DR tatbikatı hiç koşmadı (workflow iskeleti var).

## BÖLÜM 3 — ADMİN 1000/1000 GÖREV LİSTESİ

### Faz A — tamamlanan (bu tur, commitli)

- [x] A1. Admin tasarım token katmanı (`globals.css`: `--admin-*`, light/dark).
- [x] A2. Layout a11y: skip-link + `#admin-main` + landmarks.
- [x] A3. Topbar search `type=search` + `aria-label`.
- [x] A4. `AdminPage`/`AdminEmptyState`/`AdminErrorState`/`AdminTableSkeleton`.
- [x] A5. incidents: sahte istatistikler canlı hesaba bağlandı, "WebSocket" yalanı
      kaldırıldı, formlara `aria-label`.
- [x] A6. dashboard: ölü mock const'lar silindi (-66 satır), api_keys `.limit(100)`.
- [x] A7. Hook trims + backup guard (B1/B2).

### Faz B — sıradaki (görsel QA ile)

- [ ] B1. 4 çekirdek bileşenin token migrasyonu (sidebar/topbar/metric/badge, 198 hex).
      Renkler birebir — ama GÖRSEL onay ister. Dosya başına atomik commit.
- [ ] B2. incidents 701 → `incidents-table.tsx` + `incident-inspector.tsx` +
      `incidents-stats.tsx` + `incidents-filters.tsx` bölünmesi.
- [ ] B3. dashboard 480 → `b2b-panel.tsx` + `risk-panel.tsx` bölünmesi.
- [ ] B4. Kalan 25 admin sayfasına `AdminPage` kabuğu.
- [ ] B5. Sovereign probe cache (B8), stats RPC taşıma (B3), Upstash-yok testi (B7).
- [ ] B6. Lighthouse CI + K1/K2 ölçümleri, K3 kök neden raporu.

## BÖLÜM 4 — SKOR ETKİSİ

- Güvenlik: full-tree 22 → 6, `--prod` 0. HARD GATE yeşil.
- Admin dürüstlük: 3 sahte gösterge (3.115/498/€87.5M statikleri, WebSocket
  yalanı, 66 satır ölü mock) temizlendi.
- Kalan 1000 yolu: B-fazları + para/hukuk kanıtları (LOI, TSA, pentest).
