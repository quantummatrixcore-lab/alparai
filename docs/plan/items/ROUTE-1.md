# ROUTE-1 — kapandı (v13.16). G-

- **Board id:** 329
- **Status:** completed
- **Priority:** P1
- **Owner:** **Mimar**
- **Closed by:** —

## Record

**ROUTE-1 — kapandı (v13.16).** G-6, Founder tarafından bu iş için açıkça askıya alındı. Üç parça: **(1)** yeni migration `20260912000000_fix_routing_chains_and_free_models.sql` altı zinciri yalnızca router'ın gerçekten tanıdığı modellere bağlar; **(2)** `model-router.ts` artık bilinmeyen model kimliklerini de eliyor (önceden yalnızca `DEGRADED` eleniyordu, var olmayan kimlik zincirde kalıp çağrı anında patlıyordu), `TaskDomain` dört alandan **altıya** çıkarıldı ve `code_generation`/`ethics_audit` için gerçek fallback dalları eklendi (ikisi de sessizce `fast_triage`'e düşüyordu); **(3)** `scripts/check-model-routing-consistency.mjs` + `ci.yml` adımı bunu kalıcı olarak zorluyor. **Negatif test:** düzeltme migration'ı geçici olarak kaldırıldığında zorlayıcı **exit 1** verip 8 sarkan referansı ve iki tamamen ulaşılamaz zinciri (`creative_copy`, `fast_triage`) tek tek raporladı; geri konduğunda exit 0. `closed-by:pending-push@master evidence:"zorlayıcı negatif testte 8 sarkan referans raporladı, düzeltmeyle exit 0"`
