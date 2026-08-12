# The Grok Files - Gün 10: ALPAR AI Hesap Verebilirlik Protokolü ve Geleceğin Güvenlik Standartları

**Yayınlayan:** ALPAR AI Güvenlik ve Hesap Verebilirlik Laboratuvarı  
**Tarih:** 12 Ağustos 2026  
**Seri:** The Grok Files (10/10)  
**Lisans:** AGPL-3.0  
**Yazar:** ALPAR AI Security Research Team

---

## 📌 Giriş: Kapalı Kutulardan Kriptografik Hesap Verebilirliğe

"The Grok Files" serisinin ilk 9 gününde, yapay zeka ekosistemini tehdit eden kritik güvenlik açıklarını inceledik: PII sızıntıları, Guardrail bypass yöntemleri, hallüsinasyon manipülasyonları, dolaylı istem enjeksiyonları (Indirect Prompt Injection), model hırsızlığı ve kontrolsüz otonom ajan eylem döngüleri.

Bu analizlerin ortaya koyduğu temel gerçek şudur: **Günümüz yapay zeka sistemleri bir "güven krizi" yaşamaktadır.** Kapalı kutu (black box) mimariler, "bize güvenin" vaadi üzerine inşa edilmiş fakat ne veri işleme süreçlerinde ne de model kararlarında matematiksel ve doğrulanabilir bir şeffaflık sunamamıştır.

Serinin bu son gününde (Gün 10), teşhisten tedaviye geçiyoruz. **ALPAR AI Hesap Verebilirlik Protokolü**, yapay zeka güvenliğini soyut etik beyanlardan çıkarıp **kriptografik, veritabanı seviyesinde ve bağımsız olarak denetlenebilir** bir mühendislik standardına dönüştürür.

---

## 🛡️ 1. PII Guardian: Veri Sıfır Sızıntı (Zero-Leakage) Hattı

Yapay zeka modellerine ve veritabanlarına giren serbest metinler (free-text inputs), kişisel verilerin (PII) ve ticari sırların sızmasında en büyük vektördür. ALPAR AI’ın **PII Guardian** mimarisi, kullanıcı girdisini veritabanına veya LLM modeline ulaşmadan önce uygulama katmanında yakalar ve sanitize eder.

### Mimari Tasarım ve Algoritma İşleyişi

PII Guardian, yüksek performanslı düzenli ifadeler (Regex), heuristik kalıp eşleme ve semantik veri sınıflandırma tekniklerini birleştirir.

```typescript
// PII Guardian Mantıksal Akışı (Örnek Mühendislik Uygulaması)
import { sanitizeText } from "@/lib/pii/guardian";

const rawUserInput =
  "Kullanıcı TCKN: 12345678901, E-posta: ahmet@example.com kriz bildiriminde bulundu.";
const sanitizedOutput = sanitizeText(rawUserInput);

// Çıktı: "Kullanıcı TCKN: [MASKED_TCKN], E-posta: [MASKED_EMAIL] kriz bildiriminde bulundu."
```

### Korunan Veri Tipleri ve Maskeleme Standartları:

- **T.C. Kimlik / SSN Numaraları:** Algoritmik doğrulama (checksum) ile tespit edilir ve `[MASKED_TCKN]` olarak anonimleştirilir.
- **E-posta ve Telefon Numaraları:** SHA-256 tabanlı irreversible maskeleme veya semantik etiketleme uygulanır.
- **Kredi Kartı ve Finansal Veriler:** Luhn algoritması kontrolleriyle tespit edilerek `[MASKED_FINANCIAL]` formatına dönüştürülür.
- **IP Adresleri ve Hassas Konumlar:** Hash tabanlı anonimlik sağlanır; ham log kaydı asla tutulmaz.

---

## 🔒 2. Supabase RLS ve Veritabanı Seviyesinde Yetkilendirme

Yapay zeka uygulamalarında istemci (client) tarafındaki yetkilendirmeler yetersizdir. Zararlı bir aktör veya manipüle edilmiş bir LLM ajanı, istemci kodunu baypas ederek veritabanına doğrudan sorgu atabilir. ALPAR AI mimarisinde güvenlik **Row Level Security (RLS)** ile veritabanı motorunun (PostgreSQL) içine gömülmüştür.

### RLS Politikaları ve Güvenlik Sınırları

Tüm veri tabanı tabloları (`incidents`, `incident_votes`, `audit_logs`), katı RLS politikaları ile korunur. Kullanıcılar veya ajanlar yalnızca kendi yetki alanlarındaki verilere erişebilir.

```sql
-- Örnek RLS Politikası: İhlal Bildirimleri İzolasyonu
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Sadece kimliği doğrulanmış kullanıcılar kendi oluşturdukları veya herkese açık onaylanmış verileri okuyabilir
CREATE POLICY "Incidents Read Policy"
ON public.incidents
FOR SELECT
USING (
  status = 'published' OR
  (auth.uid() IS NOT NULL AND reporter_id = auth.uid())
);

-- Doğrudan istemci üzerinden INSERT engellenir; sadece doğrulanmış Server Actions kullanılabilir
CREATE POLICY "Incidents Insert Policy"
ON public.incidents
FOR INSERT
WITH CHECK (
  auth.uid() = reporter_id AND
  char_length(description) >= 20
);
```

### Sıfır İstemci Doğrudan Yazma (Zero Direct Client Mutation)

ALPAR AI mimarisinde istemci tarafındaki Supabase istemcisi asla `supabase.from().insert()` çağrısı yapamaz. Tüm mutasyonlar `src/actions/<domain>.ts` altındaki **Server Action**'lar üzerinden geçer. Böylece PII Guardian süzgeci ve oran sınırlaması (rate limiting) bypass edilemez.

---

## 📜 3. Şeffaflık Kanıtları (Proof of Transparency & Cryptography)

Yapay zeka modellerinin ne zaman güncellendiği, hangi istemlere ne yanıt verdiği ve veri tabanında değişiklik yapıp yapmadığı geriye dönük değiştirilemez log zincirleriyle doğrulanmalıdır.

### Kriptografik Denetim Zinciri (Cryptographic Audit Trail)

ALPAR AI, her kritik eylem ve model çıktısı için **Hash-Chain (Merkle Tree tabanlı)** kanıt oluşturur:

1. **Girdi ve Çıktı Hash'leme:** Gelen prompt ve üretilen yanıt `SHA-256(Prompt + Context + Timestamp)` ile imzalanır.
2. **Değiştirilemez Loglama:** Log verisi önceki log bloğunun hash değerini içerir ($H_n = \text{SHA256}(H_{n-1} + \text{Data}_n)$).
3. **Kriptografik İspat:** Herhangi bir log girdisi geçmişe dönük silinirse veya değiştirilirse zincir kırılır ve bağımsız denetçiler ihlali anında tespit eder.

| Bileşen                 | İşlev                            | Güvenlik Garantisi                                                |
| :---------------------- | :------------------------------- | :---------------------------------------------------------------- |
| **Girdi Hash'i**        | Prompt ve bağlamın özeti         | İstem üzerinde geçmişe dönük tahrifat yapılamaz.                  |
| **Model Sürüm İmzası**  | Kullanılan LLM ve ağırlık hash'i | Model versiyon kayması (drift) ve gizli güncelleme tespit edilir. |
| **Zaman Damgası (TSA)** | RFC 3161 uyumlu zaman damgası    | Eylemin kesin gerçekleşme zamanı kanıtlanır.                      |
| **Kriptografik Zincir** | Bloklar arası SHA-256 bağı       | Veri tabanı yöneticisi dahi geçmiş logları değiştiremez.          |

---

## 🌐 4. Bağımsız Yapay Zeka Denetimi İçin Açık Standart Önerileri

Sektördeki mevcut yapay zeka denetimleri, şirketlerin kendi hazırladığı "öz değerlendirme" raporlarından ibarettir. ALPAR AI, yapay zeka sistemlerinin denetlenmesi için 4 sütunlu **Açık AI Denetim Standardı (Open AI Audit Standard - OAAS)** önermektedir:

### 1. Standartlaştırılmış Red-Teaming API'si

Her yapay zeka sağlayıcısı, bağımsız güvenlik araştırmacılarının ve otomatik red-team ajanlarının güvenlik duvarlarını test edebileceği korumalı, standartlaştırılmış bir deneme ortamı (sandbox API) sunmalıdır.

### 2. Model Kartı ve Köken (Provenance) Doğrulaması

Modellerin hangi veri kümeleriyle eğitildiği, lisans uyumluluk matrisi ve telifli verilerin çıkarılması (machine unlearning) mekanizmaları makine tarafından okunabilir (JSON-LD / SPDX) formatta yayınlanmalıdır.

### 3. Yapılandırılmış İhbar ve Güvenlik Zafiyeti Bildirimi (Vulnerability Disclosure)

AI sistemlerindeki Jailbreak, PII sızıntısı ve Logic Bug durumları için standart `security.txt` benzeri `ai-security.json` dosyası yayınlanmalı; ihbarcılar için hukuki koruma güvencesi sunulmalıdır.

### 4. Gerçek Zamanlı Davranışsal Telemetri

Modellerin konfide skorları, hallüsinasyon oranları ve güvenlik filtresine takılan istem sayıları canlı açık paneller (Open Dashboards) üzerinden şeffafça paylaşılmalıdır.

---

## 🔓 5. AGPL-3.0 Vizyonu ve Güvenilir AI Ekosistemi

Yapay zeka güvenliği mülkiyetçi (proprietary) sırların arkasına saklanamaz. Güvenlik, gizlilik yoluyla (security through obscurity) değil, **açık kod ve topluluk denetimi** ile sağlanır.

### ALPAR AI’ın Açık Kaynak Taahhüdü

- **AGPL-3.0 Lisansı:** ALPAR AI platformunun tüm altyapısı AGPL-3.0 lisansı altında açık kaynaktır. Bu, altyapıyı kullanan veya değiştiren herkesin geliştirmelerini toplulukla paylaşmasını zorunlu kılar.
- **Topluluk Odaklı Güvenlik:** Sadece tek bir şirketin mühendislik ekibine değil, küresel güvenlik araştırmacıları topluluğunun kollektif zekasına dayanır.
- **Ekosistem Standartlaştırması:** ALPAR AI, güven altyapı bileşenlerini (PII Guardian, RLS kalıpları, Audit Logger) tüm geliştiricilerin kendi projelerine entegre edebileceği modüler paketler olarak sunar.

---

## 🎯 Sonuç: Güven İnşa Edilebilir Bir Mühendislik Disiplinidir

"The Grok Files" serisi boyunca gördüğümüz üzere; kontrolsüz otonom ajanlar, kapalı kutu algoritmalar ve PII sızıntıları yapay zekanın geleceğini tehdit etmektedir. Ancak çözüm imkansız değildir.

ALPAR AI olarak savunumuz nettir:

> **"Yapay zekaya körü körüne güvenilemez; yapay zeka ancak kriptografik ve açık standartlarla hesap verebilir kılınabilir."**

10 günlük bu seri, sadece sorunları teşhis etmekle kalmamış, geleceğin güvenli yapay zeka mimarisinin yapı taşlarını ortaya koymuştur. ALPAR AI Hesap Verebilirlik Protokolü, etik yapay zeka vaatlerini doğrulanabilir mühendislik gerçekliğine dönüştürmek için buradadır.

---

### 🚀 Katkıda Bulunun ve Katılın

- **GitHub Repository:** [quantummatrixcore-lab/alparai-platform](https://github.com/quantummatrixcore-lab/alparai-platform)
- **Topluluk ve Tartışmalar:** ALPAR AI Insights (`/insights`) ve GitHub Discussions üzerinden güvenlik standartları tartışmalarına katılın.
- **Katkı Sağlayın:** AGPL-3.0 vizyonumuza destek olmak için kod, güvenlik analizi veya dokümantasyon katkılarınızı bekliyoruz.
