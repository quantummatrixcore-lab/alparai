-- Seed realistic vote counts for existing dilemmas to resolve cold start
UPDATE public.ai_polls 
SET yes_count = 620, no_count = 412, unsure_count = 188 
WHERE title_en = 'Autonomous Vehicle Dilemma';

UPDATE public.ai_polls 
SET yes_count = 180, no_count = 1140, unsure_count = 210 
WHERE title_en = 'Autonomous Weapon Systems';

UPDATE public.ai_polls 
SET yes_count = 340, no_count = 820, unsure_count = 290 
WHERE title_en = 'AGI Governance';

UPDATE public.ai_polls 
SET yes_count = 1450, no_count = 890, unsure_count = 340 
WHERE title_en = 'Will AI Destroy Humanity?';

-- Insert 5 new dilemmas to bring total to 9
INSERT INTO public.ai_polls (title, title_en, title_tr, description, description_en, description_tr, yes_count, no_count, unsure_count, category, is_active)
VALUES
(
  'İşe Alımda Yapay Zeka Yanlılığı',
  'AI Bias in Hiring',
  'İşe Alımda Yapay Zeka Yanlılığı',
  'Şirketlerin işe alımlarda özgeçmiş filtrelemek için yapay zeka kullanması, iş sürecini hızlandırdığını iddia etseler bile yasal olarak yasaklanmalı mı?',
  'Should companies be legally prohibited from using AI filters to screen CVs, even if they claim it speeds up hiring?',
  'Şirketlerin işe alımlarda özgeçmiş filtrelemek için yapay zeka kullanması, iş sürecini hızlandırdığını iddia etseler bile yasal olarak yasaklanmalı mı?',
  512,
  678,
  142,
  'dilemma',
  true
),
(
  'Telifli Eserlerle Yapay Zeka Eğitimi',
  'AI Training on Copyrighted Art',
  'Telifli Eserlerle Yapay Zeka Eğitimi',
  'Yapay zeka şirketlerinin, eğitim veri setlerinde eserlerini kullandıkları sanatçılara ve yazarlara telif ücreti ödemesi zorunlu olmalı mı?',
  'Should AI companies be required to pay royalties to artists and writers for using their works in training datasets?',
  'Yapay zeka şirketlerinin, eğitim veri setlerinde eserlerini kullandıkları sanatçılara ve yazarlara telif ücreti ödemesi zorunlu olmalı mı?',
  1540,
  210,
  120,
  'dilemma',
  true
),
(
  'Tıbbi AI Hatalarında Sorumluluk',
  'Liability in AI Medical Errors',
  'Tıbbi AI Hatalarında Sorumluluk',
  'Bir yapay zeka tıbbi teşhis aracı zarar verici bir hata yaptığında, doktor yerine yapay zeka geliştiricisi yasal olarak sorumlu tutulmalı mı?',
  'When an AI medical diagnosis tool makes a mistake leading to harm, should the AI developer be held legally responsible instead of the doctor?',
  'Bir yapay zeka tıbbi teşhis aracı zarar verici bir hata yaptığında, doktor yerine yapay zeka geliştiricisi yasal olarak sorumlu tutulmalı mı?',
  730,
  480,
  320,
  'dilemma',
  true
),
(
  'Duygusal Yapay Zeka Arkadaşlığı',
  'Emotional AI Companions',
  'Duygusal Yapay Zeka Arkadaşlığı',
  'Sosyal medya platformları, insan sosyalleşmesi üzerindeki olası olumsuz etkileri nedeniyle romantik ilişkileri taklit eden yapay zeka arkadaşlık uygulamalarını kısıtlamalı mı?',
  'Should social media platforms restrict AI companion apps that mimic romantic relationships, due to potential impacts on human socializing?',
  'Sosyal medya platformları, insan sosyalleşmesi üzerindeki olası olumsuz etkileri nedeniyle romantik ilişkileri taklit eden yapay zeka arkadaşlık uygulamalarını kısıtlamalı mı?',
  890,
  520,
  240,
  'dilemma',
  true
),
(
  'Evrensel Deepfake Filigranı',
  'Universal Deepfake Watermarking',
  'Evrensel Deepfake Filigranı',
  'Tüm resim ve video oluşturma araçlarının, yapay zeka kökenini belirten görünmez, kaldırılamaz kriptografik filigranlar eklemesi yasal olarak zorunlu kılınmalı mı?',
  'Should all image and video generation tools be legally mandated to embed invisible, unremovable cryptographic watermarks indicating AI origin?',
  'Tüm resim ve video oluşturma araçlarının, yapay zeka kökenini belirten görünmez, kaldırılamaz kriptografik filigranlar eklemesi yasal olarak zorunlu kılınmalı mı?',
  1420,
  180,
  95,
  'dilemma',
  true
);
