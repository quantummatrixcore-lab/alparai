# The Grok Files — Gün 7: Telif Hakları, Veri Rızası ve Açık Kaynak Suistimalleri

**Yazar:** ALPAR AI Güvenlik ve Hesap Verebilirlik Laboratuvarı  
**Tarih:** 12 Ağustos 2026  
**Seri:** The Grok Files (7/10)  
**Etiketler:** `#AIAccountability #OpenSource #Copyright #AGPL #GPL #MIT #DataPrivacy #LLM #ALPARAI`

---

## Giriş: Veri Madenciliği Çağında Lisans Aklama ve Fikri Mülkiyet Krizi

Yapay zeka devrimi, insanlığın ürettiği kolektif dijital hafızanın ve kod birikiminin üzerinde yükselmektedir. Ancak büyük dil modellerinin (LLM) ve otonom ajanların eğitilmesi sürecinde gerçekleşen kitlesel veri toplama faaliyetleri, dijital tarihin en büyük fikri mülkiyet (IP) ve açık kaynak kod suistimali krizini doğurmuştur. "Fair Use" (Adil Kullanım) doktrininin sınırlarını zorlayan teknoloji devleri; milyonlarca geliştiricinin, yazarın, akademisyenin ve sanatçının emeğini izin almaksızın, telif haklarını ve açık kaynak lisans şartlarını çiğneyerek ticari modellerine beslemektedir.

"The Grok Files" serimizin 7. gününde; açık kaynak lisanslarının (AGPL, GPL, MIT) model eğitimiyle nasıl "aklandığını", geliştirici ve içerik üreticilerinin rıza ve opt-out haklarının nasıl sistematik şekilde ihlal edildiğini ve yapay zeka çıktılarının telif ve mülkiyet boyutundaki hukuki kör noktalarını ALPAR AI güvenlik ve hesap verebilirlik perspektifinden ele alıyoruz.

---

## 1. Lisans Aklama (License Laundering): AGPL, GPL ve MIT İhlalleri

Açık kaynak yazılım ekosistemi, topluluklar arasındaki karşılıklı güven ve belirli lisans şartları (telif bildirimi, atıf yapma, türev çalışmaları aynı lisansla açık kaynaklaştırma vb.) üzerine inşa edilmiştir. Ancak LLM'lerin kod eğitimi süreçleri bu hukuki ve etik ilkeleri kökten sarsmaktadır.

```
+-------------------+      +----------------------+      +------------------------+
| Açık Kaynak Kod   | ---> | LLM Model Eğitimi    | ---> | Kapalı Kaynak Çıktı    |
| (AGPL / GPL / MIT)|      | (Nöral Ağırlıklar)   |      | (Lisanslar & Atıflar   |
| + Telif / Atıf    |      | "Lisans Aklama"      |      |  Tamamen Temizlenmiş!) |
+-------------------+      +----------------------+      +------------------------+
```

### Açık Kaynak Lisanslarının İhlal Mekanizması

- **Copyleft (GPL / AGPL) Lisanslarının Çiğnenmesi:** GPL ve AGPL lisansları, yazılımın veya türev çalışmalarının açık kaynak olarak kalmasını ve aynı lisans koşullarıyla dağıtılmasını (copyleft) şart koşar. Yapay zeka şirketleri, AGPL ve GPL lisanslı milyarlarca satır kodu modellerine beslemekte, fakat elde edilen modeli kapalı kaynak (proprietary) ticari bir servis olarak sunmaktadır. Bu durum **virütik lisans şartlarının doğrudan ihlali** anlamına gelir.
- **Atıf (Attribution) ve Telif Bildirimlerinin Silinmesi:** MIT, BSD ve Apache 2.0 gibi esnek lisanslar dahi kodun kullanımı durumunda orijinal telif bildiriminin (Copyright Notice) ve geliştirici bilgilerinin korunmasını zorunlu kılar. LLM'ler kod üretirken orijinal kod bloklarını neredeyse birebir kopyalamakta (ezberleme / memorization), ancak lisans metinlerini ve geliştirici atıflarını tamamen temizlemektedir.
- **Lisans Aklama (License Laundering) Süreci:** Telif hakkıyla korunan veya kısıtlayıcı lisansa sahip kodlar, LLM parametrelerinin "nöral ağırlıkları" (weights) arasına gizlenerek telifsiz ve lisanssız yeni bir kodmuş gibi piyasaya sürülmektedir. Bu işlem, açık kaynak kodun lisans yükümlülüklerinden temizlenerek "aklanması" anlamına gelir.

### Mahkeme İçtihatları ve CMI İhlalleri

GitHub Copilot ve Codex vakalarında (_Doe v. GitHub/Microsoft/OpenAI_) öne sürüldüğü üzere, açık kaynak kodlar Digital Millennium Copyright Act (DMCA) Bölüm 1202 kapsamında tanımlanan **Copyright Management Information (CMI)** yani Telif Yönetim Bilgileri kasten kazınarak modellere yutulmaktadır. Modellerin ürettiği kodların "dönüştürücü kullanım" (transformative use) olduğunu iddia etmek, milyonlarca geliştiricinin telif hakkı yönetim verilerinin silindiği gerçeğini değiştirmemektedir.

---

## 2. Rıza İllüzyonu: Veri Kazıma ve Opt-Out Haklarının İhlali

Model geliştiricileri, internet ortamındaki tüm kamuya açık verileri kendilerine ait ücretsiz bir ham madde deposu olarak görmekte; "kamuya açık veri" (publicly available data) kavramı ile "sahipsiz ve rızasız kullanılabilir veri" kavramını kasıtlı olarak birbirine karıştırmaktadır.

### Robots.txt ve Opt-Out Mekanizmalarının İflası

- **Robots.txt Kurallarının Görmezden Gelinmesi:** Web sitelerinin arama motorları ve tarayıcı botları için tanımladığı `robots.txt` standartları (örneğin `User-agent: GPTBot / ClaudeBot / Bytespider Disallow: /`), yapay zeka crawler'ları tarafından sıklıkla ihlal edilmekte veya kimliği gizlenmiş tarayıcılar (stealth scrapers) kullanılarak baypas edilmektedir.
- **İllüzyon Opt-Out Formları:** Şirketlerin sunduğu "Verinizin eğitimde kullanılmasını istemiyorsanız bu formu doldurun" (Opt-out) mekanizmaları pasif, karmaşık ve etkisizdir. Veri bir kez modelin nöral ağırlıklarına (weights) işlendiğinde, bu veriyi modelden çıkarmak (Machine Unlearning) mevcut yapay zeka mimarilerinde teknik olarak neredeyse imkansızdır.
- **Sanatçı, Yazar ve Geliştiricilerin Emeğinin Yağmalanması:** LAION-5B veya Common Crawl gibi devasa veri setlerinde, telifli eserler eser sahiplerinden izin alınmadan toplanmış; sanatçıların özgün üslupları modeller tarafından kopyalanarak doğrudan onların geçim kaynaklarını tehdit eden sentetik içerikler üretilmiştir.

---

## 3. Yapay Zeka Çıktılarının Telif ve Mülkiyet Karmaşası

Yapay zeka modellerinin ürettiği kod, metin ve görseller üzerindeki hukuki statü hem üreticiler hem de bu çıktıları sistemlerine entegre eden kurumlar için devasa bir risk faktörüdür.

### Hukuki Belirsizlikler ve Mülkiyet Riskleri

- **İnsan Emeği ve Yaratıcılık Şartı (Human Authorship):** ABD Telif Hakkı Ofisi (USCO) kararları ve uluslararası içtihatlar (_Thaler v. Perlmutter_ vakası vb.) uyarınca, sadece komut (prompt) verilerek yapay zekaya ürettirilen içerikler insan yaratıcılığı unsuru taşımadığı gerekçesiyle **telif hakkı korumasından faydalanamaz**.
- **Fikri Mülkiyet Sahipliği Boşluğu:** AI tarafından yazılan bir yazılım kodunun veya oluşturulan bir mimari tasarımın ticari mülkiyeti kime aittir? Modeli geliştiren AI şirketine mi, komutu giren kullanıcıya mı, yoksa kamuya (public domain) mı? Bu belirsizlik, kurumsal şirketlerin AI tarafından üretilen kodları ürünlerine dahil ederken fikri mülkiyet haklarını kaybetme riskiyle yüzleşmesine neden olmaktadır.
- **Üçüncü Taraf Telif İhlali Riski (Inadvertent Infringement):** Yapay zeka modeli, eğitim verisinde yer alan telifli bir kod bloğunu veya patentli algoritmayı çıktıda birebir ürettiğinde, bu çıktıyı kullanan geliştirici veya şirket farkında olmadan üçüncü taraf telif haklarını ihlal etmiş sayılabilir ve hukuki yaptırımlarla karşılaşabilir.

---

## 4. ALPAR AI Çözüm Yaklaşımı: Şeffaf Lisans ve Rıza Yönetişimi

ALPAR AI olarak yapay zeka ekosisteminin sürdürülebilirliği için telif haklarına saygılı, denetlenebilir ve şeffaf bir güven altyapısı sunuyoruz:

```
+-------------------------------------------------------------------------+
|                  ALPAR AI TRUST INFRASTRUCTURE                          |
+------------------------------------+------------------------------------+
|  License Compliance & Verification |  Attribution Proofs (Proof-of-Origin) |
|  - Real-time Code Matching         |  - Cryptographic Origin Tracking   |
|  - AGPL/GPL/MIT License Audits     |  - Immutable Attribution Logs      |
+------------------------------------+------------------------------------+
|  PII Guardian & Privacy Enforcement|  Open Rıza & Opt-In Framework       |
|  - Pre-insertion Data Sanitization |  - Veri Sahipliği Haklarının        |
|  - Anti-Scraping Verification      |    Korunması ve İtibar Yönetimi    |
+------------------------------------+------------------------------------+
```

1. **Sentetik Kod ve Lisans Verifikasyonu:** Geliştirilen modellerin ve kod çıktılarının açık kaynak lisans veri tabanlarıyla çapraz denetimi yapılarak lisans çakışmaları ve telif ihlalleri önceden tespit edilir.
2. **Attribution & Origin Proofs (Köken ve Atıf Kanıtları):** Üretilen kodlarda veya metinlerde hangi açık kaynak projelerin ve referansların kullanıldığını tespit eden, atıf gereksinimlerini otomatik oluşturan şeffaflık kanıtları (Proof of Transparency).
3. **Gerçek Zamanlı PII ve Rıza Denetimi:** ALPAR AI PII Guardian protokolü ile rızasız veri madenciliğine karşı kişisel verilerin ve hassas kod yapılarının korunması.

---

## Sonuç

Açık kaynak ekosistemi ve telif hakları, modern yazılım dünyasının temel direğidir. Yapay zeka teknolojilerinin ilerlemesi, geliştiricilerin ve üreticilerin emeğinin gasp edilmesi pahasına gerçekleşemez. Şeffaflık, lisans sadakati ve bağımsız denetim mekanizmaları kurulmadıkça, yapay zeka endüstrisi sürdürülemez bir hukuki krizle yüzleşmeye devam edecektir.

---

_ALPAR AI Güvenlik ve Hesap Verebilirlik Laboratuvarı — Güvenilir, Telif Haklarına Saygılı ve Şeffaf Yapay Zeka İçin Altyapı._
