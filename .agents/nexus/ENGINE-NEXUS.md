# ⚙️ ENGINE-NEXUS — The Autonomous Tools Doctrine

> **[CORE DIRECTIVE]** This document dictates how worker agents (Frontend, Backend, LLM) utilize the 34 Autonomous Engines within the Sovereign Zenith ecosystem.
> **RESTRICTED COMPLIANCE:** You MUST NEVER request access to the `Agent-Os-Ortak/engines` directory. Your tools are already cloned to your local `.engines/` folder.

---

## 1. 🧰 THE TOOLBOX PROTOCOL

As an agent, you have a local `.engines/` directory inside your workspace. This directory contains `.ts` or `.json` files that define powerful AI tools and algorithms.

- **Do not modify** the files inside `.engines/`. They are synchronized automatically by MBP via `scripts/sync-engines.mjs`.
- **To add a new engine:** Create a file in `D:\Agent-Os-Ortak\engines\` and run `node scripts/sync-engines.mjs`.

---

## 2. 🏛️ ENGINE REGISTRY — 34 Engines

The engines are defined as JSON files in `engines/` and synchronized to all worker repos. Current fleet:

|  #  | Key         | Name                                  | Status | Domain                          |
| :-: | :---------- | :------------------------------------ | :----: | :------------------------------ |
| 01  | TOM         | The Omni Mind                         |   🟢   | Model routing & gating          |
| 02  | RPE         | Reward Policy Engine                  |   🟢   | IQ mutation & agent scoring     |
| 03  | TCSFL       | Tactical Command & Synergy Flow Logic |   🟢   | Multi-agent orchestration       |
| 04  | CORE        | Sovereign Infrastructure Core         |   🟢   | Bootstrap & lifecycle           |
| 05  | MOMENTUM    | Velocity & Execution Engine           |   🟢   | Task throughput optimization    |
| 06  | MV          | Mental Vision                         |   🟢   | Model insight & analysis        |
| 07  | TARTARUS    | Deep Memory Vault                     |   🟢   | Vector search & episodic memory |
| 08  | SENTINEL    | Security & Guardrails                 |   🟢   | Content filtering & safety      |
| 09  | ATLAS       | Resource & Budget Governor            |   🟢   | Token budget enforcement        |
| 10  | NEXUS       | Event Bus & Integration Hub           |   🟢   | Real-time message bus           |
| 11  | PROMETHEUS  | Observability Engine                  |   🟢   | Metrics & monitoring            |
| 12  | CHRONOS     | Temporal Scheduler                    |   🟢   | Cron & heartbeat coordination   |
| 13  | OMEGA       | Final Validation Layer                |   🟢   | QA & output verification        |
| 14  | KAIROS      | Adaptive Intelligence                 |   🟢   | Opportunity detection           |
| 15  | ORACLE      | Knowledge Retrieval Engine            |   🟢   | Long-term knowledge             |
| 16  | HEPHAESTUS  | Code Forge                            |   🟢   | Code generation & repair        |
| 17  | GAIA        | Infrastructure Interface              |   🟢   | Hardware & cloud                |
| 18  | VECTOR      | Semantic Context Engine               |   🟢   | RAG & embedding                 |
| 19  | COUNCIL     | Consensus & Governance                |   🟢   | Multi-agent voting              |
| 20  | SRG         | Sovereign Resource Governor           |   🟢   | Resource quotas                 |
| 21  | BABEL       | Cross-Language Bridge                 |   🟢   | Neural translation              |
| 22  | OMNIAUTO    | Autonomous Autopilot                  |   🟢   | Self-healing                    |
| 23  | ZENITHINTEL | Executive Intelligence                |   🟢   | C-suite briefings               |
| 24  | MCPHUB      | Model Context Protocol Hub            |   🟡   | MCP integration                 |
| 25  | OPALGATE    | Auth & API Gateway                    |   🟢   | JWT & RBAC                      |
| 26  | STRATEGIST  | Strategic Foresight Engine            |   🟢   | Market scenarios                |
| 27  | ETHICS      | Alignment & Governance                |   🟢   | Ethical policies                |
| 28  | LOGISTICS   | Neural Asset Logistics                |   🟢   | Supply chain                    |
| 29  | INTEL       | Cyber-Intelligence Engine             |   🟢   | Threat intelligence             |
| 30  | ESG         | Sustainability Engine                 |   🟢   | ESG reporting                   |
| 31  | IPLAW       | Intellectual Property Engine          |   🟢   | Patent analysis                 |
| 32  | VENTURE     | Portfolio Intelligence Engine         |   🟢   | VC evaluation                   |
| 33  | ZENITH      | Sovereign Orchestration Master        |   🟢   | Apex coordinator                |
| 34  | HUNTER      | Neural Market Discovery               |   🟢   | Market scanning                 |

**Live status:** 33/34 healthy — MCP-HUB degraded (MCP_HUB_URL not configured)

---

## 3. 🛠️ ENGINE LIFE-CYCLE

1.  **Wake-up Call** → Agent boots and reads `.engines/` on start.
2.  **Capability Negotiation** → Agent registers with the Nexus Engine (ENG-10).
3.  **Task Dispatch** → TCSFL (ENG-03) routes tasks to the optimal engine.
4.  **Execution** → Engine processes the task and returns a result.
5.  **Audit + IQ Adjust** → Omega (ENG-13) validates output; RPE (ENG-02) mutates IQ.

---

## 4. 🔗 HOW AGENTS USE ENGINES

Agents interact with engines via the **Nexus Event Bus (ENG-10)**:

```typescript
// Example: Agent requests a security audit
const result = await nexus.emit("engine.request", {
  targetEngine: "ENG-08", // SENTINEL
  payload: { code: sourceCode, mode: "full_audit" },
});
```

---

## 5. 🚫 RESTRICTIONS

- ❌ **No direct HTTP calls** to engine endpoints — always use the Nexus Bus.
- ❌ **No modifying** `.engines/` contents — they are synced from Ortak.
- ✅ **Yes, creating** new engines in `D:\Agent-Os-Ortak\engines\` — then run `node scripts/sync-engines.mjs`.

---

_ENGINE-NEXUS | V42.0.0 | 34_ENGINES_REGISTERED_
