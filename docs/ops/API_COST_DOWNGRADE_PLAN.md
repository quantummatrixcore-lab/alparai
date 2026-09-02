# 📉 API & SaaS Maliyet Optimizasyon ve Downgrade Planı
**Tarih:** 02 Eylül 2026
**Uygulama Alanı:** `D:\ErcumentOs` Çekirdek Ekosistemi

Bu doküman, sistem üzerinde tespit edilen paralı aboneliklerin ve dış API servislerinin Hobby/Free (Ücretsiz) katmanlara çekilmesi için hazırlanan simülasyon ve aksiyon planıdır.

## 1. Web & Edge Altyapısı
### Cloudflare
- **Mevcut Durum:** `CLOUDFLARE_API_TOKEN` aktif.
- **Aksiyon Planı:** Pro/Business abonelikleri iptal edilecek, zone'lar Free plana düşürülecek.
- **Etki:** Gelişmiş WAF, resim optimizasyonu ve hızlı analitik özelliklerinden feragat edilecektir.

### Vercel
- **Mevcut Durum:** `.env` içerisinde deaktif (yorum satırına alınmış).
- **Aksiyon Planı:** Vercel CLI kullanılmaya devam edilecek, Hobby tier limitleri içinde kalınacak.

## 2. İzleme & Güvenlik (Monitoring & Security)
### Sentry
- **Mevcut Durum:** `SENTRY_AUTH_TOKEN` aktif.
- **Aksiyon Planı:** Team/Business katmanından Developer (Free) katmana düşürülecektir.
- **Etki:** Hata takibi ayda 5.000 log ve 10.000 performans işlemi ile sınırlandırılacak, veri tutma süresi kısalacaktır.

### Semgrep
- **Mevcut Durum:** `SEMGREP_APP_TOKEN` aktif.
- **Aksiyon Planı:** Team/Pro planından Community (Ücretsiz) plana geçiş yapılacaktır.
- **Etki:** Temel SAST çalışmaya devam edecek, fakat çapraz dosya analizleri (taint analysis) ve derin PR otomasyonları kaybedilecektir.

## 3. Yapay Zeka & LLM Servisleri
### OpenRouter
- **Mevcut Durum:** `OPENROUTER_API_KEY` aktif (Kullandıkça Öde).
- **Aksiyon Planı:** Sistem içindeki tüm API çağrıları `:free` tag'li (ücretsiz) modellere yönlendirilecek, kredi yüklemesi durdurulacaktır.

### Groq
- **Mevcut Durum:** `GROQ_API_KEY` aktif.
- **Aksiyon Planı:** Ücretli abonelik iptal edilerek Public Free katman limitlerine dönülecektir.
- **Etki:** Dakika başı token (TPM) ve istek (RPM) limitleri ciddi oranda daralacaktır.

### Hugging Face
- **Mevcut Durum:** `HF_TOKEN` aktif.
- **Aksiyon Planı:** HF Pro aboneliği iptal edilecektir.
- **Etki:** Inference Endpoint ve GPU kullanımları durdurulacak, tamamen ücretsiz katmana geçilecektir.

## 4. Web Arama & Scraping (Data Extraction)
### Tavily
- **Mevcut Durum:** `TAVILY_API_KEY` aktif.
- **Aksiyon Planı:** Ücretli plandan "Researcher" (Free) katmanına geçilecektir.
- **Etki:** Aylık maksimum 1.000 API isteği ile sınırlandırılacaktır.

### Firecrawl
- **Mevcut Durum:** `FIRECRAWL_API_KEY` aktif.
- **Aksiyon Planı:** Dashboard üzerinden abonelik iptal edilecek ve ücretsiz katmana çekilecektir.
- **Etki:** Eşzamanlı tarama (concurrency) düşürülecek, aylık tarama kredisi minimal seviyeye inecektir.

---
*(Not: Sistemde herhangi bir Supabase yapılandırması bulunamamıştır.)*
