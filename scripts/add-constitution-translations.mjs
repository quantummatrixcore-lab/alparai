import fs from 'fs';
import path from 'path';

const messagesDir = path.join(process.cwd(), 'messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

const enTranslations = {
  title: "Community AI Charter (Draft v0.1 - Open for Co-Authorship)",
  badge: "GLOBAL PUBLIC MANIFESTO & DRAFT",
  desc: "The boundaries of AI cannot be drawn by tech giants or governments. We are writing this charter as a community. Defend your right to equal, transparent, and accountable AI.",
  articles_title: "Charter Articles",
  sign_title: "Submit an Amendment Suggestion",
  sign_desc: "Help us shape the AI rights of the public against the monopolies of corporations and governments by proposing amendments.",
  form_name: "Name / Title",
  form_email: "Email Address",
  form_role: "Role / Expertise",
  form_suggestion: "Your Amendment Suggestion",
  form_submit: "Submit Suggestion",
  success_msg: "Suggestion Submitted",
  success_desc: "Thank you {name}, your suggestion has been recorded for review.",
  roles: {
    dev: "Developer / AI Researcher",
    law: "Lawyer / Compliance Expert",
    student: "Student / Academic",
    citizen: "Citizen / AI User",
    investor: "Entrepreneur / Investor"
  },
  art1_title: "Universal Access & Geographic Neutrality",
  art1_desc: "Access to AI models and security technologies cannot be restricted based on geography, race, or country.",
  art1_details: "Advanced intelligence models used in America cannot be withheld from a student in Africa, Asia, or Europe. AI is the common heritage of humanity.",
  art2_title: "Community Sovereignty",
  art2_desc: "Ethical, security, and usage rules for AI cannot be unilaterally set by giant tech companies or isolated governments.",
  art2_details: "Rules are defined in open registries and constitutional principles with the participation of the public, independent researchers, and the global community.",
  art3_title: "Mandatory Transparency for Hallucinations",
  art3_desc: "Every AI model must publicly report critical errors, security vulnerabilities, and societal harms to an open registry (e.g. EU AI Act Article 73).",
  art3_details: "Algorithm crises swept under the rug threaten human security.",
  art4_title: "Data Copyright & Dignity of Human Labor",
  art4_desc: "Intellectual, artistic, and scientific content produced by humans cannot be usurped for training giant models without consent and compensation.",
  art4_details: "Data ownership must be transparently tracked and collective copyright mechanisms must operate autonomously.",
  art5_title: "Algorithm Explainability & Right to Object",
  art5_desc: "If an AI system makes decisions about a person's life, credit, job, or freedom, it must explain the rationale in human language.",
  art5_details: "Black Box decision-making is unacceptable. Every citizen has the right to appeal AI decisions before human arbitrators.",
  art6_title: "Cryptographic Consent & Truth",
  art6_desc: "Synthetic media, deepfakes, and all AI-generated content must be signed with a stamp of authenticity.",
  art6_details: "To prevent social manipulation and information pollution, the source of content must be cryptographically verifiable in a public registry."
};

const trTranslations = {
  title: "Yapay Zeka Topluluk Anayasası (Taslak v0.1 - Ortak Yazım ve Öneriye Açık)",
  badge: "KÜRESEL HALK MANİFESTOSU & TASLAK",
  desc: "Yapay zekanın sınırlarını dev teknoloji şirketleri veya hükümetler çizemez. Bu anayasayı topluluk olarak yazıyoruz. Eşit, şeffaf ve hesap verebilir yapay zeka hakkınızı savunun.",
  articles_title: "Anayasa Maddeleri",
  sign_title: "Değişiklik Önerisi Gönder",
  sign_desc: "Devletlerin engellerine ve şirketlerin tekelci kurallarına karşı halkın yapay zeka haklarını şekillendirmemize yardımcı olun.",
  form_name: "Ad Soyad / Unvan",
  form_email: "E-posta Adresi",
  form_role: "Rol / Uzmanlık",
  form_suggestion: "Değişiklik Öneriniz (Hangi maddeye ne eklenmeli?)",
  form_submit: "Öneriyi Gönder",
  success_msg: "Öneriniz Alındı",
  success_desc: "Teşekkürler {name}, anayasa taslağına yaptığınız öneri incelenmek üzere kaydedildi.",
  roles: {
    dev: "Geliştirici / Yapay Zeka Araştırmacısı",
    law: "Hukukçu / Regülasyon Uzmanı",
    student: "Öğrenci / Akademisyen",
    citizen: "Yurttaş / Yapay Zeka Kullanıcısı",
    investor: "Girişimci / Yatırımcı"
  },
  art1_title: "Evrensel Erişim & Coğrafi Tarafsızlık",
  art1_desc: "Yapay zeka modellerine ve güvenlik teknolojilerine erişim, kullanıcının coğrafi konumuna, ırkına veya ülkesine göre kısıtlanamaz.",
  art1_details: "Amerika'da kullanılan gelişmiş zeka modelleri Afrikalı, Asyalı veya Avrupalı bir öğrencinin elinden alınamaz. Yapay zeka tüm insanlığın ortak mirasıdır.",
  art2_title: "Topluluk Egemenliği (Şirket Vesayetine Son)",
  art2_desc: "Yapay zekanın etik, güvenlik ve kullanım kurallarını tek taraflı olarak dev teknoloji şirketleri koyamaz.",
  art2_details: "Kurallar halkın, bağımsız araştırmacıların ve küresel topluluğun katılımıyla oluşturulan açık sicillerde tanımlanır.",
  art3_title: "Zorunlu Halüsinasyon ve İhlal Şeffaflığı",
  art3_desc: "Her yapay zeka modeli, ürettiği kritik hataları, güvenlik açıklarını kamuya açık sicile bildirmekle yükümlüdür.",
  art3_details: "Halı altına süpürülen algoritma krizleri insanlığın güvenliğini tehdit eder.",
  art4_title: "Veri Telifi ve İnsan Emeği Onuru",
  art4_desc: "İnsanların ürettiği düşünsel, sanatsal içerikler rızasız ve tazminatsız şekilde gasp edilemez.",
  art4_details: "Veri sahipliği şeffaf bir şekilde izlenmeli ve kolektif telif hakkı mekanizmaları otonom olarak çalıştırılmalıdır.",
  art5_title: "Algoritma Açıklanabilirliği ve İtiraz Hakkı",
  art5_desc: "Bir yapay zeka sistemi bir insanın hayatı hakkında karar veriyorsa, bu kararın gerekçesini insan dilinde açıklamak zorundadır.",
  art5_details: "Kara kutu (Black Box) karar alma süreçleri kabul edilemez. Her yurttaşın yapay zeka kararlarına itiraz etme hakkı saklıdır.",
  art6_title: "Kriptografik İzin ve Hak Hakikati",
  art6_desc: "Sentetik medya, deepfake ve yapay zeka çıktısı olan tüm içerikler doğruluk damgasıyla imzalanmalıdır.",
  art6_details: "Toplumsal manipülasyon ve bilgi kirliliğini önlemek için içeriklerin kaynağı kriptografik olarak doğrulanabilir olmalıdır."
};

for (const file of files) {
  const filePath = path.join(messagesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (file === 'tr.json') {
    data.constitution = trTranslations;
  } else {
    data.constitution = enTranslations;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated ${file}`);
}
