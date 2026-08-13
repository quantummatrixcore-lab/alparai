# Agent-OS Mimarisi ve Görev Dağıtım Sistemi

ALPAR AI ekosistemi, **Otopilot & Çok Katmanlı Ajan Mimarisi (Agent-OS)** ile yönetilmektedir. Sistem; token ekonomisi, yüksek doğruluk ve sıfır-entropi prensiplerine göre 3 temel katmanda işlemektedir.

---

## 1. Mimari Katmanlar (Yerel `.agents` Mimarisi)

> **DUYURU (Ağustos 2026):** Dış, hantal Rust-tabanlı `Agent-Os` sunucusu devreden çıkarılmış, buradaki kıymetli zeka (Engine Prompts, Nexus Kuralları, Personalar) yerel dizine (`.agents/engines`, `.agents/nexus`, `.agents/personas`) taşınmıştır. Artık Agent-OS tamamen bu yerel ve hafif Node.js yapısı üzerinden işlemektedir.

### Katman 1: Mimar (Architect - Opus / Claude)
* **Rolü**: Üst düzey mimari kararlar, stratejik yönelimler ve `MASTER_PLAN.md` güncellemeleri.
* **Çalışma Modu**: Doğrudan kod yazımı veya dosya arama işlemleri yapmaz. Haiku ve alt ajanlardan gelen özet raporları inceleyerek nihai kararları verir (Karar Odaklı / Verdict-First Paradigm).

### Katman 2: Orkestratör (Orchestrator - Antigravity)
* **Rolü**: Görev koordinasyonu, Engine Router entegrasyonu, Task Manifest dağıtımı ve doğrulaması.
* **Çalışma Modu**: `routing-policy.json` kurallarına göre doğru motor zincirlerini (`pipeline chain`) belirler. Görevleri alt ajanlara atar ve işlem bittiğinde subagent RAM temizliğini (`kill_all`) gerçekleştirir.

### Katman 3: Sürü (Swarm - Free Tier Subagents)
* **Rolü**: Paralel mekanik kodlama, test yürütme, i18n doldurma ve dosya düzenlemeleri.
* **Kullanılan Modeller**: `DeepSeek V4 Flash/Pro`, `Nemotron 3 Ultra Free`, `MiMo V2.5 Free`, `Laguna S 2.1 Free`.
* **Çalışma Modu**: Sıfır ücretli token harcaması ile yüksek hızlı paralel icraat.

---

## 2. Pipeline Zincirleri (Pipeline Templates)

Agent-OS bünyesinde tanımlı varsayılan pipeline şablonları:

1. **`code_forge`**: Kod üretimi ve refactoring zinciri.
   * **Zincir**: `engine_tartarus` → `engine_hephaestus` → `engine_sentinel` → `engine_omega`
2. **`security_audit`**: Güvenlik ve RLS denetim zinciri.
   * **Zincir**: `engine_tartarus` → `engine_sentinel` → `engine_intel` → `engine_omega`
3. **`deep_research`**: Anlamsal arama ve dokümantasyon araştırması.
   * **Zincir**: `engine_oracle` → `engine_tartarus` → `engine_vector` → `engine_zenithintel`
4. **`full_360_audit`**: Kapsamlı dinamik test ve güvenlik doğrulaması.
   * **Zincir**: `engine_tartarus` → `engine_sentinel` → `engine_intel` → `engine_chaos` → `engine_hephaestus` → `engine_omega`
5. **`strategic_analysis`**: Pazar senaryoları ve stratejik yönetim brifingi.
   * **Zincir**: `engine_oracle` → `engine_strategist` → `engine_venture` → `engine_zenithintel`
6. **`prompt_optimization`**: Prompt optimizasyon ve model yetenek eşleme zinciri.
   * **Zincir**: `engine_mv` → `engine_tom`

---

## 3. Görev Bildirimi (Task Manifest Format)

Her görev, JSON formatında bir Task Manifest dosyası ile tanımlanır ve `scripts/task-dispatch.mjs` üzerinden orkestre edilir.

### Örnek Manifest (`scripts/manifests/example-task.json`)
```json
{
  "task_id": "EXAMPLE-1",
  "pipeline": "code_forge",
  "priority": "P1",
  "token_budget": 15000,
  "model": "flash",
  "files_touched": [
    "src/actions/example.ts"
  ],
  "acceptance": "pnpm test gec"
}
```

### Alan Açıklamaları
* **`task_id`**: Görevin benzersiz kimliği (örn: `FEAT-102`, `BUG-404`).
* **`pipeline`**: Çalıştırılacak engine zinciri şablon adı (`routing-policy.json` ile eşleşir).
* **`priority`**: Görev öncelik derecesi (`P0`, `P1`, `P2`).
* **`token_budget`**: Göreve tahsis edilen maksimum token bütçesi.
* **`model`**: Görev için hedeflenen model seviyesi (`flash`, `pro`, `opus`).
* **`files_touched`**: Görevin dokunacağı/değiştireceği dosya yolları.
* **`acceptance`**: Görevin tamamlandı sayılması için geçmesi gereken kabul kriteri.

---

## 4. Dağıtım Komutu (Dispatch Execution)

```bash
node scripts/task-dispatch.mjs scripts/manifests/example-task.json
```
