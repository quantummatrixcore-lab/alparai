-- Seed strategy_todos from ALPAR AI ROADMAP.md
-- Only INSERT, no DELETE. ON CONFLICT DO NOTHING ensures idempotency.

INSERT INTO strategy_todos (title, priority, is_completed, created_at, updated_at) VALUES

-- ÖNCELİK 1 — ACİL (Bu Hafta)
('Cloudflare Email Routing: hello@, press@, academy@, security@ → ercuerden@gmail.com', 1, false, now(), now()),
('Twitter/X hesabı aç: @alparai_official', 1, false, now(), now()),
('LinkedIn Şirket Sayfası aç: linkedin.com/company/alparai', 1, false, now(), now()),
('YouTube Kanalı aç: ALPAR AI', 1, false, now(), now()),
('HackerNews Show HN gönderisi yayınla — "I built Trustpilot for AI after Grok asked for my passport"', 1, false, now(), now()),
('Reddit gönderileri: r/MachineLearning, r/artificial, r/ArtificialIntelligence', 1, false, now(), now()),
('Prof. Dr. İsmail Hakkı Aydın davet maili gönder (ALPAR AI Uzman Paneli)', 1, false, now(), now()),
('LinkedIn Video 1 "The Lie" — Google Flow + CapCut, soru ile bitecek caption', 1, false, now(), now()),
('KVKK resmi şikayet: kvkk.gov.tr — Şikayet metni hazır', 1, false, now(), now()),
('Paul Maréchal görüşmesi — Ercüment açacak, Ali devralacak', 1, false, now(), now()),
('Ahmet''e 7 haberi gönder (AHMET_7_HABER_FINAL.md)', 1, false, now(), now()),

-- ÖNCELİK 2 — KRİTİK (Bu Ay)
('AI Influencer Outreach: Gary Marcus, Timnit Gebru, Emily Bender, Margaret Mitchell, Ethan Mollick', 2, false, now(), now()),
('AI Medya Outreach: MIT Technology Review, 404 Media, Import AI (Jack Clark), Semafor, The Information', 2, false, now(), now()),
('Uluslararası Medya: TechCrunch, Wired, Guardian WhatsApp, BBC WhatsApp', 2, false, now(), now()),
('AI Güvenlik Kuruluşları: AI Incident Database, AI Now Institute, DAIR Institute, EFF', 2, false, now(), now()),
('Anthropic Verified Respondent teklifi gönder: press@anthropic.com', 2, false, now(), now()),
('Anthropic API Kredisi başvurusu: anthropic.com/startups', 2, false, now(), now()),
('Google for Startups başvurusu: startup.google.com', 2, false, now(), now()),
('AWS Activate başvurusu: aws.amazon.com/activate', 2, false, now(), now()),
('TÜBİTAK 1512 ön kayıt: bigg.team — 200.000 TL hibe, sıfır hisse', 2, false, now(), now()),
('Expert Panel — İlk 10 uzman davet et (Akademisyen, Avukat, Doktor, Etik Uzman)', 2, false, now(), now()),
('ercumenterden.com güncellemesi (Antigravity master prompt hazır)', 2, false, now(), now()),
('Site güncellemeleri (SITE_GUNCELLEME_MASTER_PROMPT.md)', 2, false, now(), now()),
('Sosyal medya içerik takvimi: Haftada 3 gönderi minimum, video öncelikli', 2, false, now(), now()),
('LinkedIn Video 2 "The Mirror" — Sycophancy konusu, profesyonel kitleye', 2, false, now(), now()),
('LinkedIn Video 3 "The Question" — AI silah sorusu, tartışma yaratır', 2, false, now(), now()),
('Newsletter başlat: "ALPAR AI Monthly Trust Report" — Substack ücretsiz', 2, false, now(), now()),
('Product Hunt lansmanı planla: 2-3 hafta sonra, 500 upvote için topluluk oluştur', 2, false, now(), now()),
('Podcast outreach: Latent Space, Practical AI (changelog.com/practicalai), Last Week in AI', 2, false, now(), now()),
('Instagram hesabı aç: @alparai.official (Reels/video içerik)', 2, false, now(), now()),
('TikTok hesabı aç: @alparai (genç kitleye ulaşmak)', 2, false, now(), now()),

-- ÖNCELİK 3 — ÖNEMLİ (1-3 Ay)
('EIC Pre-Accelerator Başvurusu: ec.europa.eu/eic — €500K-1M, sıfır hisse', 3, false, now(), now()),
('University MOU Outreach: Boğaziçi, ODTÜ veya İTÜ — AI etik araştırma grubu', 3, false, now(), now()),
('Product Hunt Launch: producthunt.com/posts/alpar-ai — 500+ upvote hedefi', 3, false, now(), now()),
('Advisory Board — 3 Kişi: Akademisyen + Hukukçu + Güvenlik Uzmanı (ücretsiz)', 3, false, now(), now()),
('GitHub Repo Split: Public frontend + veri şeması / Private moderasyon algoritması', 3, false, now(), now()),
('Response Rate Metric: Leaderboard ve provider profil sayfalarına yanıt oranı ekle', 3, false, now(), now()),
('Developer API: Güvenlik araştırmacıları için programatik erişim (v1/leaderboard)', 3, false, now(), now()),
('Lloyd''s of London ilk temas: insurtech@lloyds.com — sigorta sektörü ortaklığı', 3, false, now(), now()),
('Future of Life Institute Grant: futureoflife.org/grants — AI safety odaklı', 3, false, now(), now()),
('Open Philanthropy Grant Başvurusu: openphilanthropy.org', 3, false, now(), now()),
('Şirket tescili: Hukuki süreç başlatılmalı', 3, false, now(), now()),
('Gizlilik politikası tam değil: Avukat incelemesi', 3, false, now(), now()),

-- ÖNCELİK 4 — ORTA VADEDE (3-6 Ay)
('Academy Beta Portalı: Akademisyenler için vaka kütüphanesi ve erişim platformu', 4, false, now(), now()),
('Annual AI Trust Report (1. yıl): Platform verilerine + Uzman panel katkısına dayalı', 4, false, now(), now()),
('EIC Accelerator Full Başvurusu: €2.5M hibe + €10M equity (traction gerekiyor önce)', 4, false, now(), now()),
('Türk Angel Yatırımcı Görüşmeleri: Fonbulucu.com — 500+ kullanıcı + $5K MRR sonrası', 4, false, now(), now()),
('TÜBİTAK 1812 BiGG Yatırım (1512 tamamlandıktan sonra)', 4, false, now(), now()),
('Global Sertifikasyon Programı: ALPAR AI Certified AI Auditor — 2027 hedefi', 4, false, now(), now()),

-- ÖNCELİK 5 — UZUN VADEDE (6-24 Ay)
('Türk VC Görüşmeleri: 212, Revo Capital, Esas — $10K MRR sonrası', 5, false, now(), now()),
('Global VC Seri A: a16z, Sequoia, Accel — $100K MRR + Lloyd''s ortaklığı sonrası', 5, false, now(), now()),
('Küresel YZ Suç Veritabanı (Senaryo A)', 5, false, now(), now()),
('Etik Değerlendirme Çerçevesi / AB YZ Yasası Uyumluluk Karneleri (Senaryo B)', 5, false, now(), now()),
('Halka Açık YZ Agoraları — Arabuluculuk Sistemi (Senaryo C)', 5, false, now(), now()),
('ALPAR AI Certification Programı', 5, false, now(), now())

ON CONFLICT DO NOTHING;
