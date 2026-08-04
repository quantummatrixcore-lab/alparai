# Reddit Launch Drafts (Scheduled: August 2, 2026)

---

## 1. Subreddit: r/selfhosted & r/opensource

**Title:** Show HN / Self-Hosted: ALPAR AI – Open-source trust infrastructure for tracking AI incidents and hallucinations (Next.js 15 + Supabase)

Hi everyone!

We just launched **ALPAR AI** (https://alparai.com) — an open-source (AGPL-3.0) platform designed to audit and catalog AI hallucinations, data leaks, and compliance gaps.

As AI models are increasingly integrated into production apps, we wanted to build a transparent registry to document real-time AI issues, track provider responses, and calculate empirical Trust Scores.

### 🛠️ Tech Stack:

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Database & Auth:** Supabase (PostgreSQL) with row-level security (RLS)
- **Styling:** TailwindCSS v4
- **Localization:** next-intl (Full English + Turkish support)

### 🔒 Key Features:

- **PII Guardian:** Client-side regex engine that hashes and masks PII (emails, names, credentials) before database insertion.
- **EU AI Act Tracker:** Grouping incidents according to the EU AI Act risk tiers (High Risk, Limited Risk, etc.) with legal response tickers.
- **Embeddable Widgets:** Clean iframe embed for each incident page so developers can link to verified bugs in their documentation.

We are live today with **408 curated incidents** and **59 registered providers**. You can host it yourself, contribute to the repo, or report cases on the main site.

- **Main site:** https://alparai.com
- **GitHub Repository:** https://github.com/quantummatrixcore-lab/Alparai.com

We'd love to hear your feedback on the architecture, RLS setup, and how we handle PII masking!

---

## 2. Subreddit: r/turkishDevs

**Başlık:** Yerli & Açık Kaynak: ALPAR AI – Yapay Zeka Hatalarını İzleme ve Güven Altyapısı (Next.js 15 + Supabase)

Merhabalar,

Bugün yayına aldığımız **ALPAR AI** (https://alparai.com) projesini sizlerle paylaşmak istiyoruz. Proje tamamen açık kaynak kodlu (AGPL-3.0) olup yapay zeka modellerinin (ChatGPT, Gemini, Claude vb.) ürettiği canlı hataları, veri sızıntılarını ve güvenlik ihlallerini belgeleyen bir güven altyapısıdır.

### 🚀 Stack:

- Next.js 15 + React 19 + Tailwind v4
- Supabase (PostgreSQL RLS)
- next-intl i18n entegrasyonu (TR ve EN tam destekli)

### ⚙️ Öne Çıkan Mühendislik Detayları:

- **PII Guardian:** Kullanıcıların girdiği metinlerdeki hassas kişisel verileri (KVT) veritabanına ulaşmadan önce maskeleyen/gizleyen regex modülü.
- **EU AI Act:** AB Yapay Zeka Yasası'na (Madde 73) uygun olarak olayların risk seviyelerine göre sınıflandırılması.
- **Embed:** Her bir olayın bağımsız web sitelerinde iframe ile gömülebilmesi.

Lansman günümüzde veritabanımızda **408 olay** ve **59 yapay zeka sağlayıcısı** yer almaktadır. Katkıda bulunmak, kodu incelemek veya yıldızlamak isterseniz GitHub linkimiz:

- **GitHub:** https://github.com/quantummatrixcore-lab/Alparai.com
- **Web:** https://alparai.com

Geri bildirimlerinizi ve katkılarınızı heyecanla bekliyoruz!
