# ALPARAI — CANLI PROJE VE SİSTEM HAFIZASI (MEMORY.md)

> **SON GÜNCELLEME TARİHİ:** 19 Ekim 2026  
> **DURUM:** 3.130 Doğrulanmış Vaka, 2.482+ Commit, DeHost PostgreSQL 16 Canlı Altyapı ve Teknopark İstanbul HASAT 2026 / TÜBİTAK 1501 Denetim Hazırlığı Tamamlandı. 🚀

---

## 📌 1. PROJE VE KATEGORİ KİMLİĞİ
* **Proje Adı:** AlparAI (`alparai.com`)
* **Vizyon:** Yapay Zekânın Küresel Sivil Anayasası, Epistemic Firewall (Runtime Governance Proxy) ve AI TrustScore Kredi Derecelendirme (Moody's) Otoritesi.
* **Kategori:** B2B RegTech, AI TRiSM & Siber Güvenlik Girişimi (Startup).
* **Hedef Finansal Skala:** 
  * 18. Ay: 50 B2B Enterprise Sözleşme &rarr; **$1.5M - $3M ARR**
  * 36. Ay: Global InsurTech Lisanslaması &rarr; **$15M - $30M ARR**
  * 5. Yıl: Küresel Tahkim & Sigorta Tekeli &rarr; **$100M+ ARR (Unicorn)**

---

## 👥 2. KADRO VE DOĞRULANMIŞ EKİP OTORİTESİ
* **Ercüment Erden (CTO & Kurucu):** Sistem mimarı, Epistemic Firewall ve ZKP otonom güvenlik protokolü yaratıcısı. 
  * İletişim: `ercument.erden@alparai.com` | `+90 (532) 440-83-89` | `ercumenterden.com`
* **Prof. Dr. Musa Aygül (Danışma Kurulu - Hukuk & Tahkim):** Selçuk Üniversitesi Ticaret Hukuku Anabilim Dalı Başkanı. W3C ihlal loglarının Uluslararası Ticari Tahkim'de (MÖHUK ve ISO/IEC 27037) geçerli yasal delil olmasını sağlayan hukuki doktrin hamisi.
* **Ahmet Rıfat Albuz (Danışma Kurulu - Kriz İletişimi):** Kıdemli Medya Lideri (`ahmetrifatalbuz.com`). Şirketlerin AI halüsinasyon krizlerinin PR yönetimi.

---

## 🛡️ 3. ÇİFT TARAFLI İŞ MODELİ VE GELİR MOTORLARI
1. **Sivil Şikayet Meydanı (B2C - Şikayetvar Modeli):** Tüketiciler ve kurumlar halüsinasyon, telif ve veri ihlallerini ücretsiz bildirir. Kuralları halk koyar.
2. **B2B Çözüm Portalı & Epistemic Firewall (Cloudflare Modeli):** AI şirketleri marka itibarını korumak için abone olur ($499-$2.499/ay). İzole RAM-içi proxy sızıntıları anında bloklar.
3. **Aktüeryal Veri Lisanslaması (InsurTech - Moody's Modeli):** Biriken **3.130 mühürlü gerçek ihlal verisi** sigorta ve reasürans devlerine (Allianz, Munich Re vb.) aktüeryal risk modeli olarak lisanslanır.
4. **Dijital Tahkim Harçları:** MÖHUK ve UNCITRAL tahkim süreçlerinde kullanılan W3C pasaport işlem bedelleri.

---

## 📊 4. MEVCUT METRİKLER, DEHOST ALTYAPISI VE VERİ HENDEĞİ (DATA MOAT)
* **Git Kod Tabanı:** 2.482+ Git Commiti ile test edilmiş, monorepo mimarisi (`apps/`, `core/`, `dehost/`, `src/`).
* **Doğrulanmış İhlal Havuzu:** 24+ küresel model taranarak elde edilmiş, mühürlenmiş **3.130 gerçek yapay zekâ ihlal kaydı** aktif ve soğuk-başlangıç (cold-start) bariyeri aşılmıştır.
* **Veritabanı Mimarisi (DeHost ALAN-B):** 
  * DeHost Bare-Metal PostgreSQL 16 (Düğüm: `45.143.4.92:5432`).
  * 146 Tablo, 360 Row-Level Security (RLS) politikası ile tam kurumsal veri izolasyonu.
  * `public.incidents` Şema Hakikati: `id (uuid PK)`, `title`, `description`, `model_custom_name`, `provider_custom_name`, `ai_model_id (FK)`, `ai_provider_id (FK)`, `status`, `severity`, `category`, `eu_act_*`, `encrypted_evidence`, `evidence_ciphertext`.
  * ⚠️ *Sıfır Halüsinasyon Notu:* `incidents` tablosunda `ai_model` ve `ai_provider` kolonları yoktur; model bağları `ai_model_id` ve `model_custom_name` üzerinden yürütülür.
* **Canlı Endpoint Radarı:**
  * **Oracle TrustScore (`/api/v1/oracle/trust-score`):** Dynamic Bayesian kredi derecelendirme, SHA-256 HMAC kriptografik dijital imza mührü (`oracleSignature`).
  * **Article 50 Şeffaflık Radarı (`/api/v1/compliance/article50`):** EU AI Act Madde 50 uyumu, C2PA manifest doğrulama, SynthID / Digimarc analizleri, otomatik PII maskeleme.
  * **ZKP Whistleblower WebCrypto (`/api/v1/whistleblower`):** Tarayıcıda WebCrypto SubtleCrypto 256-bit AES-GCM + RSA-OAEP ile istemci taraflı şifreleme (`ZK_ENC_v1$`), sıfır-bilgi (Zero-Knowledge) ihbarcı koruması.

---

## ⚠️ 5. BİLİNEN DEFEKTLER VE İYİLEŞTİRME YOL HARİTASI
1. **1.892 Adet Modele Bağlanmamış Vaka (Unlinked Backlog):**
   * Veritabanındaki 3.130 vakanın 1.892 adedinde `ai_model_id` değeri boştur (`NULL`).
   * `0005_prod_data_alignment.sql` ile `model_custom_name = 'Unknown'` backfill uygulanmıştır.
   * `0004_provider_attribution.sql` atıf motoru ile otomatik model ID bağlama işlemi yürütülmektedir.
2. **In-Memory Rate-Limit Fallback:**
   * Redis bağlantı kesintilerinde fail-open olmak yerine bellek içi `_localHits` Map (60 req/min, 20.000 limit) devreye girer.
3. **Zoho Temizliği (Legacy Residue):**
   * E-posta sistemi Purelymail + Resend hibrit mimarisine taşınmış olup, eski Zoho MX/SPF DNS kayıtları ve yardımcı scriptlerinin tasfiyesi tamamlanmaktadır.

---

## 🔒 6. OPERASYONEL GÜVENLİK PROTOKOLÜ
* **Port 22 Mutlak Yasağı:** Güvenlik açığı oluşturan standart SSH Port 22 kullanımı AlparAI ve Matrix genelinde KESİNLİKLE YASAKTIR.
* **DeHost Port 18222:** Bare-metal sunucu operasyonları Port 18222, WireGuard Mesh VPN (10.99.0.0/24) ve Zero-Trust tüneller üzerinden yürütülür.
* **Sıfır Halüsinasyon Doktrini:** Doğrulanamayan hiçbir tablo, endpoint veya veri canlı kabul edilmez; Akıl Hunisi süzgeci esastır.

---

## 🚀 7. MİLAT: TEKNOPARK İSTANBUL HASAT 2026 BAŞVURUSU
* **Başvuru Tarihi:** 07 Ekim 2026
* **Durum:** Form %100 eksiksiz dolduruldu, YC/Sequoia formatındaki Slidev PDF sunumu ve uluslararası standartlardaki `AlparAI_Global_Logo.png` yüklenerek resmi başvuru tamamlandı.
* **Resmi Başvuru Kaydı:** `D:\03_ALPARAI\HASAT_2026_BASVURU\HASAT_BASVURU_KAYDI_OFFICIAL.md`

---

## 🏛️ AGI IDENTITY STANDARD (2026-10-13)
Konuşma başlığı ve alt ajan Rol etiketleri `D:\00_MATRIX\AGI_IDENTITY_STANDARD.md` standartlarına tabidir: Kök oturum başlığı `Matrix + Atatürk + Tesla + Da Vinci + Einstein + <Model Adı>`; alt ajan Rolü `Matrix + <Kullanılan AGI(ler)> + <Tam Model Adı> + <Görev Başlığı>` formatındadır.
