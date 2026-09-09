# ALPARAI — PUBLIC AYNA ADMIN YÜZEYİ KALDIRMA VE MİMARİ ETKİ PLANI (v2.0)

> **Tarih:** 2026-09-09 | **Hazırlayan:** ErcuOS Başmimar & ATATÜRK / TESLA Ajan Birliği  
> **Kapsam:** Public aynadaki 50 backend uç noktası (12 API Rotası + 38 Server Action) ve 154 admin-yetkili desenli dosya  
> **Stratejik Amaç:** Public aynadaki yetkisiz erişim yüzeyini minimuma indirmek, admin uç noktalarını rol-kapıları (RBAC/RLS) ve iç worker/cron servisleriyle izole etmek.

---

## 1. YÖNETİCİ ÖZETİ VE ÖNCELİKLENDİRME STANDARDI

Public aynada bulunan 50 backend uç noktası (12 API Rotası + 38 Server Action) ve toplam 154 admin-yetkili desenli dosya için etki analizi yürütülmüştür.

### 📌 Öncelik Kategorileri:
- 🔴 **P0 (Mutlak Korunmalı / Temel Üretim Fonksiyonu):** Platform moderasyonu, kullanıcı yetkilendirmesi, takedown/yasal süreçler ve veri güvenliği için kritik uç noktalar. Public aynada katı `requireAdmin()` / `requireModerator()` rol kapısıyla kilitli olarak kalmalıdır.
- 🟡 **P1 (Taşınabilir / İç Servise Dönüştürülebilir):** Arka plan cron işleri, iç analizler ve otomasyonlar. Public API rotalarından çıkarılıp internal worker / cron / queue mimarisine taşınabilir.
- 🟢 **P2 (Silinebilir / Deprecated):** Çağıranı olmayan (0 caller), modüler barrel kütüklerinden bağımsız veya geçici test uç noktaları. Güvenli bir şekilde silinebilir/temizlenebilir.

---

## 2. API ROTALARI KALDIRMA VE MİMARİ ETKİ TABLOSU (12 Rota)

| Uç Nokta Yolu (`src/app/api/admin/*`) | Ne Yapar (1 Cümle) | Kaldırılırsa Ne Kırılır? (Bağımlılıklar) | Rol-Kapısı / Mimari Alternatif | Öncelik Skoru |
|---|---|---|---|---|
| `src/app/api/admin/advisor/route.ts` | Atatürk ilkeleri temelinde stratejik AI danışman yanıtı sunar. | Danışman chat UI bileşenleri ve strateji arayüzü kırılır. | `requireAdmin()` + `getCurrentUser()` yetki kapısıyla kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/app/api/admin/autopilot/route.ts` | Otonom moderasyon anlık görüntüsünü alır ve worker tetikler. | Admin Autopilot paneli (`use-admin-autopilot.ts`) ve canlı izleme kırılır. | İç cron worker döngüsüne ve Server Action'a kilitlenebilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/costs/route.ts` | Platform maliyet ve bütçe verilerini getirir. | Admin Maliyet/Bütçe widget'ları (`use-admin-benchmarks.ts`) veri alamaz. | Server Action (`getCostsData`) üzerinden doğrudan bileşene bağlanabilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/cron-monitor/route.ts` | Zamanlanmış cron işlerinin sağlık ve servis kayıt raporunu getirir. | Admin Cron İzleme paneli ve sistem durum göstergeleri kırılır. | Internal healthcheck servisi veya Server Action olarak sunulmalıdır. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/ecosystem/route.ts` | Dış ekosistem olay kuyruğu ve haber akışını sunar. | Admin Ekosistem haberleşme paneli (`use-admin-ecosystem.ts`) kırılır. | Katı RLS ve `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/app/api/admin/ecosystem-fetch/route.ts` | Dış kaynaklardan olay toplama görevini tetikler. | Manuel tetikleme butonu ve cron revalidation akışı kırılır. | Vercel Cron veya arka plan kuyruğuna (Upstash QStash) devredilebilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/env-audit/route.ts` | Maskelenmiş çevre değişkenleri denetim raporunu verir. | Admin Güvenlik ve Env denetim ekranı (`use-admin-dsar.ts`) kırılır. | Sadece CEO/Admin rolüne özel Server Action yapılabilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/integrations/route.ts` | Platform entegrasyon servisleri bağlantı durumunu listeler. | Admin Entegrasyonlar sekmesi ve servis durumu widget'ı kırılır. | Sunucu tarafı static/revalidated Server Action'a dönüştürülebilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/live-analysis/route.ts` | Canlı sistem analizi sürecini çalıştırır. | Admin Canlı Analiz tetikleyici arayüzü kırılır. | Doğrudan Server Action (`runLiveSystemAnalysis`) olarak çağrılabilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/live-cross-audit/route.ts` | Metin üzerinde canlı çapraz denetim testi çalıştırır. | Admin Çapraz Denetim test arayüzü kırılır. | Doğrudan Server Action (`runLiveCrossAuditTest`) olarak çağrılabilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/live-strategy/route.ts` | Canlı strateji analizi başlatır. | Admin Strateji değerlendirme paneli kırılır. | Doğrudan Server Action (`runLiveStrategyAnalysis`) olarak çağrılabilir. | 🟡 **P1 (Taşınabilir)** |
| `src/app/api/admin/strategy-questionnaire/route.ts` | Modeller üzerinden strateji anket değerlendirmesini tetikler. | Admin Strateji Anketi paneli kırılır. | Server Action (`runQuestionnaire`) olarak sunulabilir. | 🟡 **P1 (Taşınabilir)** |

---

## 3. SERVER ACTIONS KALDIRMA VE MİMARİ ETKİ TABLOSU (38 Aksiyon)

| Server Action Yolu (`src/actions/admin/*`) | Ne Yapar (1 Cümle) | Kaldırılırsa Ne Kırılır? (Bağımlılıklar) | Rol-Kapısı / Mimari Alternatif | Öncelik Skoru |
|---|---|---|---|---|
| `src/actions/admin/ai-orchestrator.ts` | AI güven skorları ve çapraz denetim arenası çalıştırır. | Admin Arena paneli ve `pipeline-orchestrator.ts` kırılır. | `requireAdmin()` kalkanıyla kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/analytics.ts` | Plausible ziyaretçi ve gösterim metriklerini çeker. | Admin Analiz gösterge paneli ve widget'lar kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/blackbox-analysis.ts` | Kod parçacıklarını Blackbox AI ile analiz eder. | Admin Kod Kalite Denetçisi arayüzü kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/codebase-hygiene.ts` | Kod hijyen ve tip güvenliği skorlarını hesaplar. | Admin Kod Tabanı Hijyen kartı ve metrikler kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/cross-audit-metrics.ts` | Çapraz denetim metrikleri ve AB AI Yasası uyum verisini verir. | Admin Dashboard, Uyum Raporları ve `providers.ts` kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/dual-channel-scoring.ts` | Çift kanallı güven skoru konfigürasyonunu yönetir. | Admin Skor Yapılandırma paneli kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/expert-analysis.ts` | Uzman analizi modülünü çalıştırır. | Uzman Değerlendirme paneli kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/experts.ts` | Uzman başvurularını inceler, onaylar/reddeder. | Admin Uzman Yönetim paneli (`/admin/experts`) kırılır. | `requireModerator()` + Audit Log ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/funding-conversion.ts` | Hibe ve devlet desteği başvuru dönüşüm oranlarını getirir. | Admin Finans & Hibe gösterge paneli kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/grants.ts` | Hibe başvuru durumlarını günceller. | Admin Hibe Takip paneli (`/admin/grants`) kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/import.ts` | Toplu ihlal bildirimi aktarımı (import) yapar. | Admin İhlal Aktarım paneli ve test kütükleri kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/jules.ts` | Google Jules oturum ve sağlık durumunu yönetir. | Jules Entegrasyon bileşenleri ve kayıt kütükleri kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/leaderboard-backfill.ts` | Sağlayıcı liderlik tablosunu geçmiş verilerle günceller. | Bağımsız admin script'idir (Doğrudan çağıran yok). | CLI migration veya cron task'ına dönüştürülebilir. | 🟢 **P2 (Silinebilir)** |
| `src/actions/admin/linkedin.ts` | LinkedIn kişi durumlarını günceller. | Sosyal Zeka ve İletişim panelleri kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/live-analysis.ts` | Canlı sistem analizi modülünü çalıştırır. | `api/admin/live-analysis` rotası kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/live-cross-audit.ts` | Canlı çapraz denetim testini yürütür. | `api/admin/live-cross-audit` rotası kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/live-strategy.ts` | Canlı strateji analizini yürütür. | `api/admin/live-strategy` rotası kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/master-plan.ts` | Yönetici ana planı (master plan) bilgilerini getirir. | Bağımsız admin plan gösterim bileşeni. | `requireAdmin()` ile kilitli tutulmalıdır. | 🟢 **P2 (Silinebilir)** |
| `src/actions/admin/moderation.ts` | İhlal bildirimlerini onaylar, reddeder ve filtreler. | Moderasyon panelleri, SLA cron, takedown akışları kırılır. | **KRİTİK PLATFORM BİLEŞENİ**: `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/modular-architecture.ts` | Modüler mimari bileşen durumunu getirir. | Mimari Denetim paneli. | `requireAdmin()` ile kilitli tutulmalıdır. | 🟢 **P2 (Silinebilir)** |
| `src/actions/admin/opencode-efficiency.ts` | OpenCode motor verimlilik ve token metriklerini verir. | OpenCode Verimlilik widget'ı. | `requireAdmin()` ile kilitli tutulmalıdır. | 🟢 **P2 (Silinebilir)** |
| `src/actions/admin/orchestrator.ts` | Ana orkestratör ajanı tetikler. | Marketing Orchestrator ve Cross-Audit Pipeline kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/outreach.ts` | Dış iletişim (outreach) kuyruğunu yönetir ve işler. | Outreach Cron (`api/cron/outreach`), Pitch Deck ve İletişim Botu kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/platforms.ts` | Platform kayıt durumlarını günceller. | Pazarlama ve Basın Bültenleri modülleri kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/providers.ts` | Doğrulanmış yanıtlayıcı yetkilerini düzenler. | Sağlayıcı Pasaportu, Liderlik Tablosu ve İhlal panelleri kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/public-statement.ts` | Sağlayıcı kamuya açık resmi açıklamalarını kaydeder. | İhlal Detay sayfası (`incident-detail.tsx`) ve açıklama modalı kırılır. | `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/run-bench-tr-evaluation.ts` | Türkçe LLM benchmark testini çalıştırır. | Bağımsız değerlendirme modülü. | `requireAdmin()` ile kilitli tutulmalıdır. | 🟢 **P2 (Silinebilir)** |
| `src/actions/admin/signals.ts` | Sistem alarm ve sinyal durumunu getirir. | Admin Sidebar, Sinyal hook'u ve Uyum doğrulama rotası kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/startup-health.ts` | Platform büyüme KPI'larını ve metriklerini hesaplar. | Uzman Personaları ve Büyüme gösterge paneli. | `requireModerator()` ile kilitli tutulmalıdır. | 🟡 **P1 (Taşınabilir)** |
| `src/actions/admin/takedown.ts` | İçerik kaldırma taleplerini inceler ve karara bağlar. | Yasal Haklar paneli (`/dashboard/legal`), İtiraz ve Şeffaflık sayfaları kırılır. | **KRİTİK YASAL BİLEŞEN**: `requireModerator()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/users.ts` | Kullanıcı rolünü değiştirir ve terfi ettirir. | Admin Kullanıcı Yönetimi (`/admin/users`), Onboarding ve Autopilot kırılır. | **KRİTİK GÜVENLİK BİLEŞENİ**: `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin/vendor-portal.ts` | Tedarikçi portalı metriklerini ve yanıt verilerini çeker. | Tedarikçi Portalı (`/vendor-portal`) arayüzü kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin-360-evaluation.ts` | 360 derece uzman ve sistem denetimini tetikler. | Bağımsız denetim modülü. | `requireAdmin()` ile kilitli tutulmalıdır. | 🟢 **P2 (Silinebilir)** |
| `src/actions/admin-autopilot.ts` | Autopilot moderasyon anlık görüntüsünü alır ve tetikler. | `api/admin/autopilot` ve `use-admin-autopilot.ts` kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin-question-bank.ts` | İhlallerden otomatik soru bankası üretir. | Benchmark Cron (`api/cron/benchmark`) kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin-quick-actions.ts` | Hızlı moderasyon ve bayrak aksiyonlarını yürütür. | Bağımsız hızlı aksiyon modülü. | `requireAdmin()` ile kilitli tutulmalıdır. | 🟡 **P1 (Taşınabilir)** |
| `src/actions/admin-users.ts` | Yönetici yetkisiyle yeni kullanıcı hesabı oluşturur. | Admin Kullanıcı Oluşturma ekranı (`/admin/users/page.tsx`) kırılır. | `requireAdmin()` ile kilitli tutulmalıdır. | 🔴 **P0 (Korunmalı)** |
| `src/actions/admin.ts` | Moderasyon, takedown ve kullanıcı aksiyonlarını dışa aktaran barrel dosyası. | **257 BAĞIMLI DOSYA KIRILIR**: `admin.ts` barrel kütüğüdür. | Dağıtık import'lar re-export edilmeye devam etmelidir. | 🔴 **P0 (Korunmalı)** |

---

## 4. 154 DESEN DOSYASININ MİMARİ DAĞILIMI VE YÖNETİM STRATEJİSİ

ErcuOS kapısının tespit ettiği 154 desenli dosyanın mimari katmanlara göre dağılımı:

1. **Backend Uç Noktaları (50 Dosya):** 12 API Rotası + 38 Server Action (Yukarıdaki 2. ve 3. bölümlerde detaylandırılmıştır).
2. **Yönetici Sayfaları / Page Routes (`src/app/[locale]/admin/*`, 18 Dosya):** `/admin`, `/admin/users`, `/admin/incidents`, `/admin/experts`, `/admin/grants`, `/admin/social` vb. Sayfalar Next.js middleware ve `requireAdmin()` kontrolü ile gizlidir.
3. **UI Bileşenleri (`src/components/admin/*` & `src/components/admin-core/*`, 34 Dosya):** `admin-sidebar.tsx`, `admin-topbar.tsx`, moderasyon ve analiz tabloları. Yalnızca yetkili kullanıcı oturum açtığında render edilir.
4. **Custom Hooks (`src/hooks/admin/*`, 12 Dosya):** `use-admin-stats.ts`, `use-admin-users.ts`, `use-admin-autopilot.ts` vb. Client-side SWR/React Query sarmalayıcıları.
5. **Tip Tanımları ve Mock'lar (`src/types/admin.ts`, `src/lib/admin-mock.ts`, `src/lib/supabase/admin.ts`, 8 Dosya):** Tip güvenliği ve Supabase Service Role istemcisi.
6. **Test ve Doğrulama Kütükleri (`*.test.ts`, 32 Dosya):** Otomatik test senaryoları ve entegrasyon test kütükleri.

---

## 5. FAZLANDIRILMIŞ GEÇİŞ VE TEMİZLİK YOL HARİTASI

### 🔹 Faz 1: İzolasyon & Rol-Kapısı Kilitleme (Mevcut Durum - Tamamlandı)
- Tüm 50 backend uç noktasının `getCurrentUser()`, `requireAdmin()`, `requireModerator()` veya `isAdmin()` ile rol bazlı erişim denetimine sahip olduğu teyit edilmiştir.
- Sır/secret içeren çevre değişkenleri (`.env`) veya sertifikalar kamuya açık aynaya sızdırılmamıştır.

### 🔹 Faz 2: İç Servis / Worker Dönüşümü (Gelecek Plan)
- Public HTTP API olan 11 `src/app/api/admin/*` rotası (advisor hariç), istemci tarafı bağımlılıkları azaltılarak doğrudan Server Action'lara veya arka plan cron worker'larına (`src/app/api/cron/*`) kaydırılmalıdır.
- API rotalarının public URL üzerinden doğrudan çağrılması engellenerek yalnızca internal Next.js sunucu bileşenlerinden erişim sağlanmalıdır.

### 🔹 Faz 3: Deprecated Kod Temizliği (Gelecek Plan)
- Hiçbir bağımlılığı olmayan (0 caller) `leaderboard-backfill.ts`, `master-plan.ts`, `modular-architecture.ts`, `opencode-efficiency.ts`, `run-bench-tr-evaluation.ts`, `admin-360-evaluation.ts` gibi 6 adet bağımsız analiz aksiyonu aşamalı olarak arşivlenmelidir.

---

## 6. KABUL VE KALİTE ONAYI

- [x] 50 uç nokta ve 154 desen dosyası için etki analizi çıkarıldı.
- [x] Her satır için kaldırma durumunda kırılacak bağımlılıklar ve rol-kapısı alternatifleri yazıldı.
- [x] `ADMIN_KALDIRMA_PLANI.md` kütüğü repo kökünde oluşturuldu.
- [x] `pnpm typecheck` ve `pnpm lint` %100 yeşil doğrulandı.
- [x] `AGENT_GOREV_PAKETI.md` içerisindeki Kanıt Defteri v2.0 turu için güncellendi.
