-- Seed strategy innovations table with I-series proposals (I1-I8)
-- Timestamp: 20260715000001

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I1 — Incident Passport (Art. 73 resmi şablon çıktısı)', 'ALPAR kayıtlarını Komisyon''un resmi Art. 73 bildiri şablonu alanlarına tek tıkla dönüştürür. Taslak şablon kamuya açık; format uyumlu ilk platform olmak varsayılan hazırlık aracı olma fırsatı. Her dışa aktarılan pasaport ALPAR kökenini taşır.', 'high', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I1 — Incident Passport (Art. 73 resmi şablon çıktısı)');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I2 — ALPAR MCP Server / LLM Aracı', 'Olay API''sini yapay zeka ajanlarının sorgulayabileceği bir araç olarak sunar. Ajan ekosistemi büyüyor; ALPAR''ı kullanan ajanlar sıfır CAC dağıtım kanalı. Platform altyapıya dönüşür.', 'high', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I2 — ALPAR MCP Server / LLM Aracı');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I3 — Sağlayıcı Yanıt SLA Rozeti', 'Talep edilmiş profilli sağlayıcılar için gömülebilir ücretsiz "X gün içinde yanıtlar" rozeti. Sağlayıcılar ALPAR''ı kendileri reklam eder. İki taraflı kilit.', 'medium', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I3 — Sağlayıcı Yanıt SLA Rozeti');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I4 — Sigorta/Aktüeryal Veri Akışı', 'AI sorumluluk sigortacıları için kategori bazlı anonim olay sıklık/ağırlık verileri. Pazar büyüyor, zarar geçmişi yok. Kategoride ilk zarar verisi.', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I4 — Sigorta/Aktüeryal Veri Akışı');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I5 — Tarayıcı Eklentisi', 'URL + ekran görüntüsü yakalayarak submit akışına tek tıkla raporlama. Raporlama yükünü sıfıra yakın düşürür. Hacim büyüme motoru.', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I5 — Tarayıcı Eklentisi');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I6 — Model Sürüklenme İzleme', 'Sağlayıcı model kartı/sürüm değişikliklerini izler, olay artışlarıyla ilişkilendirir. Sessiz güncellemeler yaygın; kimse başarısızlıklarla ilişkilendirmiyor. Benzersiz uzunlamasına veri.', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I6 — Model Sürüklenme İzleme');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I7 — Araştırma Sanal Ortamı', 'PII maskelenmiş veri seti üzerinde onaylı akademisyenler için barındırılan not defterleri (F2 genişletmesi). Akademik alıntılar güvenilirlik vlanı oluşturur.', 'low', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I7 — Araştırma Sanal Ortamı');

INSERT INTO public.strategy_innovations (title, description, priority, status)
SELECT 'I8 — KVKK Köprüsü', 'Türk kamu kurumları için KVKK uyumlu yerelleştirilmiş olay bildirim biçimlendirmesi. ALPAR''ın TR kimliği hiçbir ABD rakibinin sahip olmadığı kama. Yerel pazar düzenleyici hendeği.', 'medium', 'idea'
WHERE NOT EXISTS (SELECT 1 FROM public.strategy_innovations WHERE title = 'I8 — KVKK Köprüsü');

-- ROLLBACK: DELETE FROM public.strategy_innovations WHERE title ~ '^I[1-8] —';
