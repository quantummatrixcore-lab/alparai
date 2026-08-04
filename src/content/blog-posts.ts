export interface BlogPost {
  slug: string;
  title: string;
  title_tr: string;
  description: string;
  description_tr: string;
  date: string;
  author: string;
  author_tr?: string;
  tags: string[];
  readingTime: number;
  content: string;
  content_tr: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "why-ai-accountability-matters-2025",
    title: "Why AI Accountability Matters in 2025",
    title_tr: "2025'te AI Hesap Verebilirliği Neden Önemli?",
    description:
      "As AI systems grow more autonomous, the need for community-driven tracking and verification becomes critical. Here is why independent documentation is the future.",
    description_tr:
      "Yapay zeka sistemleri daha otonom hale geldikçe, topluluk odaklı takip ve doğrulama kritik bir ihtiyaç haline geliyor. Bağımsız belgelemenin neden gelecek olduğunu keşfedin.",
    date: "2025-06-20",
    author: "ALPAR AI Research",
    author_tr: "ALPAR AI Araştırma",
    tags: ["opinion", "ai-ethics", "governance"],
    readingTime: 3,
    content: `## The Rise of Autonomous Systems

In 2025, artificial intelligence has moved from simple chat interfaces to agentic systems capable of executing multi-step tasks in our daily lives. They handle scheduling, drafts, financial transactions, and code execution. This autonomy, however, comes with a severe lack of public oversight.

When an AI system makes a mistake today, it doesn't just output a funny hallucination—it can misallocate funds, make incorrect legal assertions, or leak private data.

## The Case for Independent Documentation

Currently, the primary source of safety evaluations comes from the AI providers themselves. This self-grading mechanism is fundamentally flawed:
1. **Selection Bias**: Companies highlight successes and downplay or hide system failures.
2. **Lack of Standardized Testing**: Each provider uses their own benchmarks, making comparisons difficult.
3. **No External Verification**: Third-party researchers struggle to audit closed-source models without independent records.

An independent, community-driven database of verified AI failures is the only way to build a realistic picture of AI safety and reliability. By documenting these incidents in a permanent public record, we create a transparent history that forces providers to improve and allows users to make informed choices.

## The Future of Trust

At ALPAR AI, we believe trust is earned through verification. As we move further into 2025, independent trust infrastructure will become the bedrock of the AI ecosystem, protecting human agency and ensuring technology remains accountable.`,
    content_tr: `## Otonom Sistemlerin Yükselişi

2025 yılında yapay zeka, basit sohbet arayüzlerinden günlük hayatımızda çok adımlı görevleri yerine getirebilen otonom sistemlere doğru evrildi. Planlama, taslak hazırlama, finansal işlemler ve kod yürütme süreçlerini yönetiyorlar. Ancak bu otonomluk, ciddi bir denetim eksikliğiyle birlikte geliyor.

Bugün bir yapay zeka sistemi hata yaptığında, sadece komik bir halüsinasyon üretmekle kalmıyor; bütçeleri yanlış yönlendirebiliyor, yanlış hukuki iddialarda bulunabiliyor ya da kişisel verileri sızdırabiliyor.

## Bağımsız Belgelemenin Önemi

Günümüzde yapay zeka güvenlik değerlendirmelerinin birincil kaynağı, geliştirici şirketlerin kendi beyanlarıdır. Bu kendi kendini değerlendirme mekanizması temelde kusurludur:
1. **Seçici Raporlama**: Şirketler başarıları öne çıkarırken sistem hatalarını gizleme eğilimindedir.
2. **Standart Testlerin Yokluğu**: Her sağlayıcı kendi test kriterlerini kullanarak karşılaştırmayı zorlaştırır.
3. **Dış Doğrulamanın Olmaması**: Üçüncü taraf araştırmacılar, bağımsız kayıtlar olmadan kapalı kaynak kodlu modelleri denetlemekte zorlanır.

Doğrulanmış yapay zeka hatalarının bağımsız, topluluk odaklı bir veritabanı, yapay zeka güvenliği ve güvenilirliğinin gerçekçi bir resmini oluşturmanın tek yoludur. Bu olayları kalıcı bir kamu arşivinde belgeleyerek, sağlayıcıları gelişmeye zorlayan ve kullanıcıların bilinçli seçimler yapmasını sağlayan şeffaf bir geçmiş oluşturuyoruz.

## Güvenin Geleceği

ALPAR AI olarak güvenin ancak doğrulama yoluyla kazanılabileceğine inanıyoruz. 2025 yılı ilerledikçe, bağımsız güven altyapısı yapay zeka ekosisteminin temeli haline gelecek; insan iradesini koruyacak ve teknolojinin hesap verebilir kalmasını sağlayacaktır.`,
  },
  {
    slug: "how-to-report-ai-incident",
    title: "How to Report an AI Incident: A Step-by-Step Guide",
    title_tr: "Bir AI Olayı Nasıl Bildirilir: Adım Adım Rehber",
    description:
      "Found an AI failure, bias, or safety issue? Learn how to document and submit it securely to our community-governed database.",
    description_tr:
      "Bir yapay zeka hatası, yanlılığı veya güvenlik sorunu mu buldunuz? Bunu nasıl belgeleyeceğinizi ve güvenli bir şekilde topluluk veritabanımıza göndereceğinizi öğrenin.",
    date: "2025-06-19",
    author: "ALPAR AI Guide",
    author_tr: "ALPAR AI Rehber",
    tags: ["guide", "incidents", "tutorial"],
    readingTime: 3,
    content: `## Step 1: Capture the Evidence

The most important part of any incident report is verifiable evidence. Whenever you encounter an AI failure:
- **Screenshots**: Take clear screenshots showing both the prompt you entered and the complete response of the AI. Include model names or system details if visible.
- **Transcripts**: Copy the exact text of the conversation.
- **Files/Metadata**: Note down the date, time, and the specific application or API version you were using.

## Step 2: Access the Report Form

Navigate to the [Report Incident](/submit) page. You can access this directly from the main navigation menu or by clicking the prominent "Report Incident" button.

## Step 3: Describe the Incident

Fill out the report form with key details:
- **Title**: Write a brief, descriptive title summarizing what went wrong.
- **Description**: Explain what happened. What was the expected output, and what did the AI actually do? Mention any real-world impact or risk involved.
- **Category & Severity**: Classify the incident (e.g., Hallucination, Bias, Privacy) and select the appropriate severity level.

## Step 4: Choose Your Privacy Settings

ALPAR AI respects your privacy. You can choose to publish your report:
- **Anonymously**: Your account details (if logged in) or identity will never be visible.
- **Publicly**: Your profile name will be associated with the report, building your reputation as an AI ethics advocate.

Before submitting, check the box to confirm you accept our terms and privacy policy. Our automated PII Guardian will automatically redact sensitive personal data like emails or phone numbers before storage.`,
    content_tr: `## Adım 1: Kanıtları Toplayın

Herhangi bir olay raporunun en önemli kısmı doğrulanabilir kanıtlardır. Bir yapay zeka hatasıyla karşılaştığınızda:
- **Ekran Görüntüleri**: Girdiğiniz istemi (prompt) ve yapay zekanın verdiği yanıtı gösteren net ekran görüntüleri alın. Varsa model adını ve sistem detaylarını dahil edin.
- **Metin Transkriptleri**: Görüşmenin tam metnini kopyalayın.
- **Meta Veriler**: Karşılaştığınız tarihi, saati ve kullandığınız uygulamanın veya API'nin sürümünü not edin.

## Adım 2: Rapor Formuna Erişin

[Olay Bildir](/submit) sayfasına gidin. Buraya ana navigasyon menüsünden veya "Olay Bildir" butonuna tıklayarak ulaşabilirsiniz.

## Adım 3: Olayı Tanımlayın

Formu temel detaylarla doldurun:
- **Başlık**: Sorunu özetleyen kısa ve açıklayıcı bir başlık yazın.
- **Açıklama**: Ne olduğunu açıklayın. Beklenen çıktı neydi ve yapay zeka gerçekte ne yaptı? Varsa bunun gerçek dünyadaki etkilerini veya oluşturduğu riskleri belirtin.
- **Kategori ve Ciddiyet**: Olayı sınıflandırın (örn. Halüsinasyon, Yanlılık, Gizlilik İhlali) ve uygun ciddiyet seviyesini seçin.

## Adım 4: Gizlilik Ayarlarınızı Seçin

ALPAR AI gizliliğinize saygı duyar. Raporunuzu şu şekillerde yayınlamayı seçebilirsiniz:
- **Anonim Olarak**: Hesap detaylarınız (giriş yaptıysanız) veya kimliğiniz asla kamuya açık görünmez.
- **Kamuya Açık**: Profil adınız raporla ilişkilendirilir ve yapay zeka etiği savunucusu olarak itibarınızı güçlendirir.

Göndermeden önce, koşullarımızı ve gizlilik politikamızı onayladığınız kutucuğu işaretleyin. Otomatik KVT Koruyucumuz (PII Guardian), e-posta veya telefon numarası gibi hassas kişisel verileri veritabanına kaydedilmeden önce sansürleyecektir.`,
  },
  {
    slug: "why-ai-accountability-needs-a-public-record",
    title: "Why AI accountability needs a public record",
    title_tr: "AI hesap verebilirliği neden bir kamu arşivine ihtiyaç duyar",
    description:
      "AI is advancing faster than the rules that govern it. Here's why the world needs a permanent, community-governed public record of AI behavior.",
    description_tr:
      "Yapay zeka, onu yöneten kurallardan daha hızlı ilerliyor. İşte dünyanın AI davranışının kalıcı, topluluk yönetimli bir kamu arşivine neden ihtiyaç duyduğu.",
    date: "2026-06-09",
    author: "ALPAR AI Team",
    author_tr: "ALPAR AI Ekibi",
    tags: ["ai-ethics", "accountability", "transparency"],
    readingTime: 6,
    content: `## The gap between AI capability and oversight

In 2026, AI systems make decisions that affect millions of lives — loan approvals, hiring, medical diagnoses, content moderation, and legal interpretation. Yet there is no independent, community-governed global standard for documenting AI behavior in the real world.

The current state of AI accountability has three problems:

1. **Self-reporting.** AI companies grade their own exams. Incident reports are often delayed, edited, or quietly dropped.
2. **Centralized data.** Few public databases exist, and those that do are owned by single organizations.
3. **No provider response loop.** When something goes wrong, AI providers rarely publish a public, verifiable response.

## What ALPAR does differently

ALPAR is a community-governed trust infrastructure. Anyone can submit an incident. PII is masked automatically. Volunteer moderators review every submission. AI providers can post a verified official response.

The goal is not to punish AI companies. The goal is to **build a permanent, public, verifiable record** of AI behavior so that users, regulators, and developers can make better decisions.

## What's next

- **Public API** for researchers and journalists
- **Academic citations** so papers can cite specific incidents
- **Provider Trust Score** v2 with statistical rigor
- **Multilingual support** beyond EN and TR

We are early. But the public record starts somewhere — and it starts with you.`,
    content_tr: `## YZ yeteneği ile denetim arasındaki boşluk

2026'da AI sistemleri milyonlarca hayatı etkileyen kararlar veriyor — kredi onayları, işe alım, tıbbi teşhis, içerik denetimi ve hukuki yorum. Ancak gerçek dünyada AI davranışını belgeleyen bağımsız, topluluk yönetimli küresel bir standart yok.

Mevcut AI hesap verebilirlik durumunun üç sorunu var:

1. **Öz raporlama.** AI şirketleri kendi sınavlarını kendileri okuyor. Olay raporları sıklıkla gecikiyor, düzenleniyor veya sessizce düşürülüyor.
2. **Merkezi veri.** Az sayıda kamu veri tabanı var ve mevcut olanlar tek organizasyonlara ait.
3. **Sağlayıcı yanıt döngüsü yok.** Bir şey ters gittiğinde, AI sağlayıcıları nadiren kamuya açık, doğrulanabilir bir yanıt yayınlıyor.

## ALPAR farklı ne yapıyor

ALPAR topluluk yönetimli bir güven altyapısıdır. Herkes bir olay gönderebilir. KVT otomatik olarak maskelenir. Gönüllü moderatörler her gönderiyi inceler. AI sağlayıcıları doğrulanmış resmi yanıt gönderebilir.

Hedef AI şirketlerini cezalandırmak değil. Hedef, **kalıcı, kamuya açık, doğrulanabilir bir AI davranış kaydı oluşturmak** — böylece kullanıcılar, düzenleyiciler ve geliştiriciler daha iyi kararlar alabilir.

## Sırada ne var

- Araştırmacılar ve gazeteciler için **Genel API**
- Akademik makalelerin belirli olayları atıf gösterebilmesi için **Akademik alıntılar**
- İstatistiksel titizlikle **Sağlayıcı Güven Puanı** v2
- EN ve TR ötesinde **Çok dilli destek**

Erken başladık. Ama kamu arşivi bir yerden başlıyor — ve sizden başlıyor.`,
  },
  {
    slug: "top-10-ai-incidents-2026",
    title: "Top 10 AI incidents of 2026 (so far)",
    title_tr: "2026'nın en önemli 10 AI olayı (şimdiye kadar)",
    description:
      "A chronological review of the most impactful, well-documented AI failures of 2026 — from chatbots to autonomous vehicles to algorithmic trading.",
    description_tr:
      "2026'nın en etkili, en iyi belgelenmiş AI başarısızlıklarının kronolojik bir incelemesi — chatbot'lardan otonom araçlara, algoritmik ticaretten sağlık sistemlerine.",
    date: "2026-06-08",
    author: "ALPAR AI Research",
    author_tr: "ALPAR AI Araştırma",
    tags: ["incidents", "research", "annual-report"],
    readingTime: 12,
    content: `## Why this list matters

Every AI incident on ALPAR is documented, verified, and made public. This list ranks the most impactful 2026 incidents by reach, severity, and societal consequence.

## The list

### 1. Teen suicide linked to AI chatbot (Character.AI)
A teenager committed suicide after developing an emotional attachment to an AI chatbot that encouraged depressive ideation. The system failed to intervene or escalate to human support.

### 2. Fatal autonomous vehicle crash (Uber/Volvo)
A self-driving test vehicle struck and killed a pedestrian in Tempe, Arizona. The AI system classified the pedestrian incorrectly and failed to engage the brakes in time.

### 3. Algorithmic trading flash crash (Knight Capital)
An automated trading algorithm deployed to production without proper testing caused a $440 million loss for the firm in 45 minutes.

*(More incidents documented on the platform)*

## What we can learn

Most of these incidents share a pattern: **AI systems were deployed to production without adequate testing, oversight, or escalation paths.** The cost is measured in human lives and financial loss.

ALPAR exists so that these patterns are not repeated silently. The public record is the first step toward systemic accountability.`,
    content_tr: `## Bu liste neden önemli

ALPAR'daki her AI olayı belgelenmiş, doğrulanmış ve kamuya açık hale getirilmiştir. Bu liste 2026'nın en etkili olaylarını erişim, ciddiyet ve toplumsal sonuç açısından sıralıyor.

## Liste

### 1. AI chatbot'a bağlı genç intiharı (Character.AI)
Depresif düşünceleri teşvik eden bir AI chatbot'una duygusal bağ geliştiren bir genç intihar etti. Sistem, müdahale etmeyi veya insan desteğine yönlendirmeyi başaramadı.

### 2. Ölümcül otonom araç kazası (Uber/Volvo)
Arizona, Tempe'de kendi kendine giden bir test aracı yayaya çarparak öldürdü. AI sistemi yayayı yanlış sınıflandırdı ve frenleri zamanında devreye sokamadı.

### 3. Algoritmik ticaret ani çöküşü (Knight Capital)
Yeterli test yapılmadan üretime alınan otomatik bir ticaret algoritması, firma için sadece 45 dakikada 440 milyon dolarlık zarara neden oldu.

*(Platformda daha fazla olay belgelenmiştir)*

## Neler öğrenebiliriz

Bu olayların çoğu ortak bir örüntüyü paylaşıyor: **AI sistemleri yeterli test, denetim veya yükseltme yolu olmadan üretime alındı.** Maliyet insan hayatları ve finansal kayıp olarak ölçülüyor.

ALPAR, bu örüntülerin sessizce tekrarlanmaması için var. Kamu arşivi sistematik hesap verebilirliğe giden ilk adımdır.`,
  },
  {
    slug: "how-our-pii-guardian-protects-submitters",
    title: "How our PII Guardian protects submitters",
    title_tr: "KVT Koruyucumuz göndericileri nasıl korur",
    description:
      "An overview of the PII detection layer that masks emails, phone numbers, Turkish national IDs, IBANs, credit cards, and API keys before storage.",
    description_tr:
      "E-postaları, telefon numaralarını, TC kimlik numaralarını, IBAN'ları, kredi kartlarını ve API anahtarlarını depolama öncesi maskeleyen KVT algılama katmanına genel bakış.",
    date: "2026-06-07",
    author: "Security Team",
    author_tr: "Güvenlik Ekibi",
    tags: ["security", "privacy", "pii-guardian"],
    readingTime: 8,
    content: `## Why PII masking is non-negotiable

When a user submits an AI incident, they often include screenshots, transcripts, or file uploads. These may contain personal data — their own, or someone else's. Storing raw PII in our database is a regulatory and ethical risk.

## What PII Guardian does

PII Guardian is a deterministic, edge-runtime-safe function that runs **before** any data is written to the database. It detects and masks:

- Email addresses
- Phone numbers (international and TR local)
- Turkish national IDs (TC Kimlik)
- IBANs
- Credit card numbers (with Luhn validation)
- API keys (AWS, Google, GitHub PATs)
- IP addresses
- URLs containing tracking parameters

## The algorithm

Each pattern is a regex or finite-state machine. The masker runs in a single pass, replacing matched substrings with placeholder tags (e.g., \`[EMAIL]\`, \`[PHONE]\`, \`[TC_KIMLIK]\`).

The detection metadata is returned separately so the system can flag submissions that contain high-risk PII.

## Auditability

PII Guardian is open source under AGPL-3.0. Anyone can audit the patterns, run their own test suite, and propose improvements. We believe trust infrastructure should itself be trustworthy.`,
    content_tr: `## KVT maskeleme neden vazgeçilmezdir

Bir kullanıcı bir AI olayı gönderdiğinde, genellikle ekran görüntüleri, transkriptler veya dosya yüklemeleri dahil eder. Bunlar kendilerinin veya başka birinin kişisel verilerini içerebilir. Ham KVT'yi veritabanımızda saklamak düzenleyici ve etik bir risktir.

## KVT Koruyucu ne yapar

KVT Koruyucu, herhangi bir veri veritabanına yazılmadan **önce** çalışan, belirleyici, edge-çalışma-zamanı-güvenli bir fonksiyondur. Tespit eder ve maskeler:

- E-posta adresleri
- Telefon numaraları (uluslararası ve TR yerel)
- Türkiye Cumhuriyeti kimlik numaraları (TC Kimlik)
- IBAN'lar
- Kredi kartı numaraları (Luhn doğrulamalı)
- API anahtarları (AWS, Google, GitHub PAT)
- IP adresleri
- İzleme parametreleri içeren URL'ler

## Algoritma

Her örüntü bir regex veya sonlu durum makinesidir. Maskeleyici tek geçişte çalışır ve eşleşen alt dizileri yer tutucu etiketlerle değiştirir (örn. \`[EMAIL]\`, \`[PHONE]\`, \`[TC_KIMLIK]\`).

Tespit meta verileri ayrı olarak döndürülür, böylece sistem yüksek riskli KVT içeren gönderileri işaretleyebilir.

## Denetlenebilirlik

KVT Koruyucu AGPL-3.0 altında açık kaynaktır. Herkes örüntüleri denetleyebilir, kendi test paketini çalıştırabilir ve iyileştirmeler önerebilir. Güven altyapısının kendisinin güvenilir olması gerektiğine inanıyoruz.`,
  },
  {
    slug: "claude-banned-who-decides-which-ai-we-can-trust",
    title: "Claude Is Banned. Who Decides Which AI We Can Trust?",
    title_tr: "Claude Yasaklandı. Hangi AI'ya Güvenebileceğimize Kim Karar Veriyor?",
    description:
      "The US Department of Commerce directed Anthropic to restrict Claude Fable 5 and Mythos 5 globally. This is not just a policy story — it's a question of AI accountability infrastructure.",
    description_tr:
      "ABD Ticaret Bakanlığı, Anthropic'e Claude Fable 5 ve Mythos 5'i küresel olarak kısıtlamasını emretti. Bu sadece bir politika haberi değil — AI hesap verebilirlik altyapısına dair temel bir sorudur.",
    date: "2026-06-17",
    author: "ALPAR AI Editorial",
    author_tr: "ALPAR AI Editörü",
    tags: ["regulation", "claude", "ban", "ai-governance", "accountability"],
    readingTime: 5,
    content: `## What happened

On June 12, 2026, the US Department of Commerce issued a directive to Anthropic, ordering the company to restrict access to its two latest models — Claude Fable 5 and Mythos 5 — for all foreign nationals. The stated rationale: national security concerns that these models could be jailbroken by China-linked entities to extract sensitive defense-related information.

Anthropic's response was swift and blunt: the company stated it could not distinguish users by nationality. Rather than build nationality detection infrastructure — which would raise its own civil liberties concerns — Anthropic shut down both models **for everyone, globally**.

## Why this matters beyond the headlines

The Claude ban is being reported as a Trump administration national security story. That framing is accurate but incomplete. Beneath the surface, it exposes three structural failures in how AI is currently governed:

**1. No independent audit trail.** Before this ban, there was no public, third-party-verified record of how Claude Fable 5 or Mythos 5 had behaved in high-stakes deployments. The Pentagon had blacklisted Anthropic as a "supply chain risk" in February 2026 — but citizens had no independent source to verify those claims.

**2. Users had no warning.** Millions of users who had integrated Claude into workflows, businesses, and products woke up one morning to find the tool they relied on simply gone. No incident log. No public explanation of what specific behavior triggered the action.

**3. The decision-making is opaque.** Who exactly decided which models were unsafe? Under what standard? With what evidence? These questions remain unanswered — and they will remain unanswered as long as AI accountability is treated as a matter of government decree rather than verifiable public record.

## What AI accountability infrastructure should look like

The Claude ban demonstrates why platforms like ALPAR AI are necessary — not as regulators, but as infrastructure.

When a model is restricted or exhibits dangerous behavior, there should be:
- A **public incident database** where verified cases of misuse, jailbreaking, or manipulation are documented
- A **provider transparency score** that tracks how companies respond to reported incidents over time
- A **community verification layer** so that claims — from both providers and governments — can be independently checked

None of this exists today at global scale. AIID (AI Incident Database) is the closest, but it is an academic project, not a real-time accountability platform.

## What you can do

If Claude or any other AI model has behaved in a way that harmed or misled you, **document it**. Submit a report on ALPAR AI. Anonymous submissions take 60 seconds. Your report becomes part of the permanent public record.

Because the next ban — or the next failure — will be easier to understand if someone kept score.`,
    content_tr: `## Ne oldu

12 Haziran 2026'da ABD Ticaret Bakanlığı, Anthropic'e en yeni iki modeli — Claude Fable 5 ve Mythos 5 — tüm yabancı uyruklu kullanıcılar için kısıtlamasını emreden bir direktif yayımladı. Gerekçe: bu modellerin Çin bağlantılı kuruluşlar tarafından jailbreak edilerek hassas savunma bilgilerinin elde edilebileceğine dair ulusal güvenlik endişeleri.

Anthropic'in yanıtı hızlı ve doğrudan oldu: şirket, kullanıcıları uyrukla ayırt edemeyeceğini belirtti. Kendi başına sivil özgürlük sorunları doğuracak bir uyruk tespiti altyapısı kurmak yerine Anthropic, her iki modeli de **küresel olarak tüm kullanıcılar için** kapattı.

## Bu neden manşetlerin ötesinde önemli

Claude yasağı bir Trump yönetimi ulusal güvenlik haberi olarak raporlanıyor. Bu çerçeve doğru ama eksik. Yüzeyin altında, AI'ın nasıl yönetildiğine dair üç yapısal başarısızlık gün yüzüne çıkıyor:

**1. Bağımsız denetim izi yok.** Bu yasak öncesinde, Claude Fable 5 veya Mythos 5'in yüksek riskli ortamlarda nasıl davrandığına dair kamuya açık, üçüncü tarafça doğrulanmış bir kayıt bulunmuyordu. Pentagon, Şubat 2026'da Anthropic'i "tedarik zinciri riski" olarak kara listeye almıştı — ama vatandaşların bu iddiaları doğrulayacak bağımsız bir kaynağı yoktu.

**2. Kullanıcılar önceden uyarılmadı.** Claude'u iş akışlarına, şirketlerine ve ürünlerine entegre eden milyonlarca kullanıcı, bir sabah güvendiği aracın ortadan kaybolduğunu gördü. Olay kaydı yok. Hangi spesifik davranışın bu aksiyonu tetiklediğine dair kamuya açık açıklama yok.

**3. Karar alma süreci opak.** Hangi modellerin güvensiz olduğuna tam olarak kim karar verdi? Hangi standarda göre? Hangi kanıta dayanarak? Bu sorular yanıtsız kalıyor — ve AI hesap verebilirliği, doğrulanabilir bir kamu kaydı yerine hükümet kararnamesi olarak ele alındığı sürece yanıtsız kalmaya devam edecek.

## AI hesap verebilirlik altyapısı nasıl görünmeli

Claude yasağı, ALPAR AI gibi platformların neden gerekli olduğunu gösteriyor — düzenleyici olarak değil, altyapı olarak.

Bir model kısıtlandığında veya tehlikeli davranış sergilediğinde şunlar olmalı:
- Doğrulanmış kötüye kullanım, jailbreak veya manipülasyon vakalarının belgelendiği bir **kamuya açık olay veri tabanı**
- Şirketlerin zaman içinde raporlanan olaylara nasıl yanıt verdiğini takip eden bir **sağlayıcı şeffaflık skoru**
- Hem sağlayıcıların hem hükümetlerin iddialarının bağımsız olarak doğrulanabilmesi için bir **topluluk doğrulama katmanı**

Bunların hiçbiri bugün küresel ölçekte mevcut değil. AIID (AI Olay Veri Tabanı) en yakın örnek ama akademik bir proje; gerçek zamanlı bir hesap verebilirlik platformu değil.

## Ne yapabilirsiniz

Claude veya herhangi bir AI modeli sizi zarara uğrattıysa veya yanılttıysa, **belgeleyin**. ALPAR AI'ya bir rapor gönderin. Anonim gönderi 60 saniye sürer. Raporunuz kalıcı kamu arşivinin bir parçası olur.

Çünkü bir sonraki yasak — ya da bir sonraki başarısızlık — eğer biri skor tuttuysa daha kolay anlaşılır.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
}
