# ALPARAI Operasyon Kılavuzu (FAZ2 birleştirme)

> Dağınık OPS\_\* runbookların tek girişi. Detaylar ilgili dosyalarda.

- Afet kurtarma: `docs/OPS_DR_PLAYBOOK.md` + `.github/workflows/dr-drill.yml` (aylık kanıt)
- Rollback: `docs/OPS_ROLLBACK.md`
- SLO: `docs/OPS_SLO.md`
- Tedarik zinciri: `docs/OPS_SUPPLY_CHAIN.md`
- Kaos: `docs/OPS_CHAOS.md`
- Canlı sağlık: `/api/health` (degraded dahil), `/api/health/live`, `/api/health/unified`
- İç kota: `src/lib/internal/guard.ts` (600 req/min, ErcuOS dahil)
- B2B savunma: 30 gün (`src/lib/sla/defense.ts`), Art.73 vade (`src/lib/legal/article73.ts`)
