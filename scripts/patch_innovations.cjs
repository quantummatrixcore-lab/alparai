const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dehost', 'migrations', '0003_seeds.sql');
let s = fs.readFileSync(filePath, 'utf8');

const targetStart = "-- Table: public.strategy_innovations (19 statements, guarded)";
const targetEnd = "-- Table: public.strategy_state_support (1 statements, guarded)";

const startIdx = s.indexOf(targetStart);
const endIdx = s.indexOf(targetEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error("Indices not found!", startIdx, endIdx);
  process.exit(1);
}

const rawRows = [
  ["Otomatik Vaka Kuyruğu (Reddit & HN)", "Reddit (r/ChatGPT, r/MachineLearning) ve HackerNews üzerinden \"hallucination\", \"AI fail\", \"AI bias\" gibi terimlerle günlük otomatik ihlal verisi çekip moderasyon sırasına ekleyen entegrasyon.", "high", "planned"],
  ["AI Haberleri (AI News Feed)", "Yapay zeka güvenliği, etik ve regülasyonlar (EU AI Act, KVKK) ile ilgili dünya çapındaki haberleri platformda yayınlamak için NewsAPI veya RSS toplayıcı geliştirilmesi.", "medium", "idea"],
  ["Topluluk Doğrulaması (Community Notes)", "Kullanıcıların ihlal bildirimlerine \"Doğru\", \"Eksik Bilgi\", \"Giderildi\" şeklinde topluluk notları ekleyebileceği, Twitter benzeri bir doğrulama sistemi.", "medium", "idea"],
  ["Sağlayıcı Yanıt Süresi Canlı Sayacı", "Yapay zeka sağlayıcılarının (OpenAI, Anthropic) kendilerine iletilen şikayetlere verdikleri resmi yanıt sürelerini canlı olarak izleyen Leaderboard metriği.", "low", "idea"],
  ["AI Auditor Bounty & Rozet Sistemi", "Platformda en çok doğrulanmış kritik ihlal bildiren kullanıcılara \"AI Auditor\" rozeti verilmesi ve B2B sponsorlar aracılığıyla ödüllendirme mekanizması kurulması.", "low", "idea"],
  ["Admin Paneli Profesyonel Arayüz Güncellemesi", "Admin panelinin görsel ağırlıklı, mini grafikler (sparklines) ve senkronize animasyonlu sağ menü düzeniyle daha profesyonel bir görünüme kavuşturulması.", "high", "in_progress"],
  ["I1 — Incident Passport (Art. 73 resmi şablon çıktısı)", "ALPAR kayıtlarını Komisyon'un resmi Art. 73 bildiri şablonu alanlarına tek tıkla dönüştürür. Taslak şablon kamuya açık; format uyumlu ilk platform olmak varsayılan hazırlık aracı olma fırsatı. Her dışa aktarılan pasaport ALPAR kökenini taşır.", "high", "idea"],
  ["I2 — ALPAR MCP Server / LLM Aracı", "Olay API'sini yapay zeka ajanlarının sorgulayabileceği bir araç olarak sunar. Ajan ekosistemi büyüyor; ALPAR'ı kullanan ajanlar sıfır CAC dağıtım kanalı. Platform altyapıya dönüşür.", "high", "idea"],
  ["I3 — Sağlayıcı Yanıt SLA Rozeti", "Talep edilmiş profilli sağlayıcılar için gömülebilir ücretsiz \"X gün içinde yanıtlar\" rozeti. Sağlayıcılar ALPAR'ı kendileri reklam eder. İki taraflı kilit.", "medium", "idea"],
  ["I4 — Sigorta/Aktüeryal Veri Akışı", "AI sorumluluk sigortacıları için kategori bazlı anonim olay sıklık/ağırlık verileri. Pazar büyüyor, zarar geçmişi yok. Kategoride ilk zarar verisi.", "low", "idea"],
  ["I5 — Tarayıcı Eklentisi", "URL + ekran görüntüsü yakalayarak submit akışına tek tıkla raporlama. Raporlama yükünü sıfıra yakın düşürür. Hacim büyüme motoru.", "low", "idea"],
  ["I6 — Model Sürüklenme İzleme", "Sağlayıcı model kartı/sürüm değişikliklerini izler, olay artışlarıyla ilişkilendirir. Sessiz güncellemeler yaygın; kimse başarısızlıklarla ilişkilendirmiyor. Benzersiz uzunlamasına veri.", "low", "idea"],
  ["I7 — Araştırma Sanal Ortamı", "PII maskelenmiş veri seti üzerinde onaylı akademisyenler için barındırılan not defterleri (F2 genişletmesi). Akademik alıntılar güvenilirlik vlanı oluşturur.", "low", "idea"],
  ["Reddit Connector", "r/ChatGPT, r/artificial gibi popüler yapay zeka topluluklarından otomatik hata ve halüsinasyon vakaları toplar.", "critical", "done"],
  ["Hacker News Algolia Connector", "Hacker News üzerinde 30+ oy almış yapay zeka skandallarını, hatalarını ve makalelerini otomatik çekip kuyruğa ekler.", "critical", "done"],
  ["RSS Feed Aggregator", "MIT Technology Review, 404 Media, Wired ve Import AI gibi güvenilir teknoloji bültenlerinin RSS beslemelerini tarar.", "high", "done"],
  ["Auto-Blog Generator", "Kuyruktan kabul edilen yapay zeka vakalarını GPT-4o kullanarak teknik blog yazısı ve analize dönüştürür.", "high", "idea"],
  ["Social Media Auto-Post", "Yeni bir olay yayınlandığında otomatik olarak Twitter/X ve LinkedIn üzerinden formatlı gönderiler hazırlar ve yayınlar.", "high", "idea"],
  ["Newsletter Auto-Fill", "Haftalık veya aylık olarak toplanan onaylanmış olayları Substack bülten şablonuna otomatik yerleştirir.", "medium", "idea"],
  ["Embed Widget", "Üçüncü taraf haber siteleri veya bloglar için ALPAR AI doğrulanmış olay ve güven skoru rozetini yerleştirebilecekleri HTML widget.", "medium", "idea"],
  ["Provider Watch Alert System", "Belirli bir yapay zeka sağlayıcısını (örn. OpenAI) takip eden kullanıcılara, o sağlayıcı hakkında yeni bir olay girildiğinde e-posta gönderir.", "low", "idea"],
  ["AI Trust Score API", "Geliştiricilerin model ve sağlayıcıların güncel güven skorlarını, olay sayılarını ve yanıt oranlarını sorgulayabilecekleri açık API.", "low", "idea"],
  ["Webhook & Incident Submit API", "Dış geliştiricilerin kendi yapay zeka uygulamalarından yakaladıkları hataları API aracılığıyla ALPAR AI'ya bildirmelerini sağlar.", "medium", "idea"],
  ["I8 — KVKK Köprüsü", "Türk kamu kurumları için KVKK uyumlu yerelleştirilmiş olay bildirim biçimlendirmesi. ALPAR'ın TR kimliği hiçbir ABD rakibinin sahip olmadığı kama. Yerel pazar düzenleyici hendeği.", "medium", "idea"]
];

const valuesSql = rawRows.map(r => {
  const t = r[0].replace(/'/g, "''");
  const d = r[1].replace(/'/g, "''");
  const p = r[2].replace(/'/g, "''");
  const st = r[3].replace(/'/g, "''");
  return `        ('${t}', '${d}', '${p}', '${st}')`;
}).join(",\n");

const newBlock = `-- Table: public.strategy_innovations (24 statements, guarded)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategy_innovations') THEN
    IF NOT EXISTS (SELECT 1 FROM public.strategy_innovations LIMIT 1) THEN
      INSERT INTO public.strategy_innovations (title, description, priority, status) VALUES
${valuesSql}
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
`;

s = s.substring(0, startIdx) + newBlock + s.substring(endIdx);
fs.writeFileSync(filePath, s, 'utf8');
console.log("Successfully replaced strategy_innovations block!");
