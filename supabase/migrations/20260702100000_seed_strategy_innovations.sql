-- Seed strategy innovations table with brainstormed ideas
-- Timestamp: 20260702100000

INSERT INTO public.strategy_innovations (title, description, priority, status)
VALUES
  ('Otomatik Vaka Kuyruğu (Reddit & HN)', 'Reddit (r/ChatGPT, r/MachineLearning) ve HackerNews üzerinden "hallucination", "AI fail", "AI bias" gibi terimlerle günlük otomatik ihlal verisi çekip moderasyon sırasına ekleyen entegrasyon.', 'high', 'planned'),
  ('AI Haberleri (AI News Feed)', 'Yapay zeka güvenliği, etik ve regülasyonlar (EU AI Act, KVKK) ile ilgili dünya çapındaki haberleri platformda yayınlamak için NewsAPI veya RSS toplayıcı geliştirilmesi.', 'medium', 'idea'),
  ('Topluluk Doğrulaması (Community Notes)', 'Kullanıcıların ihlal bildirimlerine "Doğru", "Eksik Bilgi", "Giderildi" şeklinde topluluk notları ekleyebileceği, Twitter benzeri bir doğrulama sistemi.', 'medium', 'idea'),
  ('Sağlayıcı Yanıt Süresi Canlı Sayacı', 'Yapay zeka sağlayıcılarının (OpenAI, Anthropic) kendilerine iletilen şikayetlere verdikleri resmi yanıt sürelerini canlı olarak izleyen Leaderboard metriği.', 'low', 'idea'),
  ('AI Auditor Bounty & Rozet Sistemi', 'Platformda en çok doğrulanmış kritik ihlal bildiren kullanıcılara "AI Auditor" rozeti verilmesi ve B2B sponsorlar aracılığıyla ödüllendirme mekanizması kurulması.', 'low', 'idea'),
  ('Admin Paneli Profesyonel Arayüz Güncellemesi', 'Admin panelinin görsel ağırlıklı, mini grafikler (sparklines) ve senkronize animasyonlu sağ menü düzeniyle daha profesyonel bir görünüme kavuşturulması.', 'high', 'in_progress')
ON CONFLICT DO NOTHING;
