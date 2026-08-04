-- Seed strategy innovations table with High-Priority Pilot Batch (I9, I10, I11) and update I5 status
-- Timestamp: 20260723000001

-- 1. Update I5 Browser Extension status to 'done' (SHIPPED in v10.70)
UPDATE public.strategy_innovations
SET status = 'done', updated_at = NOW()
WHERE title LIKE 'I5 —%';

-- 2. Insert High-Priority Pilot Batch Innovations (I9, I10, I11)
INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I9 — Slopsquatting Feed (Halüsine Paket Adı İzleme)', 'Kod-üretim AI''larının npm/PyPI''de olmayan hayali paket adları önermesini izleyen ve tedarik zinciri saldırılarını önleyen güvenlik akışı. Güvenlik araştırmacıları için premium feed.', 'high', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I9 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I10 — Ses / Deepfake Olay Kategorisi', 'ElevenLabs clone dolandırıcılıkları ve ses/video ihlalleri için özel veri şeması ve filigran/kaynak medya alanları.', 'high', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I10 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I11 — Regülatör Direkt-Feed API''si', 'EU AI Office, UK AISI ve US AISI için önceden formatlanmış olay akış kanalı. B2G kanalı, ALPAR''ı resmi kaynak seviyesine taşır.', 'high', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I11 —%');

-- ROLLBACK: DELETE FROM public.strategy_innovations WHERE title ~ '^I(9|10|11) —'; UPDATE public.strategy_innovations SET status = 'idea' WHERE title LIKE 'I5 —%';
