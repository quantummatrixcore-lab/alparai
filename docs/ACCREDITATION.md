# ALPARAI Akreditasyon Yol Haritası (FAZ2)

> Hedef: 1000/1000 mührü için bağımsız doğrulanabilirlik.

## 1. ISO/IEC 27001 adaylık

- [ ] SoA kapsamı: `src/app/api`, `dehost/migrations`, `src/lib/security`
- [ ] Risk değerlendirmesi + `docs/SECURITY.md` eşleştirme
- [ ] İç denetim logu: `GATE_LOG.md`

## 2. ISO/IEC 27037 delil zinciri

- [x] `evidence_hash` zorunlu filtre (`canonical-stats`, `metrics-service`, `v1/stats`)
- [x] `/[locale]/verify/[hash]` kamu doğrulayıcı
- [ ] RFC 3161 TSA makbuzu (sıradaki iş: günlük Merkle kökü)

## 3. Pentest / VDP

- [ ] CREST/OSCP kör test teklifi
- [ ] `docs/HACKERONE_VDP_DRAFT.md` yayına alma
- [ ] Raporu `/security` altında yayınlama

## 4. EU AI Act

- [x] Art.73 vade motoru (`src/lib/legal/article73.ts` + `/api/v1/regulatory/dispatch`)
- [ ] AB AI Office XML/JSON-LD otomatik gönderim (sıradaki iş)

## 5. Finansal mühür

- [x] Stripe tek otorite (`.env.example`)
- [x] InsurTech iskelet (`/api/v1/insurtech/risk-model`)
- [ ] 2 LOI + metered-billing faturalandırma kanıtı
