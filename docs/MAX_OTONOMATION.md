# ALPAR AI — Max Otonomation Stratejisi

> **Tarih:** 2026-07-15
> **Kapsam:** Kaynakları maksimum verimlilikle kullanarak %100 otomasyon seviyesine ulaşma planı

---

## 1. Mevcut Durum Özeti

### Altyapı ($45/ay)

| Servis        | Plan | Aylık | Kullanım                                  |
| ------------- | ---- | ----- | ----------------------------------------- |
| Vercel Pro    | Pro  | $20   | Hosting, edge functions, cron jobs        |
| Supabase Pro  | Pro  | $25   | Database, auth, storage, edge functions   |
| GitHub        | Free | $0    | Public repo, Actions (2000 dk/ay yeterli) |
| Sentry        | Free | $0    | Error tracking (5K error/ay)              |
| Resend        | Free | $0    | Transactional email (3K/ay)               |
| Upstash Redis | Free | $0    | Rate limiting (10K command/ay)            |

### AI Abonelikleri ($80/ay)

| Servis         | Plan  | Aylık | Kullanım Alanı                                    |
| -------------- | ----- | ----- | ------------------------------------------------- |
| Google Ultra   | Ultra | $30   | Gemini ekosistemi, 10K Flow kredisi, 20TB storage |
| Claude         | Pro   | $20   | Kod inceleme, mimari kararlar, reasoning          |
| ChatGPT        | Plus  | $20   | Genel görevler, web araştırma, görsel üretim      |
| GitHub Copilot | Pro   | $10   | IDE'de kod önerisi, refactoring                   |

**Toplam: $125/ay**

### Mevcut Otomasyon Katmanları

| Katman                  | Durum | Detay                                                 |
| ----------------------- | ----- | ----------------------------------------------------- |
| **15 Vercel Cron Job**  | Aktif | Günlük/haftalık planlı görevler                       |
| **12 Autopilot Modülü** | Aktif | AI-powered moderasyon, worker, queue, policies        |
| **9 AI Provider**       | Aktif | Multi-model routing (Gemini, OpenRouter, NVIDIA, vb.) |
| **5 Veri Connector**    | Aktif | RSS, Reddit, HackerNews, AIAAIC, AIID                 |
| **2 Webhook**           | Aktif | Stripe (ödeme), Sentry (hata alarmı)                  |
| **Spark Agent 24/7**    | Aktif | Arka plan izleme, sistem sağlığı                      |
| **tmux Orchestration**  | Aktif | 3 window, 8 pane dev ortamı                           |
| **Husky + lint-staged** | Aktif | Commit öncesi lint ve format                          |
| **PII Guardian**        | Aktif | Otomatik veri maskeleme                               |

---

## 2. Google Ultra Ekosistemi (10K Flow Kredisi)

### Araç Haritası

| Kategori      | Araç                | Kredi      | ALPAR AI Kullanımı               |
| ------------- | ------------------- | ---------- | -------------------------------- |
| **Model**     | Gemini 3.5 Flash    | Düşük      | Vaka moderasyonu, hızlı karar    |
|               | Gemini 3 Pro        | Orta       | Cross-audit, derin analiz        |
|               | Gemini 3 Deep Think | Yüksek     | Security audit, karmaşık bug     |
|               | Gemma               | Ücretsiz   | Edge computing, hızlı yanıt      |
| **Görsel**    | Nano Banana Pro     | Orta       | OG images, infografik, blog hero |
|               | Whisk               | Orta       | Sosyal medya görselleri          |
| **Video**     | Veo 3.1             | Yüksek     | Tutorial videoları, product demo |
|               | Gemini Omni         | Yüksek     | Video düzenleme, içerik üretimi  |
| **Tasarım**   | Stitch              | Ücretsiz\* | UI/UX üretimi, admin panel       |
| **Araç**      | Flow Tools          | Ücretsiz   | Özel workflow araçları           |
|               | Gemini Spark        | Ücretsiz   | 7/24 AI asistanı                 |
| **Araştırma** | NotebookLM          | Ücretsiz   | Doküman analizi, literatür       |
|               | AI Mode             | Ücretsiz   | Pazar araştırması                |

\*Stitch API Key gerekli (ücretsiz)

### Kredi Dağılımı (10K)

| Kategori                   | Kredi      | Oran     |
| -------------------------- | ---------- | -------- |
| Pazarlama (video + görsel) | 4,500      | %45      |
| Admin panel görselleri     | 2,000      | %20      |
| Eğitim/dokümantasyon       | 2,000      | %20      |
| Yedek/deneme               | 1,500      | %15      |
| **TOPLAM**                 | **10,000** | **%100** |

---

## 3. Eksik Otomasyon Katmanları

### Yüksek Öncelik

| #   | Eksik          | Çözüm                                              | Gereken Araç            |
| --- | -------------- | -------------------------------------------------- | ----------------------- |
| 1   | CI/CD Pipeline | GitHub Actions ile test + lint + typecheck + build | GitHub Actions          |
| 2   | Anlık Bildirim | Slack/Discord webhook ile cron başarısızlıkları    | Slack/Discord           |
| 3   | E2E Test       | Playwright test'leri her push'ta                   | Playwright + CI         |
| 4   | Stitch MCP     | Stitch API ile UI/UX üretimi                       | `stitch-mcp-server` npm |

### Orta Öncelik

| #   | Eksik                | Çözüm                                       | Gereken Araç          |
| --- | -------------------- | ------------------------------------------- | --------------------- |
| 5   | 360° Admin Panel     | Gerçek zamanlı servis durumu, cost tracking | Mevcut + yeni API'ler |
| 6   | DB Backup Otomasyonu | Supabase daily backup + export              | Supabase API          |
| 7   | Dependency Update    | Renovate/Dependabot ile otomatik güncelleme | Dependabot            |

---

## 4. 360° Admin Panel Planı

### Mevcut Durum

- 30 admin sayfası mevcut
- `System360Overview` var ama tüm veriler hardcoded
- Health check sadece Supabase + Redis kontrol ediyor

### Eksikler

| Bileşen              | Mevcut                    | Olması Gereken                                |
| -------------------- | ------------------------- | --------------------------------------------- |
| Servis Durumu        | Sadece Supabase + Redis   | Vercel, Sentry, Resend, AI APIs, Google OAuth |
| Cron İzleme          | Yok                       | Son çalışma zamanı, başarı/hata, süre         |
| Maliyet Takibi       | Mock data ($342.50 sabit) | Gerçek API cost, provider bazlı               |
| Entegrasyon Haritası | Yok                       | Tüm 3rd party servislerin durumu              |
| Env Audit            | Yok                       | Eksik env var'lar, güvenlik denetimi          |

### Uygulama Aşamaları

#### Aşama 1: Health Check API Genişletme

- [ ] `GET /api/admin/services/status` — Tüm servislerin durumu
- [ ] `GET /api/admin/cron/status` — Cron job çalışma durumları
- [ ] `GET /api/admin/costs/realtime` — Gerçek zamanlı maliyetler
- [ ] `GET /api/admin/env/audit` — Env var denetimi
- [ ] `src/lib/monitoring/service-checker.ts` — Her servis için health check
- [ ] `src/lib/monitoring/cron-tracker.ts` — Cron çalışma zamanlarını kaydet

#### Aşama 2: Service Status Grid

- [ ] `src/components/admin/service-status-grid.tsx`
- [ ] Her servis için kart (yeşil/kırmızı/sarı)
- [ ] Son 24 saat hata sayısı, uptime, son kontrol
- [ ] Kapsanan servisler: Supabase, Vercel, Redis, Sentry, Resend, Google OAuth, Gemini API, Claude API, Stripe

#### Aşama 3: Cron Job Monitor

- [ ] `src/components/admin/cron-monitor.tsx`
- [ ] Tüm 15 cron job'ın listesi + son çalışma zamanı
- [ ] Başarı/hata durumu (ikon), çalışma süresi
- [ ] Hata mesajı (varsa), tekrar çalıştır butonu
- [ ] `cron_log` tablosu migration'ı

#### Aşama 4: Real-time Cost Dashboard

- [ ] `src/components/admin/realtime-cost-dashboard.tsx`
- [ ] Güncel aylık maliyet, provider bazlı dağılım
- [ ] Günlük trend grafiği, bütçe alarmı

#### Aşama 5: Integration Health Map

- [ ] `src/components/admin/integration-health-map.tsx`
- [ ] Tüm entegrasyonların haritası (tree/graph)
- [ ] API key geçerliliği, rate limit durumu

#### Aşama 6: Mock Data Kaldırma

- [ ] `system-360-overview.tsx` — Hardcoded verileri real-time API ile değiştir
- [ ] `system-health-chart.tsx` — MOCK_DATA yerine gerçek sorgular
- [ ] `live-status-bar.tsx` — Default props yerine gerçek veriler

---

## 5. Stitch MCP Entegrasyonu

### Nedir?

Google Stitch, metin açıklamasından UI/UX tasarımı üreten AI aracı. MCP üzerinden OpenCode, Claude, Cursor ile entegre çalışır.

### Stitch MCP Paketleri

| Paket                          | Araç Sayısı | Özellik                 |
| ------------------------------ | ----------- | ----------------------- |
| `stitch-mcp-server` (önerilen) | 36          | Enterprise, en kapsamlı |
| `stitch-mcp`                   | 9           | Universal, basit        |
| `@google/stitch-sdk`           | SDK         | Resmi Google SDK        |

### Kurulum

```bash
# 1. API Key al
https://stitch.google.com/

# 2. .env.local'a ekle
STITCH_API_KEY=your-stitch-api-key
```

### Kullanım Alanları

| Görev             | Stitch Aracı             | Çıktı            |
| ----------------- | ------------------------ | ---------------- |
| Admin panel UI    | `generate_screen`        | HTML/CSS         |
| Login sayfası     | `generate_screen`        | HTML/CSS         |
| Dashboard layout  | `edit_screen`            | HTML/CSS         |
| Responsive design | `generate_variants`      | HTML/CSS         |
| Component library | `scaffold_project_files` | Dosyalar         |
| Site generation   | `build_site`             | Çok sayfalı site |

### Akış: Stitch → OpenCode → Proje

```
1. Stitch'te UI tasarla (generate_screen)
2. HTML kodunu al (get_screen_code)
3. OpenCode'da React/Next.js'e çevir
4. Projeye entegre et

Örnek: "Create an admin dashboard with dark theme"
→ Stitch HTML üretir
→ OpenCode Tailwind/Next.js'e dönüştürür
→ src/app/admin/ altına yerleştirir
```

---

## 6. Verimlilik Stratejisi

### Model Routing

| Görev             | Model         | Neden               |
| ----------------- | ------------- | ------------------- |
| Vaka moderasyonu  | Gemini Flash  | Hızlı, ücretsiz API |
| Cross-audit       | Gemini Pro    | Derin reasoning     |
| Kod inceleme      | Claude Sonnet | En iyi kod anlama   |
| Mimari karar      | Claude Opus   | En iyi reasoning    |
| Pazarlama içeriği | GPT-4o        | Yaratıcı içerik     |
| Görsel üretim     | Nano Banana   | Yüksek kalite       |
| Video üretimi     | Veo 3.1       | Profesyonel çıktı   |
| UI tasarımı       | Stitch        | Prompt'tan UI       |

### Otomasyon Katmanları

| Katman     | Araç                     | Yanıt Süresi |
| ---------- | ------------------------ | ------------ |
| L1: Anlık  | GitHub Copilot           | IDE'de anlık |
| L2: Hızlı  | Gemini Flash             | < 1 saniye   |
| L3: Orta   | Claude Sonnet            | 5-10 saniye  |
| L4: Derin  | Claude Opus / Deep Think | 30-60 saniye |
| L5: Görsel | Nano Banana / Whisk      | 10-30 saniye |
| L6: Video  | Veo 3.1 / Gemini Omni    | 1-5 dakika   |
| L7: UI     | Stitch                   | 5-20 saniye  |

---

## 7. Maliyet Optimizasyonu

### Mevcut Harcama

| Kategori       | Aylık    | Yıllık     |
| -------------- | -------- | ---------- |
| Google Ultra   | $30      | $360       |
| Claude Pro     | $20      | $240       |
| ChatGPT Plus   | $20      | $240       |
| GitHub Copilot | $10      | $120       |
| Vercel Pro     | $20      | $240       |
| Supabase Pro   | $25      | $300       |
| **TOPLAM**     | **$125** | **$1,500** |

### Optimizasyon Önerileri

| #                              | Öneri              | Tasarruf         | Sebep                               |
| ------------------------------ | ------------------ | ---------------- | ----------------------------------- |
| 1                              | ChatGPT Plus iptal | $20/ay           | Gemini Ultra zaten yeterli          |
| 2                              | Copilot Free'e geç | $10/ay           | 2000 completion/ay ücretsiz yeterli |
| 3                              | Claude API'ye geç  | ~$5-10/ay        | Abonelik yerine kullanım başına öde |
| **Toplam Potansiyel Tasarruf** | **$35-40/ay**      | **$420-480/yıl** |

### Optimize Durum

| Kategori            | Aylık         |
| ------------------- | ------------- |
| Google Ultra        | $30           |
| Claude Pro veya API | $10-20        |
| Vercel Pro          | $20           |
| Supabase Pro        | $25           |
| **TOPLAM**          | **$85-95/ay** |

---

## 8. Uygulama Aşamaları

> Takvim yoktur. Her aşama bir önceki tamamlanınca başlar. Ajan kesintisiz çalışır.

### Aşama 1: Temel Otomasyon (Sıradaki)

- [ ] Stitch API key al, opencode.json'a MCP ekle
- [ ] GitHub Actions CI/CD pipeline kur (test + lint + typecheck + build)
- [ ] Slack/Discord webhook ekle (cron başarısızlıklarında bildirim)
- [ ] E2E test pipeline'a ekle (Playwright)

### Aşama 2: 360° Admin Panel

- [ ] Health Check API'yi genişlet (tüm servisler)
- [ ] Service Status Grid component'i oluştur
- [ ] Cron Job Monitor component'i oluştur
- [ ] Real-time Cost Dashboard component'i oluştur
- [ ] Integration Health Map component'i oluştur
- [ ] Mock data kaldır, gerçek API'lere bağla

### Aşama 3: AI Entegrasyonları

- [ ] Gemini Flash API'yi autopilot moderasyonuna ekle
- [ ] Gemini Pro'yu cross-audit engine'e ekle
- [ ] Stitch ile admin panel UI'larını yeniden tasarla
- [ ] Whisk/Nano Banana ile sosyal medya görsellerini otomatikleştir
- [ ] NotebookLM ile döküman analizini otomatikleştir

### Aşama 4: İleri Otomasyon

- [ ] DB backup otomasyonu (Supabase API)
- [ ] Dependabot/Renovate ile dependency güncelleme
- [ ] Lighthouse CI ile performans takibi
- [ ] Veo 3.1 ile tutorial video serisi oluştur

### Aşama 5: Sürekli İyileştirme

- [ ] Monitör metrikleri topla
- [ ] Darboğazları tespit et
- [ ] Yeni Google araçlarını entegre et (Gemini Spark, Flow Tools)
- [ ] Maliyet optimizasyonunu sürekli değerlendir

---

## 9. Başarı Metrikleri

| Metrik             | Mevcut              | Hedef                                       |
| ------------------ | ------------------- | ------------------------------------------- |
| Otomasyon Seviyesi | %88                 | %100                                        |
| Kaynak Verimliliği | %33                 | %85                                         |
| CI/CD              | Yok                 | Her push'ta test + lint + typecheck + build |
| Anlık Bildirim     | Yok                 | Tüm cron hataları anında bildirim           |
| E2E Test           | Yok                 | Her deploy'da otomatik test                 |
| Admin Panel        | Hardcoded mock data | Real-time, tüm servisler görünür            |
| UI Üretimi         | Manuel yazılım      | Stitch ile prompt'tan UI                    |
| Görsel Üretim      | Yok                 | Nano Banana/Whisk ile otomatik              |

---

## 10. Dosya Yapısı (Eklenecek/Yenilenecek)

```
src/
├── app/api/admin/
│   ├── services/status/route.ts      ← YENİ
│   ├── cron/status/route.ts          ← YENİ
│   ├── costs/realtime/route.ts       ← YENİ
│   └── env/audit/route.ts           ← YENİ
├── components/admin/
│   ├── service-status-grid.tsx       ← YENİ
│   ├── cron-monitor.tsx             ← YENİ
│   ├── realtime-cost-dashboard.tsx  ← YENİ
│   ├── integration-health-map.tsx   ← YENİ
│   ├── system-360-overview.tsx      ← GÜNCELLENECEK
│   └── system-health-chart.tsx      ← GÜNCELLENECEK
├── lib/monitoring/
│   ├── service-checker.ts           ← YENİ
│   ├── cron-tracker.ts              ← YENİ
│   └── cost-tracker.ts              ← YENİ
└── supabase/migrations/
    └── add_monitoring_tables.sql    ← YENİ

.github/workflows/
└── ci.yml                          ← YENİ (GitHub Actions)
```

---

_Bu dosya 2026-07-15 tarihinde oluşturulmuştur._
