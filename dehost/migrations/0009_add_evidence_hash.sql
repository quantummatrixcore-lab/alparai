-- 0009 — incidents.evidence_hash: sayaçların ve doğrulayıcının dayandığı delil mührü.
--
-- GEÇMİŞ: Sayaç sorgularına evidence_hash filtresi, sütun canlıda doğrulanmadan
-- eklenmişti (2026-10-20 geri alındı). Doğru sıra: ÖNCE sütun + hash üretimi +
-- backfill, SONRA filtre. Bu migration 1. adımdır.
--
-- Hash formatı: sha256hex("<source>|<externalId>|<title>") — importer ile AYNI
-- formül (src/lib/import/incident-importer.ts :: computeEvidenceHash).
-- Aynı formül = tekrar import hash'i değiştirmez, upsert stabil kalır.

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS evidence_hash text;

CREATE INDEX IF NOT EXISTS idx_incidents_evidence_hash
  ON public.incidents (evidence_hash);

-- 2. adım (migration SONRASI sunucuda çalıştırılacak):
--   pnpm backfill:evidence
-- 3. adım: backfill bitip NULL kalmadığı doğrulanınca sayaçlara
--   .not('evidence_hash','is',null) filtresi geri eklenebilir.
