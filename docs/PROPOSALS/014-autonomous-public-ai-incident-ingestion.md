# PROPOSAL 014: Autonomous Public AI Incident Ingestion & Zero-Intervention Auto-Publish Pipeline

- **status:** approved_and_implemented
- **author:** `[Antigravity]`
- **related-item:** `Item 162` / `Proposal 014` / `Autopilot Engine`
- **created:** `2026-07-22`
- **approved:** `2026-07-23` (Founder Directive)

---

## 1. Gözlem / Problem

Mevcut yapıda kamuya açık yapay zeka ihlalleri, model zafiyetleri, güvenlik açıkları ve yapay zeka olayları (AI Incidents) manuel olarak bildirilmekte veya otonom taranan içerikler Founder/Moderator manuel onayına tabi tutulmaktadır.

Bu durum:

1. Kamuya açık platformlarda (Reddit, GitHub, HackerOne, Google News, arXiv, CVE veritabanları vb.) anlık olarak yayımlanan kritik AI vakalarının sisteme girme süresini geciktirmektedir.
2. Founder üzerinde gereksiz bir operasyonel onay yükü oluşturmaktadır.
3. ALPAR AI'ın "canlı yapay zeka şeffaflık ve hesap verebilirlik altyapısı" olma misyonunun anlık/otomatik veri akışını kısıtlamaktadır.

## 2. Öneri: Tam Otonom Kamu AI Olayları Tarama ve Otomatik Yayınlama Altyapısı

Founder emri doğrultusunda, kamuya açık mecralardaki AI olaylarının **hiçbir insan/founder onayına gerek kalmaksızın** profesyonel standartlarda otonom olarak sisteme eklenmesi için aşağıdaki arka plan mimarisi önerilmektedir:

### 2.1 Multi-Source Public Web Crawlers & Collectors

Aşağıdaki kaynakları 7/24 düzenli periyotlarla (Cron / Worker Task) otonom tarayan toplayıcı modüller:

- **Reddit Ingestion**: `r/MachineLearning`, `r/ChatGPT`, `r/netsec`, `r/CyberSecurity`, `r/ArtificialIntelligence` vb. topluluklardaki doğruluk oranı yüksek ihlal/zafiyet haberleri.
- **GitHub Ingestion**: Kamu AI repolarındaki kritik güvenlik ihlalleri, Issue ve Discussion başlıkları (GitHub GraphQL/REST API).
- **HackerOne & Bug Bounty Disclosures**: Kamuya açıklanmış AI/LLM model zafiyet raporları ve exploit bildirimleri.
- **CVE / NVD Data Feeds**: NIST CVE veritabanındaki AI/ML kategorisine giren yeni güvenlik açıkları.
- **Global AI News & Tech Feeds**: Google News RSS ve teknoloji medyasından filtrelenmiş yapay zeka skandal/olay içerikleri.

### 2.2 AI Pre-Triage, PII Masking & Classification Engine

Çekilen verilerin ham halde yayınlanmaması ve profesyonel standartlarda işlenmesi için:

1. **PII Sanitization**: `src/lib/pii/guardian.ts` modülü üzerinden tüm isim, e-posta, IP ve hassas kişisel verilerin otomatik maskelenmesi (Kişisel verilerin korunması garantisi).
2. **Duplication Guard**: Çekilen olay başlığı ve içeriğinin vektörel/hash karşılaştırması yapılarak veritabanında mükerrer kayıt oluşturulmasının engellenmesi.
3. **Confidence & Severity Scoring**: LLM Pre-triage servisi ile olayın gerçek bir AI olayı olup olmadığı skorlanır (0-100).

### 2.3 Sıfır Müdahale Otomatik Yayınlama (Zero-Intervention Auto-Publish)

- Güven skoru **%85 ve üzeri** olan ve PII temizliğinden geçen kamuya açık AI olayları, **Founder onayına sunulmadan** doğrudan `incidents` veritabanına `verified` / `auto_ingested` statüsüyle kaydedilir ve canlı haritada/akışta yayınlanır.
- Güven skoru %85 altında kalan olaylar pasif inceleme kuyruğuna alınır.

## 3. Acceptance Criteria (Kabul Kriterleri)

1. **Sıfır Manuel Müdahale**: Reddit, GitHub, HackerOne ve Medya kaynaklarından çekilen geçerli AI olaylarının Founder onayı olmadan sisteme `auto_ingested` olarak yazılması.
2. **PII Güvencesi**: Otomatik eklenen tüm kayıtların `guardian.ts` denetiminden geçerek sıfır PII sızıntısı ile yayınlanması.
3. **Mükerrer Kayıt Önleme**: Aynı olayın farklı mecralardan mükerrer olarak sisteme kaydolmasını engelleyen `title_hash` ve semantik deduplikasyon kontrolünün yeşil yanması.
4. **Şeffaf İzlenebilirlik**: Otomatik yayınlanan tüm olayların `audit_logs` tablosunda `system_autopilot_ingestion` aktörüyle izlenebilir olması.

## 4. Risk / Maliyet

- **Risk**: Kamuya açık haber/gönderilerdeki asılsız iddiaların sisteme otomatik girmesi riski.
  - _Mitigasyon_: Yüksek güven eşiği (%85+ Confidence Threshold) ve kaynak doğrulama skoru kullanılacaktır.
- **Maliyet**: LLM Pre-Triage analizi için API çağrı maliyeti.
  - _Mitigasyon_: Rule #32 uyarınca ilk aşamada ücretsiz/en ucuz sağlayıcılar (Gemini Free Tier / OpenRouter Free Modelleri) tercih edilecektir.
