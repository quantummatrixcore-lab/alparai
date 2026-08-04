# PROPOSAL 017: Comprehensive Admin Panel UI/UX & i18n Overhaul

- **status:** pending
- **author:** `[Gemini 3.1 Pro / Architect]`
- **related-item:** `Admin OS` / `System UI` / `Trust Infrastructure`
- **created:** `2026-07-22`

---

## 1. Gözlem / Problem

Platformun `Admin OS` arayüzü büyüdükçe, 20'den fazla sayfada (Geo, Health, Strategy, SWOT, Risk Matrix, Valuation vb.) 4 temel sorun tespit edilmiştir:

1. **İngilizce Hardcoded Metinler (i18n Eksikliği):** Türkçe çeviri mekanizması (`next-intl`) yerine kodun içine doğrudan İngilizce kelimelerin (örn: "Very Low", "Active", "Healthy") gömülmüş olması.
2. **Görsel Zayıflık ve Etkileşim Eksikliği:** Yenilikler, risk matrisleri, strateji analizleri ve yol haritalarının profesyonel grafikler, Heatmap'ler, okuma sayaçları (Gauge) ve timeline (zaman çizelgesi) yerine düz metin tabanlı kartlarla (minimalist) sergilenmesi.
3. **Mock Data ve Kafa Karıştırıcı Boş Durumlar:** Canlı sisteme uygun olmayan sahte kullanıcı logları (ör: Cem Bölükbaşı, Ece Yüksel) ve içi boş modüller (Advisory Board, Analysis) için bilgilendirici "Empty State" tasarımlarının olmaması.
4. **Kritik İşlev Eksiklikleri:** Ana yönetim panosunda (Main Dashboard) son kayıt olan kullanıcıların görüntülenememesi ve API anahtarı kullanımlarının (Usage) profesyonelce sunulmaması (Referans: Proposal 015).

## 2. Öneri: Kapsamlı Mimari ve Görsel Güncelleme Planı

Tüm Admin arayüzünün endüstri standardı (tier-1) profesyonelliğe getirilmesi için 4 fazlı aşağıdaki büyük revizyon önerilmektedir:

### Faz 1: Tam Çeviri (i18n) Uyumluluğu

Aşağıdaki modüller tamamen yerelleştirilebilir (Next-Intl uyumlu) hale getirilecektir:

- `/admin/geo` & `geo-dashboard-client.tsx`
- `/admin/health` & `health-dashboard-client.tsx`
- `/admin/feature-flags` & `feature-flags-client.tsx`
- `/admin/strategy/swot` & `swot-board-client.tsx`
- `/admin/strategy/risks` & `risk-matrix-client.tsx`
- `/admin/strategy/roadmap` & `roadmap-client.tsx`
- `/admin/strategy/valuation` & `valuation-calculator-client.tsx`

### Faz 2: Profesyonel Görselleştirme (UI/UX Zenginliği)

- **Innovations (`/admin/innovations`)**: Kategorize edilmiş bölüm kartları (Connector, Havuz vb.) ve boş durum tasarımları.
- **Strategy & SWOT**: Metrik kartlarına mini grafikler (sparkline), SWOT çeyreklerine renkli degrade sınır çizgileri ve sayaçlar.
- **Roadmap (`/admin/strategy/roadmap`)**: Çeyreklik (Quarterly) aşama çubuklu (progress bar) interaktif zaman çizelgesi (Timeline).
- **Risk Matrix (`/admin/strategy/risks`)**: Risk yoğunluğunu gösteren profesyonel Heatmap matrisi ve hover (üzerine gelme) animasyonları.
- **Valuation (`/admin/strategy/valuation`)**: Form sonuçları için büyük profesyonel sayaç (Gauge) grafikleri.
- **Resources (`/admin/resources`)**: Altyapı (Vendor) servisleri için görsel ikonlar, canlı kapasite çubukları (progress bars).

### Faz 3: Gerçek Veri Uyumlandırması ve Boş Durum (Empty State) Tasarımları

- **Audit Logs (`/admin/audit`)**: Mockup isimlerin kaldırılarak sistemin gerçek canlı günlüklere veya profesyonel "Denetim Kaydı Yok" ekranına yönlendirilmesi.
- **Advisory Board & Analysis**: Veri bulunmadığında gösterilecek kurumsal "Boş Veri" (Empty State) vektörleri ve açıklamaları.
- **Ecosystem (`/admin/ecosystem`)**: Bekleyen 72 inceleme kaydının kaynağını açıklayan (Örn: "Dış Sistemlerden Taranan Otomatik Olay Kuyruğu") üst bilgilendirme başlığı.

### Faz 4: Eksik Panellerin Eklenmesi

- **Dashboard (`/admin/page.tsx`)**: Panele "Son Kayıtlı Kullanıcılar" bileşeninin eklenmesi.
- **API Keys (`/admin/api-keys/page.tsx`)**: Sadece listeleme değil, profesyonel kota, kullanım (Usage) grafikleri ve gizlilik katmanı sunan arayüz inşası.

## 3. Acceptance Criteria (Kabul Kriterleri)

1. Hedeflenen 20+ bileşenin içinde hiçbir İngilizce "hardcoded" string kalmamalı, tamamı `messages/en.json` ve `messages/tr.json` dosyalarına aktarılmalıdır.
2. Heatmap, Gauge, Timeline ve Sparkline bileşenleri Lucide veya mevcut Chart kütüphaneleriyle eksiksiz olarak ekranlara entegre edilmiş olmalıdır.
3. Herhangi bir tablo boşsa, profesyonel bir `EmptyState` render edilmelidir.
4. Terminalde `pnpm lint`, `pnpm typecheck` ve `pnpm test` sıfır hatayla geçmelidir.

## 4. Risk / Maliyet

- **Risk**: Geniş çaplı sayfa güncellemeleri, mevcut React hook durumlarını ve veritabanı sorgularını bozma riski taşır.
- **Mitigasyon**: Bileşenler (Client Components) birer birer (izole şekilde) güncellenecek, mock veri tasfiyesi sırasında DB veri yapıları korunacaktır.
