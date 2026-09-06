# 🏛️ ALPAR AI PROJECT CONSTITUTION & ZERO-DEFECT PROTOCOL

> **Status:** ACTIVE & MANDATORY  
> **Authority:** Atatürk Supreme Commander & Multi-Agent Swarm Orchestrator  
> **Enforcement Gate:** `scripts/guardian.js` + Git Pre-Commit Hooks + Vercel Build Pipeline

---

## 🛑 BÖLÜM 1: KESİNLİKLE YASAKLANMIŞ OPERASYONLAR (FORBIDDEN OPERATIONS)

1. **İmmutable Translation Sözlüğü:**
   - `messages/en.json` ve `messages/tr.json` dosyaları asla kısmi veya geçici olarak silinemez, ezilemez.
   - Her iki sözlük de minimum **80 üst seviye ad alanı (namespace)** ve **3.000 derin çeviri anahtarı** barındırmak zorundadır.
   - Bu sınırın altına düşen hiçbir değişiklik commit edilemez veya deploy edilemez.

2. **Sıfır Sahte Veri (Zero-Mock Production Policy):**
   - `src/app/` ve `src/components/` altında canlı ortamda `inc-demo-`, `prov-1`, `seed-0` gibi sahte ID'ler ve statik listeler kullanılamaz.
   - Bir veritabanı veya API sorgusu başarısız olduğunda veya boş döndüğünde, ekrana uydurma veri basılamaz (`as unknown as IncidentListItem[]` yasaktır); sistem dürüstçe boş liste (`[]`) veya `EmptyState` bileşeni göstermelidir.

3. **Yinelenen Olay (Duplicate Incident) Yasağı:**
   - Veritabanı seviyesinde `UNIQUE(title_en, ai_provider_id)` kuralı zorunludur. Aynı olay aynı sağlayıcıya iki kez eklenemez.
   - RSS veya haber scraper'larında deduplication (özet ve başlık parmak izi) zorunludur.

4. **Metodoloji - Kod Birebirlik İlkesi (Methodology-Code Parity):**
   - `/methodology` sayfasında açıklanan TrustScore formülü ile veritabanındaki `provider_leaderboard` SQL view formülü matematiksel olarak birebir aynı olmalıdır.

---

## 🛡️ BÖLÜM 2: ZORUNLU KALİTE KAPILARI (MANDATORY GATES)

| Kapı | Çalıştırılan Komut | Açıklama |
|---|---|---|
| **Guardian Gate** | `node scripts/guardian.js` | Kod tabanında sahte veri, kırık i18n veya etiketsiz SQL arar. |
| **Translation Contract** | `npm test -- tests/contracts/translation-integrity.test.ts` | Sözlüklerin bütünlüğünü ve kritik anahtarların varlığını denetler. |
| **CI/CD Build Guard** | `npm run build` (`npm run guard && next build`) | Vercel üzerinde build başlamadan önce Guardian otomatik çalışır. |

---

## ⚡ BÖLÜM 3: OTONOM SWARM VE AJAN ÇALIŞMA KURALLARI

1. **Dosya Kapsamı (File Scope Isolation):**
   - Paralel çalışan ajanlar birbirlerinin dosyalarını asla ezemez. Her alt ajan sadece kendi görev tanımındaki alt dizinlerde değişiklik yapar.
2. **RAM & OOM Koruma:**
   - Bellek sızıntılarını önlemek için eşzamanlı çalışan alt ajan sayısı kontrollü tutulur.
   - İşini bitiren alt ajanlar anında `manage_subagents(Action: "kill_all")` ile kapatılır.
3. **Kurtarma Protokolü (Disaster Recovery):**
   - Bir i18n veya veri bozulması yaşanırsa, doğrudan geçmiş commit'teki sağlam sözlük kurtarılır ve `deep merge` ile yeni anahtarlarla birleştirilir.

---

## 🎯 BÖLÜM 4: DIŞ DENETÇİ VE UZMAN DAVETİ (VERIFIED EXPERT PARTNERSHIP)

- LinkedIn veya diğer kanallardan platforma teknik eleştiri veya veri denetimi (audit) sunan uzmanlar rakip veya tehdit olarak değil, ekosistemi güçlendiren bağımsız denetçiler olarak konumlandırılır.
- Tespit ettikleri her açık, anında bu Anayasa maddelerine ve `scripts/guardian.js` kurallarına dönüştürülür.
