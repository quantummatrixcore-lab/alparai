# PROPOSAL 015: Admin Panel API Key Management & Usage Tracking Dashboard

- **status:** pending
- **author:** `[Antigravity]`
- **related-item:** `Admin OS` / `System Management`
- **created:** `2026-07-22`

---

## 1. Gözlem / Problem

Admin panelinde sistem tarafından kullanılan yapay zeka sağlayıcılarına (OpenAI, Anthropic, Gemini, OpenRouter, Vertex AI vb.) ait API anahtarlarının (API Keys) yönetimi için özel bir arayüz/menü bulunmamaktadır.

Mevcut durumda:

1. Yeni bir API key tanımlamak veya süresi dolan/kota dolumu yaşayan bir anahtarı güncellemek için `.env.local` veya ortam değişkenlerine müdahale edilmesi gerekmektedir.
2. Hangi API anahtarının ne kadar token/istek tükettiği, harcama maliyeti ve kullanım istatistikleri admin panelinden anlık olarak izlenememektedir.

## 2. Öneri: Admin API Key Yönetimi ve Kullanım İzleme Paneli

Admin paneline (`/admin/api-keys` veya `/admin/system/api-keys`) entegre edilecek yeni yönetim modülü şunları içermelidir:

### 2.1 Yeni API Key Ekleme & Yönetim (Create & Update)

- **Yeni Key Ekleme Formu**: Sağlayıcı seçimi (OpenAI, Anthropic, Google Gemini, OpenRouter, DeepSeek vb.), anahtar takma adı (label), gizli API Key değeri ve günlük/aylık limit tanımlama.
- **Key Güncelleme & Rotasyon (Rotate)**: Mevcut key'leri silmeden güvenli bir şekilde yenileyebilme (Maskelenmiş gösterim `sk-***1234`).
- **Aktif/Pasif Anahtarla Geçişi**: Kota dolumu veya arıza durumunda anahtarların tek tıkla pasife alınabilmesi.

### 2.2 Kullanım & Maliyet Takip Paneli (Usage Analytics)

- **Anlık Token ve İstek Grafiği**: Sağlayıcı bazlı günlük/aylık yapılan toplam API çağrısı ve harcanan token miktarı.
- **Bütçe & Harcama Uyarısı (Cost Guard)**: Belirlenen maliyet limitleri aşıldığında görsel uyarılar ve otomatik kota durdurma (Kill switch) durum göstergesi.

### 2.3 Ücretsiz AI Modelleri Önceliği (Free-Tier AI First Routing Policy)

- **Model Yönlendirme Önceliği (Rule #32 Entegrasyonu)**: Sistemdeki tüm otomatik işlemler (çeviri, özetleme, pre-triage, haber/olay tarama, arka plan analizleri) için **varsayılan olarak öncelikle ücretsiz AI modelleri** (Google Gemini Free Tier, OpenRouter `:free` etiketli modeller, HuggingFace Free Inference API vb.) kullanılacaktır.
- **Fallback & Otomatik Geçiş**: Ücretsiz modellerin kotası dolduğunda, yanıt verilemediğinde veya hız limiti (rate limit) aşıldığında sistem otomatik olarak bir sonraki en ucuz veya yedek ücretli API anahtarına geçecektir.
- **Admin Yönlendirme Önceliği Ayarı**: Admin panelindeki bu API Key ekranından hangi görev tipi için hangi model sıralamasının (Örn: 1. `google/gemini-2.5-flash:free`, 2. `meta-llama/llama-3-70b-instruct:free`, 3. `openai/gpt-4o-mini`) kullanılacağı görsel olarak ayarlanabilecektir.

## 3. Acceptance Criteria (Kabul Kriterleri)

1. **Admin Menü Entegrasyonu**: Admin yan menüsünde (Sidebar) veya Sistem Yönetimi sekmesinde "API Anahtarları" başlığının yer alması.
2. **Güvenli Saklama**: Veritabanında saklanan API anahtarlarının şifrelenmiş (AES-256-GCM / SHA-256) olarak tutulması ve istemciye asla açık metin gönderilmemesi.
3. **CRUD & Rotasyon**: Yeni key ekleme, düzenleme, silme ve rotasyon işlemlerinin çalışması.
4. **Metrik Takibi**: API anahtarının son kullanım tarihi, kalan kota/istek sayısı ve kullanım grafiğinin gösterilmesi.
5. **Ücretsiz Model Önceliği**: Model router'ın öncelikli olarak ücretsiz sağlayıcıları çalıştırması ve ücretli modellere yalnızca zorunlu hallerde (fallback) geçmesi.

## 4. Risk / Maliyet

- **Güvenlik Riski**: API anahtarlarının admin panelinde saklanması ve görüntülenmesi güvenlik hassasiyeti taşır.
  - _Mitigasyon_: Anahtarlar istemci tarafına sadece maskeli (`sk-proj-...a8f9`) gönderilecek, güncellemeler yalnızca `ceo` ve `admin` rolüne sahip yetkili kullanıcılara açık olacaktır.
