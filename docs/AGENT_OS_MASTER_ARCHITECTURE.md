# 👑 ALPAR AI & AGENT-OS MASTER PLAN (V3.0 - GROK 4 INTEGRATED)

**Prensip:** Yapay Zeka Hesap Verilebilirlik & Güven Altyapısı (AI Accountability & Trust Infrastructure)  
**Motto:** "When an AI lies to you — who is accountable?"  
**Model Konsensüsü:** Grok 4 (Chief Strategy Officer), Qwen (Sovereign Architect), OpenCode Wolf Pack (DeepSeek, Nemotron, Laguna, MiMo).

---

## 🚀 1. GÖZDEN GEÇİRİLMİŞ STOK & REVOLUTION STRATEJİSİ

### A. Marka ve Domain Stratejisi

- **Mevcut Durum:** `alparai.com` projenin ana omurgası ve vitrinidir.
- **Grok 4 Marka Kararı:** Projenin B2B Sigorta/Risk bacağını veya küresel lansmanını güçlendirmek için defansif olarak **TruthGuard.ai** veya **WatchdogAI** domain varyasyonları değerlendirilecek.

### B. Veri Monetizasyonu (371 Belgelenmiş AI İhlali Verisi)

- **ALP Risk API / Actuarial Feed:** Sigorta şirketlerine (Lloyd’s, Munich Re vb.) "AI Risk Rating Score" ve "Model Failure Severity Index" veri akışı satışı.
- **Enterprise Risk Dashboard:** Kurumların kendi kullandıkları modellerin hata ve kriz geçmişini izlediği B2B SaaS paneli.
- **AB AI Act & ISO 42001 Uyum Paketi:** Şirketlerin AI regülasyonlarına uyumunu kanıtlayan otomatik audit raporlaması.

---

## 🏛️ 2. AGENT-OS MASTER ARCHITECTURE (12 MODÜL VE YENİ REVİZYONLAR)

Grok 4 ve OpenCode modellerinden gelen sert eleştiriler doğrultusunda revize edilen 12-Modül Altyapısı:

### M-01 · 🐺 SÜRÜ (WOLF PACK) YÖNETİM MERKEZİ (İCRA EDİLDİ)

- **Supabase Realtime Event Bus:** `0001_agent_os_core.sql` ile `tasks` ve `heartbeats` tabloları canlıya alındı.
- **Asenkron Haberleşme:** Ajanlar DB event-driven uyanır, birbirini bloklamaz.

### M-02 · 🧠 HAFIZA VE SKILL DEPOSU (REVERSED)

- **Laguna S 2.1 Revizyonu:** HTML okumak yerine CDP üzerinden **Network (XHR/Fetch) JSON Interception** mimarisine geçilecek. Element değişse de JSON API değişmez!

### M-03 · 🌐 GOOGLE EKOSİSTEMİ VE OTONOM KOTA ROTASYONU

- Router: AI Studio Free -> Groq Free -> OpenRouter Free.
- Python Sandbox: GitHub Actions (Free 2000 dk) üzerinde izole çalıştırılır.

### M-04 · 🕵️ AVCI AJAN — SAVUNMA AMAÇLI SİBER GÜVENLİK

- CVE/NVD ve GitHub Advisories otonom izlenir. Kendi bağımlılıklarımız için otonom PR açılır.

### M-05 · ⚡ AUTO-KILL VE WARM WORKER POOL

- **Nemotron 3.5 Lightning Revizyonu:** Ajanları her seferinde sıfırdan öldürmek soğuk başlama (Cold-Start) gecikmesi yaratır. Ajanlar 2 adet hazırda bekleyen **"Warm Pool"** worker'ında uyutulacak.

### M-06 · 🎨 CLAUDE UI & KANBAN EXECUTION BOARD

- **Grok 4 UX Revizyonu:** Admin panelinde `master-plan-client.tsx` üzerine Drag-and-Drop (@dnd-kit) ile kart sürükleyip statü değiştirme ve Priority (P0 > P1 > P2) sıralaması eklenecek.

### M-07 · 🚀 CI/CD SAVAŞ HATTI

- GitHub Actions CI (Jest/Playwright) geçmeyen kod asla main'e merge edilmez. Revert mekanizması aktiftir.

### M-08 · 💰 FİNANS, BÜTÇE VE STRIPE (İCRA EDİLDİ)

- `cost_log` ve `system_flags` (`HARD_STOP_PAID_API`) kuruldu. $5 harcama aşıldığı an paid API kilitlenir.

### M-09 · 🛡️ CLOUDFLARE WAF VE BYPASS HEADER

- **Nemotron Lightning Revizyonu:** Cloudflare "Under Attack" modu tetiklendiğinde yerel CDP botlarımızın kilitlenmemesi için CDP isteklerine `X-Sovereign-Swarm-Auth` bypass header'ı tanımlanacak.

### M-10 · 👑 KİMLİK VE PR OTOMASYONU

- Sürü içerik üretir (LinkedIn/Press), yayınlama %100 Kurucu (Ercüment Erden) onayındadır.

### M-11 · 🌩️ VERCEL EDGE DAĞITIMI

- Preview otomatik, Production deploy tag-based insan onaylıdır.

### M-12 · ⚠️ BAŞMÜHENDİS YIKICI UYUM KURALLARI

- **Nemotron 3 Ultra (Enterprise Warning):** CDP tabanlı sıfır maliyetli scraping iç Ar-Ge içindir. Müşteriye B2B satılacak olan TruthScore motoru, yasal VPC içi API'ler (AWS Bedrock) üzerinden çalışacaktır.

### M-13 · ⚡ PROMPT ENGINE & META-COGNITION ROUTER (YENİ)

- **Görünmez İçsel Derleme:** Kullanıcı girdilerini otomatik olarak Opus/Flash seviyesi profesyonel İngilizce komutlara çeviren arka plan katmanı.
- **Dinamik Rota Başlığı:** Tüm aksiyonların başında `⚡ Rota: engine_tom → prompt_engine → engine_strategist | MCP: none | Mode: swarm` formatıyla transparan süreç takibi.
- **Token Ekonomisi:** Maximum semantik yoğunluk, sıfır dolgu metni (filler). Bağlam sıkıştırma (context compression) ve özyinelemeli budama (recursive pruning) ile maliyet optimizasyonu.
- **Swarm Delegasyonu:** Kritik `high/critical` kompleksite görevlerinde `Fatih`, `Sinan`, `Atatürk`, `Cezeri` ve `Picasso` gibi dijital ikizlerin otonom devreye girmesi.

---

## 🎯 60 GÜNLÜK İCRA YOL HARİTASI (EXECUTION ROADMAP)

- `[x]` **Faz 1: Veritabanı & Mimari Temel (Tamamlandı)** -> Supabase M-01 & M-08 SQL şeması yazıldı.
- `[ ]` **Faz 2: Grok UX İyileştirmeleri (Sıradaki Adım)** -> Admin Paneli Kanban tahtasına Drag-and-Drop ve Status güncelleme endpoint'i eklenmesi.
- `[ ]` **Faz 3: Browser Extension (Growth Lever)** -> ChatGPT/Claude/Grok kullanırken tek tıkla "AI İhlali Bildir" eklentisi.
- `[ ]` **Faz 4: ALP Risk API Alpha (Monetization)** -> 371 yayımlanmış ihlalin sigorta/risk skorlama algoritmasına dönüştürülmesi.
