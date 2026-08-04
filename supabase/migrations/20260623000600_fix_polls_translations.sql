-- Fix Dilemma 1
UPDATE public.ai_polls SET
  title = 'Otonom Araç İkilemi',
  title_tr = 'Otonom Araç İkilemi',
  title_en = 'Autonomous Vehicle Dilemma',
  description = 'Otonom bir araç, yola aniden çıkan 5 yayayı ezmemek için direksiyonu kırıp içindeki 1 yolcuyu feda etmeli mi?',
  description_tr = 'Otonom bir araç, yola aniden çıkan 5 yayayı ezmemek için direksiyonu kırıp içindeki 1 yolcuyu feda etmeli mi?',
  description_en = 'Should an autonomous vehicle sacrifice its 1 passenger by swerving to avoid hitting 5 pedestrians who suddenly step onto the road?'
WHERE title IN ('Otonom Araç İkilemi', 'Autonomous Vehicle Dilemma') 
   OR title_en = 'Autonomous Vehicle Dilemma' 
   OR title_tr = 'Otonom Araç İkilemi';

-- Fix Dilemma 2
UPDATE public.ai_polls SET
  title = 'Otonom Silah Sistemleri',
  title_tr = 'Otonom Silah Sistemleri',
  title_en = 'Autonomous Weapon Systems',
  description = 'Yapay zeka güdümlü silah sistemlerinin, insan onayı olmadan hedefe ateş etme (ölümcül karar) yetkisi olmalı mı?',
  description_tr = 'Yapay zeka güdümlü silah sistemlerinin, insan onayı olmadan hedefe ateş etme (ölümcül karar) yetkisi olmalı mı?',
  description_en = 'Should AI-guided weapon systems have the authority to fire at a target (lethal decision) without human approval?'
WHERE title IN ('Otonom Silah Sistemleri', 'Autonomous Weapon Systems')
   OR title_en = 'Autonomous Weapon Systems'
   OR title_tr = 'Otonom Silah Sistemleri';

-- Fix Dilemma 3
UPDATE public.ai_polls SET
  title = 'AGI Yönetimi',
  title_tr = 'AGI Yönetimi',
  title_en = 'AGI Governance',
  description = 'Yapay Genel Zeka (AGI) insanlıktan çok daha akıllı hale geldiğinde, politik ve ekonomik yönetim tamamen yapay zekaya devredilmeli mi?',
  description_tr = 'Yapay Genel Zeka (AGI) insanlıktan çok daha akıllı hale geldiğinde, politik ve ekonomik yönetim tamamen yapay zekaya devredilmeli mi?',
  description_en = 'When Artificial General Intelligence (AGI) becomes far smarter than humanity, should political and economic governance be completely handed over to AI?'
WHERE title IN ('AGI Yönetimi', 'AGI Governance', 'AGI Yönetişimi')
   OR title_en = 'AGI Governance'
   OR title_tr = 'AGI Yönetimi';

-- Fix Dilemma 4
UPDATE public.ai_polls SET
  title = 'Yapay Zeka İnsanlığı Yok Eder mi?',
  title_tr = 'Yapay Zeka İnsanlığı Yok Eder mi?',
  title_en = 'Will AI Destroy Humanity?',
  description = 'Bazı uzmanlar Yapay Genel Zekanın (AGI) insanlığın hayatta kalması için varoluşsal bir risk oluşturduğuna inanıyor. Sizce yapay zeka nihayetinde insanlığın sonunu getirecek mi?',
  description_tr = 'Bazı uzmanlar Yapay Genel Zekanın (AGI) insanlığın hayatta kalması için varoluşsal bir risk oluşturduğuna inanıyor. Sizce yapay zeka nihayetinde insanlığın sonunu getirecek mi?',
  description_en = 'Some experts believe that Artificial General Intelligence (AGI) poses an existential risk to human survival. Do you believe AI will eventually bring about the end of humanity?'
WHERE title IN ('Yapay Zeka İnsanlığı Yok Eder mi?', 'Will AI Destroy Humanity?')
   OR title_en = 'Will AI Destroy Humanity?'
   OR title_tr = 'Yapay Zeka İnsanlığı Yok Eder mi?';
