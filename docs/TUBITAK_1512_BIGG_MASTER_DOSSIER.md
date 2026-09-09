# TÜBİTAK 1512 BİGG (BİREYSEL GENÇ GİRİŞİM)
## MASTER PROJE BAŞVURU DOSYASI
### Mükemmeliyet Mührü & Yatırım Tabanlı Tohum Sermaye Programı

---

| **PROJE KÜNYESİ** | **DETAY BİLGİLER** |
|:---|:---|
| **Proje Adı** | **ALPAR AI - Sıfır Bilgi İspatı (ZKP) Destekli Bağımsız Yapay Zeka Denetim, Güvenilirlik ve Hesap Verebilirlik Platformu** |
| **Proje Kodu / Akrostiş** | **ALPAR-AI-2026-TRUST** |
| **Öncelikli Alan** | **Yapay Zekâ, Makine Öğrenmesi, Siber Güvenlik ve Güvenilir Veri Alanları** |
| **Uygulayıcı Kuruluş** | **Teknopark İstanbul (Cube BİGG)** |
| **Talep Edilen Bütçe** | **900.000 TL (TÜBİTAK BİGG Fonu Yatırım Sermayesi)** |
| **Proje Süresi** | **12 Ay** |
| **Kurucu Girişimci** | **Ercüment ERDEN** |
| **Canlı MVP & Web** | **https://alparai.com** |

---

## 1. İŞ FİKRİNİN ÖZETİ VE YENİLİKÇİ YÖNÜ

### 1.1. Çözülen Problem ve Sektörel Acı Noktası (Pain Point)
Üretken yapay zeka (LLM), otonom ajanlar ve derin öğrenme modelleri kurumsal süreçlere (finans, bankacılık, sağlık, savunma sanayii, e-ticaret) hızla entegre olmaktadır. Ancak bu modeller doğaları gereği deterministik değildir; **halüsinasyon üretmekte, algoritmik ayrımcılık (bias) barındırmakta, prompt injection ve veri sızıntısı zafiyetlerine açık bulunmaktadır.**

Dünyada yürürlüğe giren **AB Yapay Zeka Yasası (EU AI Act)** ve Türkiye Cumhuriyeti Cumhurbaşkanlığı'nın **2021/18 sayılı Genelgesi ile yürürlüğe giren "Ulusal Yapay Zekâ Stratejisi (2021-2025)"**, kurumların kontrolsüz yapay zeka kullanmasını yasaklamakta; katı denetim izi (audit trail), açıklanabilirlik ve tarafsızlık testlerini zorunlu kılmaktadır. 

Mevcut piyasada şirketlerin karşılaştığı 3 devasa sorun şunlardır:
1. **Bağımsız Denetçi Eksikliği:** Mevcut yazılımlar (LangSmith, Arize vb.) sadece geliştirici iç gözlem (observability) araçlarıdır. Kamuya ve düzenleyicilere bağımsız üçüncü taraf tarafsızlık raporu veremezler.
2. **Veri Mahremiyeti ve Egemenlik İhlali:** Modelleri test ettirmek için şirket verilerinin ABD merkezli bulut sunucularına aktarılması KVKK ve gizlilik yasalarını ihlal etmektedir.
3. **Mevzuat Uyumunun Belgelenememesi:** Sigorta şirketleri ve regülatörler, algoritmik sistemler için "Mesleki Sorumluluk ve Güvenilirlik Sertifikası" talep etmeye başlamıştır ancak bu sertifikayı üretecek standart bir denetim motoru dünyada bulunmamaktadır.

### 1.2. Önerilen Çözüm: ALPAR AI
ALPAR AI; yapay zeka endüstrisinin **"Moody's'i ve Deloitte'u"** olarak konumlanan, dünyada ve Türkiye'de bir ilk niteliğindeki bağımsız yapay zeka denetim, doğrulama ve sertifikasyon platformudur.

Platform; modelleri test ederken **müşterinin hassas eğitim verisini veya model parametrelerini asla dışarı çıkarmayan Sıfır Bilgi İspatı (Zero-Knowledge Proofs - ZKP)** protokolü kullanır. Yapay zekayı kara-kutu (black-box) stres testlerine tabi tutarak halüsinasyon katsayısını, önyargı düzeyini ve güvenlik zafiyetlerini matematiksel olarak hesaplar ve tescilli **"AI Audit Score™"** karnesi üretir.

---

## 2. TEKNOLOJİK AR-GE BOYUTU VE MÜHENDİSLİK HENDEĞİ (MOAT)

### 2.1. Yenilikçi Ar-Ge Bileşenleri
1. **Sıfır Bilgi İspatı (ZKP) ile Veri Egemenliği Modülü:**
   * Müşterinin kurumsal verisi kendi sunucusunda kalırken, modelin etik ve regülasyon kurallarına uyup uymadığı kriptografik ispatlarla (zk-SNARKs / zk-STARKs) kanıtlanır.
   * Bu Ar-Ge yeniliği, Türk savunma sanayii ve bankacılık verilerinin yurt dışına çıkmasını yapısal olarak engeller.
2. **Deterministik Halüsinasyon Tespit Motoru:**
   * Çok katmanlı semantik sapma analizi (semantic drift analysis) ve çapraz referans grafikleri (Knowledge Graph verification) kullanılarak model çıktılarının doğruluk katsayısı gerçek zamanlı ölçülür.
3. **Prompt Injection & Algoritmik Bias Kalkanı:**
   * Kötü niyetli girdi saldırıları (jailbreak, adversarial prompt injections) 17 farklı vektörde simüle edilir; modelin direnç eşiği tespit edilir.
4. **Tescilli "AI Audit Score™" Metodolojisi:**
   * OECD, UNESCO ve EU AI Act risk sınıflandırmasına (Minimal, Limited, High, Unacceptable Risk) tam uyumlu, 0-100 arasında deterministik bir güvenlik ve etik metriği üretilir.

### 2.2. Mevcut Çözümlerle Karşılaştırma Matrisi

| Özellik | Geleneksel Gözlem Araçları (LangSmith / Arize) | Danışmanlık Firmaları (Big-4) | **ALPAR AI (TÜBİTAK BİGG Projesi)** |
|:---|:---:|:---:|:---:|
| **Bağımsız Tarafsızlık** | ❌ Yok (İç Gözlem Aracı) | 🟡 Kısmi (Manuel Süreç) | 🟢 **%100 Bağımsız & Otomatize** |
| **Veri Gizliliği (ZKP)** | ❌ Veriyi Kendi Bulutuna Çeker | ❌ İnsan Müfettiş Veriyi Görür | 🟢 **Sıfır Veri Transferi (Kriptografik İspat)** |
| **Denetim Süresi** | Sürekli loglama (Denetim yapmaz) | 3 - 6 Ay (Çok Yavaş) | 🟢 **Dakikalar İçinde Otomatik Rapor** |
| **Maliyet** | Yüksek API/Kullanıcı Maliyeti | 50.000$ - 200.000$ Rapor Başı | 🟢 **Ölçeklenebilir B2B SaaS** |
| **Milli & Egemen Altyapı** | ❌ ABD Merkezli | ❌ Yabancı Merkezli | 🟢 **%100 Yerli ve Milli Mülkiyet** |

---

## 3. PAZAR ANALİZİ, TİCARİLEŞME VE İŞ MODELİ

### 3.1. Pazar Büyüklüğü (TAM, SAM, SOM)
* **TAM (Total Addressable Market - Küresel):** Küresel Yapay Zeka Yönetişimi ve Güvenliği Pazarı (AI Governance & Compliance Market) 2030 yılına kadar **10.2 Milyar Dolar** büyüklüğe ulaşacaktır (CAGR %38.5).
* **SAM (Serviceable Addressable Market - AB & Bölgesel):** AB AI Act kapsamına giren ve AB'ye yazılım ihraç eden şirketlerin oluşturduğu Avrupa ve Avrasya pazarı: **1.8 Milyar Dolar.**
* **SOM (Serviceable Obtainable Market - Türkiye & MENA İlk 3 Yıl):** Türkiye'deki finans, telekomünikasyon, savunma ve bilişim şirketleri: **15 Milyon Dolar (500M+ TL).**

### 3.2. Gelir Akışları (Revenue Streams)
1. **Tiered SaaS Aboneliği (B2B):**
   * *Startup/KOBİ:* Aylık 500$ (Sınırlı model denetimi, temel AI Audit Score™ raporu).
   * *Enterprise:* Aylık 2.500$ - 10.000$ (Sınırsız ZKP denetimi, SIEM entegrasyonu, resmi regülasyon denetim sertifikası).
2. **Denetim Başına Raporlama (Pay-per-Audit):**
   * Tekil büyük dil modeli sürüm yükseltmelerinde tek seferlik kapsamlı akreditasyon raporu (Model başına 5.000$).
3. **Sigorta & Bankacılık Lisanslama (B2B / B2G):**
   * Sigorta şirketlerine poliçe öncesi zorunlu yapay zeka risk skorlama API'si satışı.

### 3.3. 3 Yıllık Finansal Hedefler
* **Yıl 1:** 10 Pilot Kurumsal Müşteri | 250.000 USD (8.5M TL) ARR | Teknopark İstanbul Kuluçka.
* **Yıl 2:** 35 Kurumsal Müşteri | 1.200.000 USD ARR | TÜBİTAK 1507 & AB EIC Plug-in.
* **Yıl 3:** 100+ Global Müşteri | 4.500.000 USD ARR | Avrupa ve MENA İhracatı, Series A Yatırım.

---

## 4. İŞ PAKETLERİ VE ÇALIŞMA PLANI (12 AY)

```
[İP 1: ZKP Kriptografik Protokolü] (Ay 1-4)
         │
         ▼
[İP 2: Halüsinasyon & Bias Test Motoru] (Ay 3-7)
         │
         ▼
[İP 3: AI Audit Score™ & Regülasyon Motoru] (Ay 6-9)
         │
         ▼
[İP 4: Pilot Entegrasyon, Saha Doğrulama & Ticarileşme] (Ay 8-12)
```

### İP 1: ZKP Kriptografik Denetim Mimarisi (Ay 1 - 4)
* Model girdileri ve ağırlıklarının veri sızıntısı oluşturmadan matematiksel ispatını üreten ZK devresinin (Circuits) yazılması.
* Müşteri tarafında çalışacak hafif (lightweight) yerel ajan konteynerinin geliştirilmesi.
* *Çıktı:* Sıfır Bilgi İspatı üreten çekirdek protokol kütüphanesi.

### İP 2: Çoklu LLM Halüsinasyon ve Bias Analiz Motoru (Ay 3 - 7)
* Kara-kutu yöntemlerle modele zıt girdiler (adversarial attack vectors) yollayan dinamik test jeneratörünün kodlanması.
* Türkçe ve İngilizce dil modellerinde semantik tutarlılık metriklerinin doğrulanması.
* *Çıktı:* Otomatik zafiyet tarama ve halüsinasyon puanlama motoru.

### İP 3: AI Audit Score™ ve Otomatik Sertifikasyon Modülü (Ay 6 - 9)
* AB Yapay Zeka Yasası (EU AI Act) ve KVKK denetim kontrol listelerinin algoritmik ağırlıklandırılması.
* Resmi denetçiler, sigorta şirketleri ve uyum departmanları için doğrulanabilir PDF/JSON karnesi üreten servis mimarisi.
* *Çıktı:* Tek tıkla indirilebilir resmi akreditasyon ve denetim raporu motoru.

### İP 4: Pilot Testler, Savunma/Fintech Doğrulamaları ve Ticarileşme (Ay 8 - 12)
* Teknopark İstanbul ekosistemindeki 3 pilot firmada (Fintech ve Savunma) saha testlerinin yapılması.
* Fikri Mülkiyet (TÜRKPATENT Faydalı Model) başvurusunun tamamlanması.
* Şirketleşme ve BİGG kapanış raporunun TÜBİTAK'a sunulması.
* *Çıktı:* Ticarileşmiş, fatura kesen üretim sürümü platform.

---

## 5. PROJE BÜTÇESİ VE KAYNAK KULLANIMI (900.000 TL)

TÜBİTAK BİGG yatırım desteği bütçesi en yüksek verimle şu kalemlere tahsis edilecektir:

| Bütçe Kalemi | Açıklama | Tutar (TL) | Oran (%) |
|:---|:---|:---:|:---:|
| **Personel Giderleri** | Kurucu Girişimci ve Kıdemli Yapay Zeka Araştırmacısı (12 Ay) | 480.000 TL | %53.3 |
| **Bulut & GPU Altyapısı** | Test ve kıyaslama için GPU sunucu kiralama (AWS/GCP/Yerli Veri Merkezi) | 180.000 TL | %20.0 |
| **Danışmanlık & Hizmet Alımı** | Kriptografik ZKP denetimi ve FSMH / Patent tescil danışmanlığı | 120.000 TL | %13.3 |
| **Donanım ve Laboratuvar** | Güvenli test iş istasyonu ve şifreleme modülleri | 70.000 TL | %7.8 |
| **Tanıtım & Saha Doğrulama** | Pilot müşteri testleri, fuar ve kurumsal saha operasyonları | 50.000 TL | %5.6 |
| **TOPLAM** | **TÜBİTAK 1512 BİGG Yatırım / Hibe Desteği** | **900.000 TL** | **%100** |

---

## 6. KURUCU PROFİLİ VE AKADEMİK DERİNLİK

* **Ercüment ERDEN (Kurucu Girişimci):**
  * Fintech, ödeme sistemleri ve yapay zeka teknolojilerinde 10+ yıl kurumsal ve girişimcilik tecrübesi.
  * Lionexia Ltd. kurucu yöneticiliği ve uluslararası yazılım mimarisi liderliği.
  * Uluslararası yapay zeka yorumlanabilirlik araştırmacıları (Cambridge Üniversitesi - Jacob Coxon vb.) ile doğrudan temas ve ortak Ar-Ge işbirlikleri.
* **Akademik Danışma Kurulu Vizyonu:**
  * Teknopark İstanbul kurucu ortağı İstanbul Teknik Üniversitesi (İTÜ) Yapay Zeka ve Veri Bilimi Merkezi ile ortak araştırma modelleri.

---

## 7. MİLLİ PRESTİJ VE STRATEJİK DEĞER

Bu proje sıradan bir ticari yazılım değildir; **Türkiye'yi küresel yapay zeka anayasasının uygulayıcısı ve denetçisi yapan ulusal bir stratejik kazanımdır.**

TÜBİTAK 1512 BİGG desteği ile Teknopark İstanbul bünyesinde filizlenecek ALPAR AI; ülkemizin verisini korurken, dünyada güvenilir yapay zeka standartlarını belirleyen küresel bir "Türk AI-Governance Unicorn'u" olma potansiyeline sahiptir.
