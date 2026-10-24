# 🤖 AGENTS.md — ALPARAI AJAN TALİMATI VE DAVRANIŞ PROTOKOLÜ

> **ZORUNLU TALİMAT:**  
> Bu depoya giren her yapay zekâ ajanı (Cursor, Claude, Copilot, Devin, Antigravity, Super-Deploy vb.) kod yazmadan, analiz yapmadan veya metin üretmeden önce **`VIZYON.md`** dosyasını okumak ve buradaki felsefeye uymak zorundadır.

---

## 1. ZİHNİYET VE STRATEJİK ÇERÇEVE (MUTLAK KURAL)
* **Kapsam Daraltma Yasağı:** AlparAI'ı ASLA sıradan bir mikro-SaaS, fatura sayacı, basit chatbot veya pasif bir DevOps log izleme/yeniden başlatma aracı olarak ele almayacaksın.
* **4 Ana Sütun Üzerinden Düşün:**
  1. **Halkın Anayasası (Şikayetvar Modeli):** Kuralları tekeller veya devletler değil; doğrudan zararı yaşayan toplumun geri bildirimi koyar. Şirketler B2B paneline ($499-$2.499) abone olarak bu krizleri çözmek zorundadır.
  2. **Runtime Governance Proxy (Cloudflare Modeli):** Model ile insan arasına giren izole RAM-içi "Epistemic Firewall" kalkanı, zararlı çıktıyı milisaniyeler içinde bloklar.
  3. **Kredi Derecelendirme Otoritesi (Moody's Modeli):** 3.115+ gerçek vaka veritabanı (Data Moat), InsurTech sigorta devlerine aktüeryal risk modeli olarak lisanslanır.
  4. **Jeopolitik Hakemlik & Unicorn Vizyonu:** ABD-Çin yarışında Türkiye merkezli bağımsız 3. hakemlik; 3. yılda $15M-$30M ARR, 5. yılda $100M+ ARR Unicorn ligi.

---

## 2. TEKNOLOJİK YIĞIN VE ÇEKİRDEK MİMARİ
* **Framework:** Next.js 16 (App Router), React 19.
* **Monorepo:** Turborepo.
* **Güvenlik & Doğrulama Katmanı:** Zod Strict Contracts, ZK (Zero-Knowledge) algoritmaları, ISO/IEC 27037 adli delil standartları.
* **Çekirdek Motorlar:**
  * **Epistemic Firewall:** Gelen/giden veriyi disk yazma maliyeti olmadan bellek içinde (Zero-GC / In-Memory) filtreleyen güvenlik katmanı.
  * **Cross-Audit Truth Pipeline:** Çoklu model konsensüsüyle halüsinasyonu teyit eden çapraz denetim.
  * **EU AI Act Engine:** Article 73 yasal mühletleri (2/10/15 günlük zorunlu bildirim) ve Annex III risk sınıflarını canlı etiketleyen hukuki telemetri radarı.
  * **W3C Incident Passport:** Tespit edilen her arızayı ISO/IEC 27037 normlarında kriptografik delil haline getiren adli sicil formatı.

---

## 3. GÜVENLİK, DORA ELITE VE GELİŞTİRME SINIRLARI
* **Port 22 Yasağı (MUTLAK):** Port 22 genel kullanıma açık ve saldırılara açık olduğu için sistem genelinde KESİNLİKLE YASAKTIR. Uzaktan bağlantılar yalnızca güvenli yüksek portlar, WireGuard Mesh VPN veya Zero-Trust ters tüneller üzerinden yürütülecektir.
* **Adli Delil Bütünlüğü:** Loglama mekanizmaları sıradan konsol çıktıları değildir; kriptografik hash zincirini bozacak hiçbir müdahaleye izin verilmez.
* **DORA Elite Disiplini:** Kök dizinde (root) çöp dosya, geçici dump veya kontrolsüz script bırakılamaz. Tüm operasyonel scriptler `scripts/` klasöründe yaşar.
* **Karakter Kodlaması (UTF-8):** Üretilen tüm dokümanlar, kodlar ve konfigürasyonlar saf UTF-8 kodlamasıyla yazılmak zorundadır (ANSI bozulması yasaktır).

---

## 4. RESMİ KADRO VE İLETİŞİM ONAYI
Herhangi bir form, başvuru, API veya dokümantasyonda kurucu ve danışman bilgileri aşağıdaki resmi format dışında yazılamaz:
* **Kurucu & Baş Mimar (CTO):** Ercüment Erden (`ercumenterden.com`) | `ercument.erden@alparai.com` | `(532) 440-83-89`
* **Hukuk & Tahkim Başkanı:** Prof. Dr. Musa Aygül (`musaaygul.com` / Selçuk Üniversitesi Hukuk Fakültesi Ticaret Hukuku Anabilim Dalı Başkanı)
* **Kamuoyu & Medya Lideri:** Ahmet Rıfat Albuz (`ahmetrifatalbuz.com`)

---

## 5. ULUSLARARASI STANDARTLAR VE GLOBAL REPO EGEMENLİĞİ (MUTLAK KURAL)
* **Kök Dizin Hijyeni (DORA & Linux Foundation Standardı):** Kök dizin (root) yalnızca uluslararası açık kaynak ve kurumsal vitrin dosyalarını (`README.md`, `README.tr.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `CITATION.cff`) barındırabilir. Tüm dahili sunumlar, başvuru metinleri, jüri notları ve operasyonel dökümler `docs/` altındaki ilgili klasörlere (`docs/grants/`, `docs/governance/`, `docs/playbooks/` vb.) taşınmak zorundadır.
* **Çift Depo & Senkronizasyon Disiplini:**
  - `quantummatrixcore-lab/alparai`: Küresel açık kaynak, yatırımcı ve bağımsız denetim vitrinidir (Public Open-Core Showcase).
  - `quantummatrixcore-lab/alparai-platform`: Üretim ve Cloudflare Pages dağıtım motorudur (Production & CI/CD).
  - Yapılan her genel vitrin ve açık çekirdek geliştirmesi `quantummatrixcore-lab/alparai` reposuna da uluslararası standartlarda yansıtılır.
* **Uluslararası Uyumluluk ve Yasal Çerçeve:**
  - **EU AI Act (Regulation 2024/1689):** Madde 73 (Ciddi Olay Bildirimi), Madde 74 ve Ek III risk sınıflandırmaları teknik ve hukuki olarak canlı tutulur.
  - **ISO/IEC 27037:** Adli bilişim delil bütünlüğü; üretilen her `IncidentPassport` SHA-256 hash zinciriyle mühürlenir.
  - **DORA (Digital Operational Resilience Act):** Finansal ve kritik yapay zekâ entegrasyonlarında ICT risk yönetimi ve sıfır kesinti protokolü uygulanır.
  - **W3C Verifiable Credentials & DID:** İhlal pasaportları uluslararası geçerlilikte doğrulanabilir kriptografik kimliklerle sunulur.
* **Çift Dilli Vitrin (Bilingual Global Standard):** Tüm uluslararası dokümantasyon İngilizce birincil (`README.md`), Türkçe ikincil (`README.tr.md`) olarak saf UTF-8 formatında hazırlanır.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
