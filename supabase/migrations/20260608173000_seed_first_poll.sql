-- Seed the first AI Dilemma poll
INSERT INTO ai_polls (id, title, description, yes_count, no_count, unsure_count, is_active)
VALUES (
  gen_random_uuid(),
  'Yapay Zeka İnsanlığı Yok Eder mi?',
  'Bazı uzmanlar Yapay Genel Zekanın (AGI) insanlığın hayatta kalması için varoluşsal bir risk oluşturduğuna inanıyor. Sizce yapay zeka nihayetinde insanlığın sonunu getirecek mi?',
  1450,
  890,
  340,
  true
);
