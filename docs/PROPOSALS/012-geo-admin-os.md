# Master Prompt — Claude Opus 4.8 (Architect)

Bu dosya Claude Opus 4.8'e gönderilecek prompt'u içerir. Claude bu prompt'u alır, `docs/MASTER_PLAN.md`'yi günceller ve executor'lara yeni görev dağıtır.

**Trigger prompt'lar (Antigravity, OpenCode):** `docs/MASTER_PLAN.md §10` — Executor trigger prompt'ları MASTER_PLAN.md içinde tanımlıdır, buraya kopyalanmaz.

---

```markdown
# CLAUDE OPUS 4.8 MASTER PROMPT — 360° ENTERPRISE ADMIN OS & GEO TRANSFORM

**Hedef:** ALPAR AI Admin Panelini 360° gözlemlenebilir, yönetilebilir ve GEO (Generative Engine Optimization) yeteneklerine sahip bir Enterprise Admin OS seviyesine yükseltmek.

**Talimat:** `docs/MASTER_PLAN.md` dosyasını oku ve aşağıdaki 360° Admin OS dönüşüm planını Master Plan'a ekle. **Görevleri [Antigravity] (Backend/DB/GEO/DevOps) ve [OpenCode] (Frontend/UI/i18n) yetkinliklerine göre tam olarak paylaştır.**

**⚠️ ÇAKIŞMA UYARISI:** `docs/MASTER_PLAN.md` içinde Item 129, Item 130 ve Item 132 ZATEN TANIMLI. Bu item'lere DOKUNMA. Onun yerine:

- Aşağıdaki Item 141 (`Mock Data Clean-Up`) → yeni Item 141
- Aşağıdaki Item 142 (`Admin Bugfixes`) → yeni Item 142
- Aşağıdaki Item 143 (`GEO Dashboard UI`) → yeni Item 143

Kalan item'ler (131, 133-140) zaten boş slotlara oturur.

**TIMING:**

- AŞAMA 1 → POST-LAUNCH (≥Aug 10, Aug 1-9 launch freeze boyunca autopilot durur)
- AŞAMA 2-3 → sequential, AŞAMA 1'den sonra

**EXECUTION ORDER (mevcut post-launch queue ile entegre):**
Mevcut: `109b (admin i18n) → 111 (admin IA) → 130 (DE+FR i18n) → 132 (DORA baseline) → ...`

Yeni item'ler bu sıraya yerleşir: `109b → 111 [+iOS/Android extension] → 130 → 141 (Mock Clean-Up) → 142 (Bugfixes) → 131 (GEO infra) → 143 (GEO UI) → 133 (Health) → 134 (Feature Flags) → 135 (System Pages) → 132 [backmerge DORA UI] → 138/139/140 (Polish)`

---

### AŞAMA 1 — GEÇERLİLİK, GEO & BİRLEŞİK GÖZLEM (≥Aug 10, post-launch)

- [ ] Item 141 `[Antigravity]` **Mock Data Clean-Up & Backend Linking**
      `ai-pulse/page.tsx`, `overview-dashboard-client.tsx`, `signals-client.tsx`, `slo-dashboard-client.tsx`, `audit-log-client.tsx` sahte verilerinin temizlenip gerçek Supabase sorgularına ve yeni `slo_snapshots` tablosuna bağlanması.
- [ ] Item 142 `[OpenCode]` **Admin Panel Bugfixes & i18n Cleanup**
      Providers sayfası hardcoded "Respondent" → t("respondent"), 4 eksik menünün sidebar'a eklenmesi (takedown, analysis, api-metrics, launch-signal), mükerrer `filter_all` temizliği.
- [ ] Item 131 `[Antigravity]` **GEO Database, Redis & JSON-LD Infrastructure**
      Migration `20260810000000_geo_engine_optimization.sql`: `geo_citations` ve `geo_scores` tabloları (RLS + 30 gün Auto-Prune + Rollback). Upstash Redis bot tracker (`redis.hincrby`) ve `/llms.txt`, `/llms-full.txt` (App Router route.ts). JSON-LD Schema.org generator: `src/lib/geo/jsonld.ts` — `ClaimReview` ve `Dataset` yapılarını incident sayfalarında `<head>` içine otomatik enjekte edecek yardımcı modül.
      **Capacity constraint:** Redis daily command quota tracking (Upstash FREE 10K/day limit); auto-prune via `prune_old_telemetry()` cron (Supabase 500MB DB koruması).
- [ ] Item 143 `[OpenCode]` **GEO Dashboard UI & Citation Entry Form & Bot Tracker Viz**
      `/admin/geo` arayüzü: 0-100 Ağırlıklı GEO Skoru kartı, Manuel Citation Giriş Formu, Rakip Kıyaslama Matrisi, Passage Citability İçerik Öneri Kartı. Redis bot hit sayılarının canlı grafik/gösterge olarak dashboard'a eklenmesi — AI crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) anlık trafik sayacı.
- [ ] Item 133 `[Antigravity]` **Unified System Health & Real-time Alert Engine**
      DB, API, Auth, Email, CDN, Redis, Storage, AI Gateway, Cron durumlarının `audit_log` + `sla_alarms` uyarılama motoruyla birleştirilmesi ($0 ek maliyet).

---

### AŞAMA 2 — SİSTEM YÖNETİMİ & DORA (≥Aug 10, AŞAMA 1 sonrası)

- [ ] Item 134 `[Antigravity]` **Feature Flags Backend & Upstash Redis Cache**
      `feature_flags` veritabanı yapısını Upstash Redis 0ms Edge-level cache katmanına bağlama.
      **NOTE:** Cost Router scope from Item 91 Wave 1 triage merges here; do NOT duplicate.
- [ ] Item 135 `[OpenCode]` **System Management Pages (`/admin/settings`, `/admin/feature-flags`, `/admin/crons`)**
      Genel Ayarlar, Feature Flags UI, Cron Job Yönetimi (`trigger_cron_job` tetikleyici) ve Sistem Topoloji Görsel Haritası.
- [ ] Item 136 `[Antigravity]` **DORA Elite DevOps Telemetry & UI**
      `VERCEL_BEARER_TOKEN` ile Vercel REST API üzerinden Deployment Frequency, Lead Time, Change Failure Rate ve MTTR metriklerinin hesaplanması. Admin panelde görselleştirilmesi: grafikler + Elite/High/Medium/Low badge.
      **NOTE:** Bu item mevcut Item 132 (DORA baseline) ile BİRLEŞTİRİLİR — ayrı madde değil, 132'nin kapsam genişletmesi.
- [ ] `[Item 111 extension — OpenCode]` **iOS / Android Design System Components**
      `MetricWidget`, `QuickActionGrid`, `SlideOverPanel`, `SegmentedControl`, `SkeletonLoader` üretimi ve Moderation Queue, Users, Audit sayfalarının kart/widget mimarisine dönüştürülmesi.
      **NOTE:** Bağımsız item değil — mevcut Item 111 (admin IA + visual overhaul) kapsamına eklenir. Item 111'in acceptance criterion'una şu satır eklenir: "iOS/Android Design System bileşenleri admin boyunca kullanıldı."

---

### AŞAMA 3 — POLISHING & ADVANCED MANAGEMENT (AŞAMA 2 sonrası)

- [ ] Item 138 `[OpenCode]` **System Log Viewer & Cache Management UI**
      Log görüntüleme panosu ve Redis/CDN cache temizleme arayüzü.
- [ ] Item 139 `[OpenCode]` **Email Template Previewer & Legal Document Versioning**
      E-posta şablon düzenleyicisi ve KVKK/Gizlilik yasal döküman sürüm geçmişi.
- [ ] Item 140 `[Antigravity]` **Final Quality Gate & Production Deploy**
      `pnpm lint && pnpm typecheck && pnpm test` doğrulaması + Vercel Production Deploy (`[deploy]`).

---

**CONTINGENCY RULES (Her item için fallback stratejisi):**

- Item başarısız olursa: `git revert HEAD` ile geri al, başarısızlık nedenini logla, bir sonraki ⬜ item'e geç.
- Auto-Prune tetiklenmezse: manuel `DELETE FROM geo_citations WHERE created_at < NOW() - INTERVAL '30 days'` çalıştır.
- Redis quota aşılırsa (FREE 10K/gün): bot tracking'i disable et, citation metriklerini Supabase tablosuna yaz (DB fallback).
- GEO migration RLS policy başarısız olursa: `-- ROLLBACK:` bloğunu çalıştır, policy'yi yeniden yaz, test ile doğrula.
- DORA API token expire olursa: `docs/METHODOLOGY_AUDITS/` altına manual metric kaydı yap, token'ı yenile.
- JSON-LD generator hata verirse: `<head>` içine enjeksiyonu disable et, GEO skorunu hesaplamaya devam et (cite yoksa skor 0 olur, kabul edilebilir).
- Vercel deploy başarısız olursa: `[deploy]` marker olmadan push etme, deploy log'unu kontrol et, retry.
- i18n key eksik olursa: EN fallback kullan, TR key'i `messages/tr.json`'a ekle, build'i block etme.
- Supabase 500MB DB limit aşılırsa: `prune_old_telemetry()` cron'u manuel çalıştır, eski audit_log + geo_citations kayıtlarını temizle.

**Yapman Gereken:**

1. `docs/MASTER_PLAN.md` dosyasını oku.
2. Bu görev dağılımını `[Antigravity]` ve `[OpenCode]` etiketleriyle `docs/MASTER_PLAN.md`'ye ekle.
3. Mevcut Item 129/130/132'ye DOKUNMA — yeni item'leri 131, 133-143 slotlarına yerleştir.
4. Item 111'i iOS/Android bileşenleriyle genişlet.
5. Mevcut Item 132'ye DORA UI görselleştirmesini ekle (Item 136 backend + UI merged).
6. Güncellenmiş planı `request_feedback: true` ile sun.
```
