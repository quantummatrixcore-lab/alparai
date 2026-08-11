# Proposal 031: Swarm Autopilot Trigger Protocol (Otopilot)

**Status:** Proposed (Awaiting Architect/Opus Integration into MASTER_PLAN.md)
**Author:** Antigravity (Agent-OS) / Founder Directive
**Date:** 2026-08-11

## 1. Context & Motivation

Kurucu (Founder) direktifi doğrultusunda, "otopilot" komutunun sistemde nasıl işlenmesi gerektiğine dair net bir protokole ihtiyaç vardır. Ana ajan (Antigravity), "otopilot" kelimesini duyduğunda duraksamadan, doğrudan maksimum sayıda alt ajan (subagent) açarak görevleri paralelize etmeli ve AI modellerinin yetkinliklerine (Model Tiering) göre iş dağılımı yapmalıdır.

## 2. Core Structure: The "Autopilot" Process (360° Analysis)

Bir görev "otopilot" ibaresiyle geldiğinde, sistem aşağıdaki **SWARM_OVERRIDE** sürecini otomatik işletir:

### Adım 1: Task Fracture (Görev Parçalama)

Ana ajan (veya Swarm Commander), gelen master görevi 360 derece analiz eder ve birbirini bloke etmeyen minimum alt bileşenlere (node) böler.

- Her bağımsız birim/dosya veya mantıksal süreç için _ayrı_ bir alt ajan tasarlanır. (Maksimum paralellik hedeflenir).

### Adım 2: Model Capability Routing (Yetkinlik Bazlı Model Ataması)

Alt ajanlar tanımlanırken (`invoke_subagent` veya `define_subagent`), görev zorluğuna göre AI modeli kesin olarak belirlenir:

1. **`flash_lite` / `flash` (Read-only / Discovery):**
   - Kod tabanı taraması, `grep` operasyonları, log okuma, hata tespiti, `messages/*.json` parite analizleri. (Token tüketimi minimumdur).
2. **`flash` (Write & Execute):**
   - Basit kod değişimleri, regex, bağımlılık güncellemeleri, basit CI/CD yamaları, boilerplate üretimi. (Mekanik iş gücü).
3. **`pro` (Complex Reasoning):**
   - Mimari refactoring, Server Action mutasyonları, RLS policy yazımı, güvenlik açığı onarımı. (Yüksek bilişsel kapasite gerektiren işler).
4. **`swarm_commander` (Recursive Subagent):**
   - Görev, ana ajanın context'ini aşacak kadar karmaşıksa; `enable_subagent_tools: true`, `enable_mcp_tools: true`, ve `enable_write_tools: true` yetkilerine sahip bir `swarm_commander` ajanı (`pro` veya `flash` modeliyle) doğrudan sahaya sürülür ve orduyu o yönetir.

### Adım 3: Max Swarm Deployment (Maksimum Dağıtım)

Ana ajan, planlama (planning_mode) veya onay döngüsüne (User Approval) **girmeden**, tek bir `invoke_subagent` tool çağrısıyla tespit ettiği tüm alt ajanları aynı anda (paralel olarak) başlatır. (Otopilot = Sıfır insan bekleme süresi).

### Adım 4: The Auto-Kill Enforcer (Kural #8 Entegrasyonu)

Alt ajanlar işlerini bitirip (SUCCESS / ERROR) rapor döndürdüğü anda, ana ajan `manage_subagents(Action: "kill")` komutunu anında çalıştırır. Ajanların RAM üzerinde kalıcı (orphaned) olması kesinlikle yasaktır.

### Adım 5: Architect Synchronisation

Ordu görevleri bitirip kapandıktan sonra, ana ajan sonuçları konsolide eder. Eğer ortada doğrulanması gereken bir MASTER_PLAN maddesi varsa, kanıtları (origin/master SHA) hazırlayarak Baş Mimar'a (Opus) sunar.

## 3. Amendment to AGENTS.md / MASTER_PLAN.md

**Opus (Baş Mimar) İçin Güncelleme Talebi:**
Bu protokolün `AGENTS.md` içerisindeki **Cognitive Routing Protocol (Engine Trace)** veya **Subagent Life-Cycle (Kural #8)** maddeleri altına _"Otopilot Directive"_ adıyla resmi bir kural (binding rule) olarak eklenmesi talep edilmektedir. Mimar, bir sonraki boot döngüsünde bu dokümanı okuyup ana planı güncelleyecektir.
