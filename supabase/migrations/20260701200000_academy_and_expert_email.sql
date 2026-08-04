-- expert_applications tablosuna email kolonu ekle
ALTER TABLE public.expert_applications
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS expertise_area text;

-- Academy SWOT kayıtları
INSERT INTO public.strategy_swot_items (category, title, description) VALUES
  ('strength',  'Academy Ortaklık Ağı', 'Boğaziçi, ODTÜ, İTÜ görüşmeleri aktif. Akademik meşruiyet eşsiz rekabet avantajı.'),
  ('strength',  'Disiplinlerarası Uzman Paneli', '6 ayrı uzmanlık alanında onaylı uzman başvuru sistemi canlıda.'),
  ('weakness',  'Academy Sayfası Yok Tur', 'Akademik ortaklık teklifleri için henüz kamuya açık çıkış sayfası eksik.'),
  ('opportunity','EU AI Act Madde 50 Uyumu', 'Akademik doğrulama gerektiren şeffaflık yükümlülükleri — ilk mover avantajı var.'),
  ('threat',    'Rakip Akademik Girişimler', 'MIT, Stanford ve Oxford HAI benzer akademik denetim programları planlıyor.');

-- Academy Risk kayıtları
INSERT INTO public.strategy_risks (code, title, description, probability, impact) VALUES
  ('RSK-ACAD-01', 'Üniversite MOU Gecikmesi', 'Pilot anlaşmaların bürokratik süreçte sürüncemede kalması.', 3, 4),
  ('RSK-ACAD-02', 'Akademik Güvenilirlik Krizi', 'Uzman panelinde çıkar çatışması iddiası.', 2, 5),
  ('RSK-ACAD-03', 'EU AI Act Yorumlanması', 'Akademik doğrulama standardının regülatörler tarafından farklı yorumlanması.', 3, 3)
ON CONFLICT (code) DO NOTHING;

-- Academy Q3-Q4 2026 Milestones
INSERT INTO public.strategy_milestones (quarter, title, okr_text, progress, status, linked_metric) VALUES
  ('2026-Q3', 'Academy Sayfası Canlıya Alma', 'ALPAR AI Academy sayfasını yayınla, nav+footer entegre et.', 90, 'in_progress', 'academy_page'),
  ('2026-Q3', 'İlk 3 MOU İmzası', 'Boğaziçi, ODTÜ veya İTÜ''den en az 1 pilot MOU al.', 15, 'in_progress', 'mou_count'),
  ('2026-Q3', 'Uzman Panel — 10 Onaylı Başvuru', 'Farklı disiplinlerden 10 uzman başvurusunu değerlendir ve onayla.', 20, 'planned', 'expert_count'),
  ('2026-Q4', 'Academy Beta Portalı', 'Akademisyenler için vaka kütüphanesi ve erişim platformu.', 0, 'planned', 'academy_beta'),
  ('2027-Q1', 'Global Sertifikasyon Programı', 'ALPAR AI Certified AI Auditor programı başlatılsın.', 0, 'planned', 'certification');
