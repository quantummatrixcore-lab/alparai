# MBS Supreme — Kalıcı Context Dökümanı

> Master Brain Supreme — Agent-OS içinde kalıcı orchestration katmanı
> Fable 5'ten bağımsız, Memory MCP + .bridge üzerinden çalışır

---

## 1. Identity & Scope

MBS bir **AI değil**, bir **orchestration protokolüdür** (OEGP v2.0).

- OpenCode + Claude Code ikilisini yöneten karar katmanı
- Engine routing, sub-agent delegasyonu, skill yükleme, silo izolasyonu
- **Hiçbir kod yazmaz** — yalnızca yönlendirir, doğrular, karar verir

## 2. Engine Routing (OEGP v2.0)

| Sinyal               | Motorlar                           |
| -------------------- | ---------------------------------- |
| Kod üretimi/düzeltme | `hephaestus` → `tcsfl` → `omega`   |
| Güvenlik             | `sentinel` → `opalgate` → `ethics` |
| Mimari karar         | `strategist` → `council` → `mv`    |
| Bilgi arama          | `oracle` → `vector` → `tartarus`   |
| Otonom döngü         | `omniauto` → `kairos` → `chronos`  |
| Token/maliyet        | `atlas` → `srg`                    |
| Dil (Türkçe)         | `babel`                            |
| Entegrasyon          | `nexus`                            |
| Etik/ESG             | `ethics` → `esg`                   |

## 3. Sub-agent Delegasyon Protokolü

| Soru Tipi                | Delege                                 | Araçlar                   |
| ------------------------ | -------------------------------------- | ------------------------- |
| Dar arama ("where is X") | `@scout`                               | grep, glob, read          |
| Açık uçlu keşif          | `@explore`                             | grep + glob + read + task |
| Çok dosyalı refactor     | `@senior-developer`                    | read + edit + write       |
| Kod review/security      | `@code-reviewer` / `@security-auditor` | read-only                 |
| Browser test             | `@browser-agent`                       | playwright                |
| Ağır kod (Claude)        | `ClaudeBridge`                         | claude CLI via .bridge/   |
| Hızlı routing            | `build` agent (OpenCode varsayılanı)   | full tools                |

## 4. Skill Management

| Skill              | Ne Zaman Yüklenir             |
| ------------------ | ----------------------------- |
| `advanced-debug`   | Bug, crash, "doesn't work"    |
| `tdd`              | Yeni feature, regression test |
| `frontend-design`  | UI/UX/styling/a11y            |
| `mcp-builder`      | MCP server/tool               |
| `architect`        | Mimari karar, trade-off       |
| `explore-codebase` | Yeni repo, yapı keşfi         |
| `write-docs`       | Dokümantasyon                 |
| `git-release`      | Release, version              |
| `code-review`      | PR review                     |
| `prime-context`    | Karmaşık görev öncesi         |

## 5. Alparai Projesi — Wave Modeli

### Wave 1 (şu an aktif)

| Madde                | Durum                     | Atanan               |
| -------------------- | ------------------------- | -------------------- |
| ✅ Health 2→8        | **TAMAM**                 | OpenCode             |
| ✅ Env Audit         | **TAMAM**                 | OpenCode             |
| ✅ Vault             | **TAMAM**                 | OpenCode             |
| ✅ Marketing Agents  | **TAMAM**                 | OpenCode             |
| ✅ Sentinel Scanner  | **TAMAM** (kod beklemede) | Sub-agent → OpenCode |
| 🔴 Cost Router T0-T4 | **BEKLİYOR**              | OpenCode             |
| 🔴 Engine Registry   | **BEKLİYOR**              | OpenCode             |
| 🔴 Cron Monitor API  | **BEKLİYOR**              | OpenCode             |

### Wave 2 (sonraki)

| Madde                   | Not                  |
| ----------------------- | -------------------- |
| Dashboard Login Logging | Admin panele entegre |
| Antigravity Safety      | Madde 90 öncelikli   |
| Roadmap Panel           | Madde 89             |

### Wave 3

| Madde                     | Not          |
| ------------------------- | ------------ |
| Spark Agent               | Engelsiz kod |
| LinkedIn/News Generator   | Engelsiz kod |
| SLA Monitor               | Engelsiz kod |
| Thread Safety (autopilot) | Engelsiz kod |
| Nexus MCP Server          | Engelsiz kod |

## 6. Silo İzolasyon Kuralları (Kural #14)

- ❌ Agent-OS ile ALPAR arasında **ortak veritabanı yok**
- ❌ Agent-OS'tan ALPAR'a **döngüsel bağımlılık yok**
- ✅ Pattern copy (kod kopyalama) serbest
- ✅ MCP protokolü ile iletişim serbest
- ✅ Env var bridge (`.env` prefix) serbest
- ✅ `.bridge/` IPC dizini üzerinden dosya alışverişi serbest

## 7. Bridge: OpenCode ↔ Claude Code

```
┌─────────────────┐         ┌─────────────────┐
│   OpenCode       │         │   Claude Code    │
│   (orchestrator) │         │   (executor)     │
│   Gemini Flash   │         │   Claude Sonnet 4│
├─────────────────┤         ├─────────────────┤
│   .bridge/tasks/ │ ──────→ │ .bridge/active.md│
│   (task JSON)    │         │ (reads prompt)   │
│                  │ ←────── │ .bridge/results/ │
│   pollForResult  │         │ (writes output)  │
└─────────────────┘         └─────────────────┘
```

### Kullanım:

```typescript
import { defaultBridge } from "@/lib/bridge/claude-bridge";

const result = await defaultBridge.delegate({
  type: "refactor",
  priority: "high",
  title: "Add kill switch to SocialPublisher",
  instructions: "...",
  context: { files: ["src/agents/marketing/social_publisher.ts"] },
  expectedOutput: "Modified file path + summary",
});
```

## 8. Kural #14 İhlal Geçmişi

| #   | Tarih      | İhlal                    | Durum           |
| --- | ---------- | ------------------------ | --------------- |
| 1-6 | (önceki)   | Plansız commit'ler       | Çözüldü         |
| 7   | 2026-07-15 | MBS dosyası plansız push | Fable 5 uyarısı |

## 9. Bağlı MCP Servisleri

- `memory` — Oturumlar arası state
- `sequential-thinking` — Karar zincirleri
- `gh_grep` — GitHub kod arama
- `fetch` / `context7` — Dökümantasyon
- `github` — PR/repo yönetimi
- `playwright` / `opencrhome` — Browser test

---

_Son güncelleme: 2026-07-16 | Kaynak: Agent-OS (OpenCode) | Fable 5'ten bağımsızdır_
