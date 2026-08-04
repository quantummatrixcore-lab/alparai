import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf-8');
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)?.[1];

if (!serviceKey || !url) {
  console.error("Missing SUPABASE URL or SERVICE ROLE KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const posts = [
  // T-21 (July 12, 2026)
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[EN] T-21: The Accountability Gap Countdown',
    body_text: 'In 21 days, the EU AI Act\'s mandatory incident reporting was supposed to go live. But with the Digital Omnibus deferring rules to Dec 2027, a critical Accountability Gap has opened. ALPAR AI launches on Aug 2 to fill this void voluntarily. 👉 alparai.com #AIAccountability #EUAIAct',
    image_prompt: 'Concept art of a physical gap between two high-tech bridges, representing the AI Accountability Gap. Dark slate and emerald brand colors, 1200x628px',
    scheduled_at: '2026-07-12T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[EN] T-21: The 17-Month AI Accountability Gap',
    body_text: 'In exactly 21 days, the EU AI Act\'s Article 73 serious incident reporting was scheduled to enter into force.\n\nInstead, the adoption of the EU Digital Omnibus has deferred these high-risk obligations to December 2, 2027. This 17-month delay leaves a massive Accountability Gap.\n\nAI risks aren\'t pausing for 17 months. Neither are we.\n\nALPAR AI launches on August 2 as the first voluntary, independent public incident tracker aligned with the Article 73 taxonomy.\n\nRead our spec and prepare for launch: 👉 alparai.com\n\n#AIAccountability #AICompliance #EUAIAct #AISafety',
    image_prompt: 'Professional infographic detailing the timeline shift from August 2026 to December 2027. Emerald green accents, dark mode theme, 1200x628px',
    scheduled_at: '2026-07-12T09:00:00Z',
  },
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[TR] T-21: Hesap Verebilirlik Boşluğu Geri Sayımı',
    body_text: '21 gün sonra AB Yapay Zeka Yasası zorunlu olay raporlaması başlayacaktı. Ancak Digital Omnibus ile kurallar Aralık 2027\'ye ertelendi ve büyük bir boşluk oluştu. ALPAR AI 2 Ağustos\'ta bu boşluğu doldurmak için açılıyor. 👉 alparai.com #AIAccountability #YapayZeka',
    image_prompt: 'Yapay zeka hesap verebilirlik boşluğunu temsil eden iki teknolojik köprü arasındaki boşluk tasarımı. Koyu slate ve zümrüt yeşili renkler, 1200x628px',
    scheduled_at: '2026-07-12T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[TR] T-21: 17 Aylık Yapay Zeka Hesap Verebilirlik Boşluğu',
    body_text: 'Tam 21 gün sonra, AB Yapay Zeka Yasası\'nın Madde 73 ciddi olay raporlama yükümlülükleri yürürlüğe girecekti.\n\nAncak AB Konseyi\'nin kabul ettiği Digital Omnibus yönergesiyle bu kurallar 2 Aralık 2027 tarihine ertelendi. Bu durum, 17 aylık devasa bir Hesap Verebilirlik Boşluğu (Accountability Gap) yarattı.\n\nYapay zeka hataları ve riskleri 17 ay boyunca durmayacak. Biz de durmuyoruz.\n\nALPAR AI, Madde 73 taksonomisiyle hizalı ilk bağımsız olay sicili olarak 2 Ağustos\'ta açılıyor. Regülasyonlardan önce şeffaflığı başlatıyoruz.\n\nDetaylar için web sitemizi inceleyin: 👉 alparai.com\n\n#AIAccountability #YapayZeka #ABYapayZekaYasası #Teknoloji',
    image_prompt: 'Ağustos 2026\'dan Aralık 2027\'ye kayan yasal takvimi gösteren profesyonel infografik. Koyu tema, zümrüt yeşili tonlar, 1200x628px',
    scheduled_at: '2026-07-12T09:00:00Z',
  },

  // T-14 (July 19, 2026)
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[EN] T-14: AI Risks Aren\'t Waiting',
    body_text: '14 days until the Accountability Gap starts. While regulators paused mandatory reporting until Dec 2027, AI failures in production continue. ALPAR AI launches on Aug 2 to provide independent, public tracking for AI incidents. 👉 alparai.com #AIAccountability #ResponsibleAI',
    image_prompt: 'Digital abstract representation of AI system errors occurring in real-time. Neon green warning indicators, dark slate background, 1200x628px',
    scheduled_at: '2026-07-19T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[EN] T-14: Regulators Paused. AI Risks Haven\'t.',
    body_text: 'Only 14 days left until the Accountability Gap begins.\n\nWhile EU regulators decided to postpone mandatory reporting rules for high-risk systems, businesses and developers are deploying agentic AI systems daily. The risks of hallucinations, data leaks, and compliance errors are active right now.\n\nALPAR AI launches on August 2 to bridge this 17-month gap by establishing a permanent, voluntary public record.\n\nWe provide independent verification and a provider right-of-reply flow.\n\nJoin the transparency layer: 👉 alparai.com\n\n#AIAccountability #ResponsibleAI #AICompliance #AISafety',
    image_prompt: 'Professional visualization of AI security metrics and audit logs. Clean and modern dark theme, 1200x628px',
    scheduled_at: '2026-07-19T09:00:00Z',
  },
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[TR] T-14: YZ Riskleri Beklemiyor',
    body_text: 'Hesap Verebilirlik Boşluğu\'na 14 gün kaldı. Regülatörler zorunlu raporlamayı Aralık 2027\'ye ertelese de yapay zeka hataları devam ediyor. ALPAR AI, şeffaf takip sağlamak için 2 Ağustos\'ta açılıyor. 👉 alparai.com #AIAccountability #YZGüvenliği',
    image_prompt: 'Gerçek zamanlı yapay zeka sistem hatalarını temsil eden soyut dijital tasarım. Neon yeşil uyarı işaretleri, koyu arka plan, 1200x628px',
    scheduled_at: '2026-07-19T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[TR] T-14: Regülatörler Durdu, Yapay Zeka Riskleri Durmadı.',
    body_text: 'Hesap Verebilirlik Boşluğu\'nun (Accountability Gap) başlamasına sadece 14 gün kaldı.\n\nAB regülatörleri yüksek riskli sistemler için raporlama kurallarını ertelerken, şirketler her gün otonom yapay zeka ajanlarını yayına alıyor. Halüsinasyon, veri sızıntısı ve uyumluluk hataları şu an aktif riskler.\n\nALPAR AI, 2 Ağustos\'ta bu 17 aylık boşluğu doldurmak ve kalıcı, gönüllü bir kamu sicili oluşturmak için açılıyor.\n\nİlk 100 bildirim için Kurucu Raportör rozeti verilecektir.\n\nŞeffaflık hareketine katılın: 👉 alparai.com\n\n#AIAccountability #YapayZeka #TeknolojiYönetimi #GüvenliYZ',
    image_prompt: 'Yapay zeka güvenlik metrikleri ve denetim kayıtlarının profesyonel görselleştirmesi. Zümrüt yeşili detaylar, 1200x628px',
    scheduled_at: '2026-07-19T09:00:00Z',
  },

  // T-7 (July 26, 2026)
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[EN] T-7: 1 Week to Accountability',
    body_text: '7 days left. The original EU AI Act timeline is deferred, leaving the public without an official AI registry for the next 17 months. ALPAR AI is launching next week to ensure transparency remains active. 👉 alparai.com #AIAccountability #AIAct',
    image_prompt: 'Minimalist clock ticking down to zero, embedded in a digital blockchain matrix. Emerald accents, dark mode styling, 1200x628px',
    scheduled_at: '2026-07-26T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[EN] T-7: The Countdown to AI Transparency',
    body_text: 'Just 1 week until ALPAR AI goes live.\n\nWith the deferral of mandatory EU AI Act serious incident reporting, the next 17 months will be a period of regulatory quiet. But quiet shouldn\'t mean blind.\n\nALPAR AI is launching to provide a public, community-governed registry where AI incidents are documented and providers can publicly respond.\n\nWe\'ve already seeded 400+ historical incidents to ensure a robust launch database.\n\nBe ready for the launch on August 2: 👉 alparai.com\n\n#AIAccountability #AIAct #Transparency #AISafety',
    image_prompt: 'Clean infographic showing a checklist for AI Act readiness. Dark mode background with neon green checkmarks, 1200x628px',
    scheduled_at: '2026-07-26T09:00:00Z',
  },
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[TR] T-7: Şeffaflığa Son 1 Hafta',
    body_text: 'Son 7 gün. Ertelenen AB Yapay Zeka Yasası nedeniyle 17 ay boyunca resmi bir sicil olmayacak. ALPAR AI, şeffaflığı canlı tutmak için önümüzdeki hafta yayında. 👉 alparai.com #AIAccountability #ABYapayZekaYasası',
    image_prompt: 'Dijital blokzincir matrisine gömülü, sıfıra doğru ilerleyen minimalist bir saat tasarımı. Zümrüt yeşili detaylar, 1200x628px',
    scheduled_at: '2026-07-26T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[TR] T-7: Yapay Zeka Şeffaflığı İçin Geri Sayım',
    body_text: 'ALPAR AI\'ın açılmasına sadece 1 hafta kaldı.\n\nAB Yapay Zeka Yasası zorunlu ciddi olay bildiriminin ertelenmesiyle önümüzdeki 17 ay yasal bir sessizlik dönemi olacak. Ancak sessizlik körlük anlamına gelmemelidir.\n\nALPAR AI, yapay zeka olaylarının belgelendiği ve sağlayıcıların resmi yanıt hakkını kullanabildiği bağımsız bir kamu sicili olarak yayına giriyor.\n\nVeritabanımızda şimdiden 400\'den fazla geçmiş olay hazır durumda.\n\n2 Ağustos açılışına hazır olun: 👉 alparai.com\n\n#AIAccountability #Şeffaflık #YapayZeka #Girişimcilik',
    image_prompt: 'AB Yapay Zeka Yasası uyumluluk kontrol listesini gösteren şık tasarım. Koyu tema, neon yeşil onay işaretleri, 1200x628px',
    scheduled_at: '2026-07-26T09:00:00Z',
  },

  // T-3 (July 30, 2026)
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[EN] T-3: The $25M Risk',
    body_text: '3 days until launch. AI liability insurance limits are soaring up to $25M, yet incident data remains scarce. The 17-month Accountability Gap starts on August 2. ALPAR AI is the independent trust registry. 👉 alparai.com #AILiability #InsurTech',
    image_prompt: 'A sleek visual concept representing financial risk protection and AI trust. Premium glassmorphism layout, 1200x628px',
    scheduled_at: '2026-07-30T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[EN] T-3: Managing AI Liability in the Accountability Gap',
    body_text: 'Only 3 days until the start of the Accountability Gap on August 2.\n\nDid you know standalone AI liability insurance limits have reached up to $25M? GenAI litigation is up 137% year-over-year. The insurance market needs structured, reliable incident data to underwrite these risks.\n\nWith mandatory reporting delayed to Dec 2027, ALPAR AI steps in as the industry\'s voluntary transparency register.\n\nWe provide the data layer required for AI trust and underwriting.\n\nLaunch is in 3 days: 👉 alparai.com\n\n#AILiability #InsurTech #AIInsurance #RiskManagement',
    image_prompt: 'Infographic displaying AI insurance growth stats and market limits. Slate background with glowing cyan and zümrüt accents, 1200x628px',
    scheduled_at: '2026-07-30T09:00:00Z',
  },
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[TR] T-3: 25 Milyon Dolarlık Risk',
    body_text: 'Açılışa son 3 gün. Yapay zeka sorumluluk sigortası limitleri 25 milyon dolara ulaştı ancak olay verileri yetersiz. 17 aylık Hesap Verebilirlik Boşluğu 2 Ağustos\'ta başlıyor. ALPAR AI bağımsız sicil olarak hazır. 👉 alparai.com #AILiability #SigortaTeknolojileri',
    image_prompt: 'Finansal risk koruması ve yapay zeka güvenini temsil eden şık görsel konsept. Premium cam efekti tasarımı, 1200x628px',
    scheduled_at: '2026-07-30T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[TR] T-3: Hesap Verebilirlik Boşluğunda Yapay Zeka Risk Yönetimi',
    body_text: 'Hesap Verebilirlik Boşluğu\'nun 2 Ağustos\'ta başlamasına sadece 3 gün kaldı.\n\nYapay zeka sigorta limitlerinin 25 milyon dolara ulaştığını ve davaların yıllık %137 arttığını biliyor muydunuz? Sigorta pazarının bu riskleri yazabilmesi için güvenilir olay verisine ihtiyacı var.\n\nZorunlu raporlama Aralık 2027\'ye ertelenmişken, ALPAR AI pazarın gönüllü şeffaflık sicili görevini üstleniyor.\n\n3 gün sonra yayındayız: 👉 alparai.com\n\n#RiskYönetimi #InsurTech #YapayZekaSigortası #Girişimcilik',
    image_prompt: 'Yapay zeka sigortası büyüme istatistiklerini ve limitlerini gösteren infografik. Koyu mavi arka plan, parlayan detaylar, 1200x628px',
    scheduled_at: '2026-07-30T09:00:00Z',
  },

  // T-1 (August 1, 2026)
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[EN] T-1: Accountability Gap Starts Tomorrow',
    body_text: 'Tomorrow, the Accountability Gap officially starts. Regulators stepped back, but ALPAR AI steps in. Join us tomorrow for the launch of the first independent, Article 73-aligned public AI incident registry. 👉 alparai.com #AIAccountability #AIAct',
    image_prompt: 'A bold typography layout saying "THE ACCOUNTABILITY GAP STARTS TOMORROW". Dark technology theme, 1200x628px',
    scheduled_at: '2026-08-01T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[EN] T-1: Tomorrow: The Accountability Gap officially begins.',
    body_text: 'Tomorrow is August 2, 2026.\n\nThis was the date the EU AI Act serious incident reporting was meant to become law. The delay by the Digital Omnibus means the official registry is on hold until late 2027.\n\nTomorrow, ALPAR AI goes live to bridge this gap. We provide a community-driven, Article 73-aligned tracking mechanism. No self-grading, no corporate censorship. Just verified data.\n\nJoin us tomorrow for launch: 👉 alparai.com\n\n#AIAccountability #AIAct #TechGovernance #LaunchTomorrow',
    image_prompt: 'Premium visual indicating "1 DAY TO GO" with ALPAR AI branding. Dark theme, zümrüt green glow, 1200x628px',
    scheduled_at: '2026-08-01T09:00:00Z',
  },
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[TR] T-1: Boşluk Yarın Başlıyor',
    body_text: 'Yarın Hesap Verebilirlik Boşluğu resmi olarak başlıyor. Regülatörler erteledi, ALPAR AI devreye giriyor. Madde 73 uyumlu ilk bağımsız olay sicilinin açılışı için yarın takipte kalın. 👉 alparai.com #AIAccountability #YapayZeka',
    image_prompt: 'Üzerinde "HESAP VEREBİLİRLİK BOŞLUĞU YARIN BAŞLIYOR" yazan kalın tipografik tasarım. Koyu teknolojik tema, 1200x628px',
    scheduled_at: '2026-08-01T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[TR] T-1: Yarın: Hesap Verebilirlik Boşluğu Resmi Olarak Başlıyor.',
    body_text: 'Yarın 2 Ağustos 2026.\n\nBu tarih, AB Yapay Zeka Yasası ciddi olay raporlamasının yasalaşacağı tarihti. Ertelenen resmi takvim nedeniyle ALPAR AI yarın sabah bu boşluğu doldurmak için açılıyor.\n\nMadde 73 uyumlu takip mekanizmamız ile şirketlerin kendi kendini değerlendirme devrini kapatıyor, bağımsız veriyi başlatıyoruz.\n\nYarın açılış için takipte kalın: 👉 alparai.com\n\n#HesapVerebilirlik #YapayZeka #TeknolojiHukuku #YarınAçılıyoruz',
    image_prompt: 'ALPAR AI markalı "SON 1 GÜN" duyuru görseli. Koyu tema, zümrüt yeşili ışıklar, 1200x628px',
    scheduled_at: '2026-08-01T09:00:00Z',
  },

  // Launch Day (August 2, 2026)
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[EN] Launch Day: ALPAR AI is Live',
    body_text: 'ALPAR AI is officially live. The EU AI Act mandatory reporting was set for today, but deferred. The Accountability Gap starts now. We track AI failures transparently. Report an incident now. 👉 alparai.com #AIAccountability #LaunchDay',
    image_prompt: 'A bold, premium splash art celebrating the official launch of ALPAR AI. Neon green and deep slate glow, 1200x628px',
    scheduled_at: '2026-08-02T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[EN] Launch Day: ALPAR AI is officially live.',
    body_text: 'Today, August 2, 2026, marks the launch of ALPAR AI.\n\nThis was the day AI serious incident reporting was supposed to become mandatory in the EU. With the rules postponed to December 2, 2027, the Accountability Gap has officially opened.\n\nALPAR AI is live today as the voluntary public registry to fill this gap.\n\n- 400+ verified incidents already in database\n- Independent TruthScore rating system\n- Secure, GDPR-aligned anonymous reporting\n- Official right-of-reply for AI providers\n\nHelp us build the trust layer. Report an incident today: 👉 alparai.com/submit\n\n#AIAccountability #AIAct #AISafety #TechLaunch #StartupLaunch',
    image_prompt: 'Official launch banner for ALPAR AI, professional tech aesthetic, glassmorphism layout, 1200x628px',
    scheduled_at: '2026-08-02T09:00:00Z',
  },
  {
    platform: 'x',
    content_type: 'manifesto',
    title: '[TR] Açılış Günü: ALPAR AI Yayında',
    body_text: 'ALPAR AI resmi olarak yayında. Zorunlu raporlama bugün başlayacaktı ancak ertelendi. Hesap Verebilirlik Boşluğu başladı. Yapay zeka hatalarını şeffafça izlemek için olay bildirin. 👉 alparai.com #AIAccountability #AçılışGünü',
    image_prompt: 'ALPAR AI\'ın resmi açılışını kutlayan çarpıcı ve premium görsel tasarım. Neon yeşil ve koyu mavi tonlar, 1200x628px',
    scheduled_at: '2026-08-02T09:00:00Z',
  },
  {
    platform: 'linkedin',
    content_type: 'manifesto',
    title: '[TR] Açılış Günü: ALPAR AI Resmi Olarak Yayında.',
    body_text: 'Bugün, 2 Ağustos 2026, ALPAR AI resmi olarak açıldı.\n\nBu tarih, AB Yapay Zeka Yasası ciddi olay raporlamasının başlayacağı gündü. Ertelenen resmi takvimle birlikte Hesap Verebilirlik Boşluğu resmi olarak başladı.\n\nALPAR AI, bu boşluğu doldurmak için gönüllü kamu sicili olarak bugün yayına girdi:\n\n- 400\'den fazla doğrulanmış geçmiş olay hazır\n- Bağımsız TruthScore değerlendirme motoru\n- Güvenli, KVK uyumlu anonim olay bildirimi\n- Yapay zeka sağlayıcıları için resmi yanıt hakkı\n\nYapılandırılmış yapay zeka güvenini birlikte inşa edelim. İlk olayınızı bildirin: 👉 alparai.com/submit\n\n#HesapVerebilirlik #YapayZeka #Girişimcilik #AçılışGünü #TeknolojiYönetimi',
    image_prompt: 'ALPAR AI resmi açılış afişi, profesyonel teknoloji estetiği, cam efekti yerleşimi, 1200x628px',
    scheduled_at: '2026-08-02T09:00:00Z',
  }
];

async function run() {
  console.log("🚀 Seeding countdown posts...");
  let count = 0;
  for (const post of posts) {
    const { error } = await supabase
      .from('social_posts')
      .insert({
        platform: post.platform,
        status: 'draft',
        content_type: post.content_type,
        title: post.title,
        body_text: post.body_text,
        image_prompt: post.image_prompt,
        scheduled_at: post.scheduled_at,
        hashtags: post.platform === 'x' ? ['AIAccountability'] : [],
      });
    if (error) {
      console.error(`❌ Error inserting ${post.title}:`, error.message);
    } else {
      console.log(`✅ Seeded: ${post.title}`);
      count++;
    }
  }
  console.log(`\n🎉 Seeded ${count}/${posts.length} countdown posts successfully.`);
}

run();
