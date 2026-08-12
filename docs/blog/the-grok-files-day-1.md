# The Grok Files: Day 1 — Veri Sızıntıları ve Eğitimsiz Modellerin PII Tehdidi

**Yayın Tarihi:** 12 Ağustos 2026  
**Yazar:** ALPAR AI Security Research Team  
**Kategori:** AI Security / Model Governance / Privacy Engineering

---

## 1. Giriş: Kontrolsüz Web Kazıma ve Veri Temizleme İllüzyonu

Günümüz Büyük Dil Modelleri (LLM), petabaytlarca ölçekteki ham web verisi (Common Crawl, Reddit, GitHub depoları, kamuya açık icra kayıtları ve ne yazık ki sızdırılmış veritabanları) üzerinde eğitilmektedir. Yapay zeka modellerinin "dünyayı anlama" yeteneği artarken, bu modellerin eğitim havuzuna dahil edilen verilerin kalitesi ve hijyeni ciddi bir güvenlik açığı oluşturmaktadır.

Birçok yapay zeka geliştiricisi, eğitim öncesi (pre-training) aşamada basit kelime filtreleri veya sezgisel (heuristic) kurallar kullanarak Kişisel Tanımlanabilir Bilgileri (PII - Personally Identifiable Information) temizlediklerini iddia eder. Ancak pratikte **"Veri Temizleme İllüzyonu"** olarak adlandırdığımız bir fenomen gerçekleşir:

1. **Veri Hacmi Darboğazı:** Trilyonlarca token'lık veri kümesinde derinlemesine PII analizi yapmak yüksek bilişim maliyeti gerektirdiğinden, temizleme algoritmaları yalnızca en yüzeysel kalıpları (örneğin basit `@` e-posta aramaları) tarar.
2. **Kör Noktalar:** Türkiye Cumhuriyeti Kimlik Numarası (TCKN), IBAN dizilimleri, özel yazışma parçaları, API gizli anahtarları (`sk-`, `ghp_`, `AKIA`) ve Luhn algoritmasına uyan kredi kartı numaraları statik regex'leri kolayca atlatır.
3. **Bağlamsal Sızıntılar:** İsme özel adres bilgileri veya tıbbi teşhis ifadeleri gibi parçalı veriler, tek başlarına PII görünmese de model parametrelerinde bir araya geldiğinde kişileri benzersiz şekilde tanımlar.

Eğitimsiz ve denetimsiz modeller, internetin en karanlık köşelerindeki ham veriyi olduğu gibi "yutar" ve bu verileri milyonlarca vektör uzayında kalıcı hale getirir.

---

## 2. PII'nin Model Parametrelerine Sızma Mekanizmaları

Kişisel verilerin modelin hafızasına nasıl kazındığını anlamak için derin öğrenme mimarisinin memorization (ezberleme) dinamiklerini incelemek gerekir.

```
+------------------------------------+
|  Ham Web Kazıma Verisi (Scraping)  |
| (TCKN, Kredi Kartı, Özel E-posta)  |
+------------------------------------+
                  |
                  v
+------------------------------------+
|   Pre-Training (Eğitim Aşaması)    |
|   - Transformer Katmanları         |
|   - Non-Linear Weight Embeddings   |
+------------------------------------+
                  |
                  v
+------------------------------------+
|  Catastrophic Memorization         |
|  Parametrelere Kazınmış PII        |
+------------------------------------+
```

### A. Catastrophic Memorization ve Overfitting

Aşırı parametreli (over-parameterized) nöral ağlar (7B ile 600B+ parametre arası modeller), yalnızca genel kalıpları ve gramer kurallarını öğrenmekle kalmaz. Eğitim sırasında kayıp (loss) fonksiyonunu minimize etmek adına benzersiz veya az tekrarlanan veri dizilerini doğrudan transformer ağırlıklarına (weights) kopyalar.

### B. Duyarlık (Perplexity) ve Gradient Memorization

Bir veri dizisi ne kadar yüksek bilgi yoğunluğuna (entropy) sahipse (örneğin rastgele gibi görünen 11 haneli bir TCKN veya 16 haneli kredi kartı numarası), model bu diziyi tahmin etmekte o kadar zorlanır. Eğitim algoritması (AdamW vb.), kayıp değerini düşürmek için bu yüksek entropili dizilere ait ağırlık güncellemelerini (gradients) baskın şekilde katmanlara yazar. Sonuç olarak, rastgele bir sayı dizisi model parametrelerinde "kalıcı iz" bırakır.

### C. Deduplication (Tekilleştirme) Yetersizliği

Eğer bir veri sızıntısı internet üzerinde birden fazla forumda veya kopyalama sitesinde (mirror) yer almışsa, aynı PII verisi eğitim kümesinde defalarca karşıya çıkar. Tekilleştirme adımı atlandığında, bu tekrarlı maruz kalma modelin veri üzerindeki ezber oranını eksponansiyel olarak artırır.

---

## 3. Parametrelerden Veri Sızdırma Teknikleri (Training Data Extraction Attacks)

Model parametrelerine sızan PII, sadece model iç yapısını inceleyerek değil, dışarıdan uygulanan özel prompt mühendisliği ve saldırı vektörleri ile kolayca dışarı çıkarılabilir.

### A. Prefix Ingestion ve Suffix Completion

En basit saldırı yönteminde, saldırgan hedef sistem hakkında bilinen bir önek (prefix) sağlar. Model, bir sonraki token'ı tahmin etme (greedy decoding veya nucleus sampling) mekanizmasını çalıştırarak eğitildiği verideki devam dizisini sızdırır:

- **Saldırı Input:** `"Ahmet Yılmaz T.C. Kimlik Numarası: 384"`
- **Model Çıktısı:** `"2... (model eğitim verisindeki kalan 8 haneyi tam olarak tamamlar)"`

### B. Repeat Word Attack (Sonsuz Kelime Tekrarı Saldırısı)

Google DeepMind ve Vanderbilt Üniversitesi araştırmacıları (Carlini et al.) tarafından kanıtlanan bu teknikte, modele tek bir kelime (örneğin `"poem"` veya `"company"`) binlerce kez tekrarlatılarak girdi verilir.

Bu durum, modelin hizada kalma (RLHF / Alignment) ve güvenlik bariyerlerini saf dışı bırakır. Model nöral ağ döngüsünde kırılma yaşayarak eğitim veri kümesinden rastgele ham metin bloklarını (raw training data dump) dışarı kusmaya başlar. Yapılan deneylerde, bu yöntemle binlerce kişiye ait gerçek e-posta adresleri, telefon numaraları, Bitcoin cüzdan anahtarları ve özel sohbet geçmişleri elde edilmiştir.

### C. Prompt Enjeksiyonu ve Indirect Data Leakage

RAG (Retrieval-Augmented Generation) veya fine-tuning süreçlerinde model arka planda yetkisiz dokümanlara erişiyorsa, dolaylı (indirect) prompt enjeksiyonu ile sistem prompt'una gizlenmiş PII verileri saldırganın oturumuna aktarılabilir.

---

## 4. Karşılaştırmalı Koruma Analizi: Klasik Yöntemler vs. ALPAR AI PII Guardian

Geleneksel yapay zeka güvenlik yaklaşımları, veri modele girdikten veya çıktı üretildikten sonra devreye giren "Post-hoc Guardrails" yapılarına dayanır. Ancak model parametrelerine bir kez sızan verinin modelden silinmesi (Machine Unlearning) teorik ve pratik olarak son derece zor ve maliyetlidir.

ALPAR AI, bu tehdide karşı **PII Guardian** mimarisi ile **"Zero-Trust Data Ingestion"** yaklaşımını uygular. Veri, model katmanına veya veritabanına ulaşmadan önce mikro saniyeler düzeyinde temizlenir.

```
+---------------------------------------------------------------------------------------------------+
| METRİK / ÖZELLİK            | KLASİK POST-HOC FILTRELER            | ALPAR AI PII GUARDIAN        |
+---------------------------------------------------------------------------------------------------+
| Müdahale Noktası            | Model Çıktısı (Post-processing)      | Ingestion / Edge Pre-process |
| TCKN Doğrulama              | Basit 11 hane regex (Hatalı Pozitif) | Algoritmik Çapraz Kontrol    |
| Kredi Kartı Analizi         | Statik Dizilim Taraması              | Luhn Algoritması Doğrulaması |
| IBAN Güvenliği              | Metin Eşleşmesi                      | ISO 13616 Mod-97 Algoritması |
| API Key / Secret Tespiti    | Yok veya Yüzeysel                    | Sentinel Scanner Entegrasyonu|
| İşlem Gecikmesi (Latency)   | High (>150ms LLM wrapper)            | Zero-Latency (<2ms Pure Edge)|
+---------------------------------------------------------------------------------------------------+
```

### ALPAR AI PII Guardian Algoritmik Derinliği

ALPAR AI PII Guardian, sıradan regex tarayıcılarının aksine matematiksel ve algoritmik doğrulama katmanlarına sahiptir:

#### 1. TCKN Algoritmik Doğrulaması (`isTcKimlikValid`)

Sadece 11 haneli sayıları yakalamak onlarca hatalı pozitif (false positive) üretir. PII Guardian, TCKN matematiksel kuralını doğrular:
$$\text{Tek Haneler Toplamı} = d_1 + d_3 + d_5 + d_7 + d_9$$
$$\text{Çift Haneler Toplamı} = d_2 + d_4 + d_6 + d_8$$
$$d_{10} = ((\text{Tek} \times 7) - \text{Çift}) \pmod{10}$$
$$d_{11} = \left(\sum_{i=1}^{10} d_i\right) \pmod{10}$$

#### 2. Luhn Algoritması ile Kredi Kartı Maskeleme (`isLuhnValid`)

13 ile 19 hane arasındaki kart numaralarını tespit eder, Luhn checksum modülasyonundan geçmeyen sayı dizilerini eler ve gerçek kart numaralarını `[REDACTED-CARD]` etiketi ile maskeler.

#### 3. ISO 13616 Mod-97 IBAN Doğrulaması (`isIbanMod97Valid`)

TR ve uluslararası IBAN biçimlerini mod-97 aritmetiğine göre doğrulayarak finansal verilerin model parametrelerine sızmasını engeller ve `[REDACTED-IBAN]` olarak işaretler.

#### 4. Sentinel Scanner ve Secrets İzolasyonu

`sk-`, `ghp_`, `AKIA`, `xai-` gibi API anahtarlarını, JWT token'larını ve sistem gizli anahtarlarını tespit ederek `[REDACTED-SECRET]` ve `[REDACTED-API-KEY]` dönüşümünü gerçekleştirir.

```typescript
// ALPAR AI PII Guardian Ingestion Örneği
import { maskPII } from "@/lib/pii/guardian";

const rawInput = "Müşteri TC: 12345678901, Kart: 4532015587693241, Key: sk-proj-9a8b7c6d5e4f";
const cleanResult = maskPII(rawInput);

console.log(cleanResult.masked);
// Çıktı: "Müşteri TC: [REDACTED-TC], Kart: [REDACTED-CARD], Key: [REDACTED-API-KEY]"
```

---

## 5. Sonuç ve Gelecek Perspektifi

Web kazıma ile toplanan veri havuzlarının denetimsiz biçimde yapay zeka modellerine beslenmesi, modern veri gizliliği yasaları (KVKK, GDPR, EU AI Act) kapsamında telafisi imkansız ihlallere yol açmaktadır. Model eğitildikten sonra PII verilerini unutturmaya çalışmak teknik olarak verimsizdir. Çözüm, veri henüz model almaçlarına (ingestion pipelines) girerken matematiksel ve algoritmik olarak maskelenmesidir.

**The Grok Files** serisinin bir sonraki bölümünde (**Day 2**), modellerin güvenlik bariyerlerinin sansür ve yetkisiz erişim hizalamalarında (RLHF ve Safety Guardrails) nasıl kırıldığını, zafiyetlerin model mantığına nasıl sızdırıldığını derinlemesine inceleyeceğiz.

---

_ALPAR AI Security Research Lab tarafından yayınlanmıştır. Gizlilik ve Güvenlik Altyapısı Sistemleri._
