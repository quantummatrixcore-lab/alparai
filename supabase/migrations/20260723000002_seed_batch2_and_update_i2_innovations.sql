-- Seed strategy innovations Batch 2 (I12-I18) and update I1 and I2 statuses
-- Timestamp: 20260723000002

-- 1. Update I1 status to 'done' (SHIPPED in 66707f8)
UPDATE public.strategy_innovations
SET status = 'done', updated_at = NOW()
WHERE title LIKE 'I1 —%' OR title LIKE 'Incident Passport%';

-- 2. Update I2 status to 'done' (SHIPPED in current build)
UPDATE public.strategy_innovations
SET status = 'done', updated_at = NOW()
WHERE title LIKE 'I2 —%' OR title LIKE '%MCP Server%';

-- 3. Insert Batch 2 Candidate Innovations (I12 - I18)
INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I12 — Dikey Sektör Playbook''ları (Sağlık/Hukuk/Finans)', 'Sektör-özel intake formları ve hukuki şablonlar. Enterprise satış kancası, FDA/BaFin/HIPAA haritalaması.', 'medium', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I12 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I13 — Prompt Injection Müzesi (Reproducible Jailbreak)', 'Chatbot Arena benzeri; PII maskeli, reproducible, model versiyon etiketli red-team kütüphanesi.', 'medium', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I13 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I14 — AI Vendor Trust Score (Halka Açık Sıralama)', 'Olay verisi, SLA ve yanıt kalitesi bileşiği. Basın için ALPAR endeksi kancası.', 'medium', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I14 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I15 — TR Dil Bias Benchmark (BENCH-TR)', 'Türkçe-öncelikli bias ve doğruluk değerlendirme kiti. Akademik ve regülasyon hendeği.', 'medium', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I15 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I16 — Whistleblower Portal (Anonim Çalışan Bildirimi)', 'Signal-tarzı anonim ihbar portalı. AI lab çalışanlarından etik ve güvenlik uyarıları.', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I16 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I17 — Litigasyon Destek Paketi', 'Avukatlar için PII-scrubbed kanıt paketi (ihlal ID, timestamp, chain-of-custody metadata).', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I17 —%');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I18 — İçerik Köken İzleyici (C2PA/Watermark Doğrulama)', 'C2PA imzasını ve SynthID filigranlarını doğrulayan ücretsiz kamu aracı.', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title LIKE 'I18 —%');

-- ROLLBACK: DELETE FROM public.strategy_innovations WHERE title ~ '^I(12|13|14|15|16|17|18) —';
