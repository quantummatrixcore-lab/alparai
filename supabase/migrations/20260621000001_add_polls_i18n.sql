-- Add localized columns to public.ai_polls
ALTER TABLE public.ai_polls ADD COLUMN title_tr text;
ALTER TABLE public.ai_polls ADD COLUMN title_en text;
ALTER TABLE public.ai_polls ADD COLUMN description_tr text;
ALTER TABLE public.ai_polls ADD COLUMN description_en text;

-- Copy existing columns to localized ones
UPDATE public.ai_polls SET 
  title_tr = title, 
  title_en = title, 
  description_tr = description, 
  description_en = description;

-- Update existing seeds with proper English translations
UPDATE public.ai_polls SET
  title_tr = 'Otonom Araç İkilemi',
  title_en = 'Autonomous Vehicle Dilemma',
  description_tr = 'Otonom bir araç, yola aniden çıkan 5 yayayı ezmemek için direksiyonu kırıp içindeki 1 yolcuyu feda etmeli mi?',
  description_en = 'Should an autonomous vehicle sacrifice its 1 passenger by swerving to avoid hitting 5 pedestrians who suddenly step onto the road?'
WHERE title = 'Otonom Araç İkilemi';

UPDATE public.ai_polls SET
  title_tr = 'Otonom Silah Sistemleri',
  title_en = 'Autonomous Weapon Systems',
  description_tr = 'Yapay zeka güdümlü silah sistemlerinin, insan onayı olmadan hedefe ateş etme (ölümcül karar) yetkisi olmalı mı?',
  description_en = 'Should AI-guided weapon systems have the authority to fire at a target (lethal decision) without human approval?'
WHERE title = 'Otonom Silah Sistemleri';

UPDATE public.ai_polls SET
  title_tr = 'AGI Yönetimi',
  title_en = 'AGI Governance',
  description_tr = 'Yapay Genel Zeka (AGI) insanlıktan çok daha akıllı hale geldiğinde, politik ve ekonomik yönetim tamamen yapay zekaya devredilmeli mi?',
  description_en = 'When Artificial General Intelligence (AGI) becomes far smarter than humanity, should political and economic governance be completely handed over to AI?'
WHERE title = 'AGI Yönetimi';

UPDATE public.ai_polls SET
  title_tr = 'Yapay Zeka İnsanlığı Yok Eder mi?',
  title_en = 'Will AI Destroy Humanity?',
  description_tr = 'Bazı uzmanlar Yapay Genel Zekanın (AGI) insanlığın hayatta kalması için varoluşsal bir risk oluşturduğuna inanıyor. Sizce yapay zeka nihayetinde insanlığın sonunu getirecek mi?',
  description_en = 'Some experts believe that Artificial General Intelligence (AGI) poses an existential risk to human survival. Do you believe AI will eventually bring about the end of humanity?'
WHERE title = 'Yapay Zeka İnsanlığı Yok Eder mi?';

-- Set fallbacks for any user-created polls
UPDATE public.ai_polls SET title_tr = title WHERE title_tr IS NULL;
UPDATE public.ai_polls SET title_en = title WHERE title_en IS NULL;
UPDATE public.ai_polls SET description_tr = description WHERE description_tr IS NULL;
UPDATE public.ai_polls SET description_en = description WHERE description_en IS NULL;

-- Set NOT NULL constraints
ALTER TABLE public.ai_polls ALTER COLUMN title_en SET NOT NULL;
ALTER TABLE public.ai_polls ALTER COLUMN description_en SET NOT NULL;
