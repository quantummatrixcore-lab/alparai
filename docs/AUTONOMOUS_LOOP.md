# Autonomous Loop — 4-Step Operating Cycle

**Status:** Binding for the Executor (Antigravity / OpenCode) · **Source:** MASTER_PLAN v12.13, Doktrin #049, items #73–#74, Rule 39–44

This document codifies the Founder-defined 4-step autonomous cycle (MASTER_PLAN item #74). Its purpose is to remove the Architect from the routine completion path so that an expensive model is consulted only where it is the cheapest available option — never as a routine reviewer.

---

## 1. The Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  1. PUSH     Push current work to GitHub                    │
│  2. CONSULT  Architect ONLY for Rule 40 cases               │
│  3. PULL     Pull the plan the Architect pushed             │
│  4. EXECUTE  Do the tasks in the plan in order, loop to 1   │
└─────────────────────────────────────────────────────────────┘
```

### Step 1 — Push

Ship current work to GitHub via `master`. GitHub operations are Executor-owned (Rule 41): PR creation/merge, workflow triggers, artifact downloads, and Issue management are done with the working tool among the GitHub token, `gh` CLI, MCP server, or browser agent. The Founder is only surfaced one-sentence questions that require authority (payment / plan decisions).

### Step 2 — Consult (Architect, Rule 40)

The Architect is called **only** in the three cases listed in Rule 40:

1. **(a)** The Rule 39 sequence is red and the cause cannot be understood.
2. **(b)** Two rules conflict with each other.
3. **(c)** A failure class never seen before appears.

Routine "mark the item complete" is **not** an Architect job (Rule 40). If the Rule 39 sequence is green, the Executor closes the item itself with `✅ completed` and writes the evidence (command output + consumer grep result) into the item description. A routine Architect approval is a wasted escalation turn from this point on.

**Precondition (Architect-added condition, item #74):** do not reach Step 2 unless the Rule 39 sequence is green locally and the Rule 42 escalation has been exhausted when applicable. Going to Step 2 without these turns the Architect into a diagnoser, which is the most expensive usage pattern.

### Step 3 — Pull

Fetch the plan the Architect pushed to GitHub. Architect outputs are plan/doctrine updates in `docs/MASTER_PLAN.md` and its companion docs; the Executor does not invent plan content (MASTER_PLAN is Architect-only).

### Step 4 — Execute

Work the tasks in the pulled plan sequentially, then return to Step 1.

---

## 2. Rule 39 — Self-Validation Before Delivery (Prerequisite)

Before every delivery, the Executor runs the following itself and writes the result into the commit message (Rule 39):

```
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Then it performs the **claim-consumer check**: for every capability named in the item, verify with `grep` that code _consuming_ that capability exists. The acceptance criterion is indivisible: the four commands must be green **together** — alternating "pass" by letting one command break the other is forbidden (Rule 43). CI remains the single authority for the _released_ version (Rule 35, narrowed in v12.27); intermediate deliveries are closed with the local sequence.

> **Rule 39 rationale:** the existence of a produced file is not completion proof — the existence of the consumer that reads that production is the proof. (Recorded history: v12.17 model pool entered the gateway while `model-router.ts` was empty; v12.22 heartbeat was written but no router read `DEGRADED`; v12.23 the heartbeat cron broke the deployment.)

---

## 3. Rule 42 — Multi-Model Escalation (Max 5 Attempts)

If a problem is not solved in one turn, it is escalated across models in the OpenCode pool. Escalation is **role-based, not model-based**: handing the same task to different models in sequence produces the same symptom-level patches and only grows the turn count (proven by item #29).

| Turn | Role                                                         | Input given                                         | Output expected                                            |
| ---- | ------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------- |
| 1    | **Implementer** (free tier)                                  | Task spec                                           | Fix attempt + four-command output                          |
| 2    | **Diagnoser** (different model, preferably different family) | Turn 1's **failed command output** + what was tried | Root-cause hypothesis only. **Writing code is forbidden.** |
| 3    | **Implementer**                                              | Turn 2's diagnosis                                  | Fix per diagnosis                                          |
| 4    | **Independent verifier** (third model)                       | Changed diff                                        | Approval or reasoned objection                             |
| 5    | **Final attempt** (Nvidia/pro tier)                          | Summary of all previous turns                       | Either a solution or a "could not solve" report            |

### Rule 43 — Two Models Must Agree on the Diagnosis

Before a fix is applied, **two independent models must point to the same root cause.** If they disagree, neither is applied and a third model arbitrates. A diagnosis is written as cause, not symptom: "lint is failing" is not a diagnosis; "the table definition is missing in `database.ts`, so the query falls into the `never` type" is.

### Rule 44 — Attempt Ledger and the 5-Turn Cap

Every escalation turn writes to `ops/opencode-runs/`, extending the Rule 36 record (below) with:

- `attempt_no`
- `role` (`uygulayici` | `teshisci` | `dogrulayici`)
- `diagnosis` (one-sentence root cause)
- `gates` (`{ lint, typecheck, test, build }` exit codes)

**The cap is 5 turns.** If the 5th turn does not solve it, go to the Architect — but not with "it doesn't work"; with three artifacts (Rule 44):

1. The full attempt ledger.
2. Each turn's root-cause hypothesis and why it was wrong.
3. The last failed command output.

> **Rule 44 rationale:** a question that arrives with this package is one the Architect can answer in a single turn. A question without it forces the Architect into from-scratch diagnosis — the most expensive usage mode. The source of token efficiency is not going to the Architect rarely; it is going _prepared_.

The records under `ops/opencode-runs/` are **not a quality gate** — the gate is CI. They are a cost/efficiency ledger so that the free-tier share targets of Doktrin #043/#044 are measurable (Rule 36). A delegation with no record cannot be reported as "done via OpenCode"; unmeasurable savings do not count. A task that reaches the 5-turn cap must reference all these files when going to the Architect (item #73); without the records, escalation is considered not performed.

### Base record schema (Rule 36 / Doktrin #048)

Each delegation writes `<UTC-timestamp>-<task_ref>.json` under `ops/opencode-runs/`:

| Field         | Meaning                 |
| ------------- | ----------------------- |
| `model`       | Model identity used     |
| `command`     | Invoked command         |
| `exit_code`   | Process exit code       |
| `duration_ms` | Run duration in ms      |
| `git_sha`     | Commit the task ran on  |
| `task_ref`    | MASTER_PLAN item number |

Acceptance criteria for a record (item #60): file exists, `git_sha` is a commit that actually exists in the repo, and `exit_code` is populated.

---

## 4. Model Routing (from AGENTS.md)

| Work type                                                                                                      | Model                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Code search, file location, inventory, grep/glob discovery, "where is X defined"                               | **Haiku** / **DeepSeek V4 Flash Free** / **Ling-3.0-flash Free**                      |
| Routine/mechanical: translation fill-in, formatting, repetitive edits                                          | **Haiku** / **Nemotron 3 Ultra Free** / **North Mini Code Free** / **MiMo V2.5 Free** |
| Mechanical execution once a plan is approved: repo setup, file export/copy, secret-pattern scans, git plumbing | **Haiku** / **Laguna S 2.1 Free** / **GPT-OSS-120B**                                  |
| Complex coding, refactoring, Next.js Server Actions, state management                                          | **DeepSeek V4 Pro** / **Gemma-4-31B-IT** / **GLM-5.2**                                |
| Visual & Image Asset Generation                                                                                | **FLUX.1-Kontext-dev**                                                                |
| Architecture decisions, strategy, security analysis, MASTER_PLAN authoring, multi-step reasoning               | **Opus 5 / Fable 5**                                                                  |

**Allocation rule:** OpenCode calls default to **Free-tier models first** (Nemotron 3 Ultra Free, DeepSeek V4 Flash Free, Laguna S 2.1 Free, Ling-3.0-flash Free, MiMo V2.5 Free, North Mini Code Free). Heavier tasks may leverage Nvidia endpoint models (DeepSeek V4 Pro, GPT-OSS-120B, Gemma-4-31B-IT, GLM-5.2, FLUX.1-Kontext-dev). Zero paid tokens are spent on mechanical or exploration steps. Escalation turn 5 is the sanctioned point where the pro tier enters (Rule 42).

---

## 5. Source References

| Rule                                           | Location (MASTER_PLAN v12.13, Doktrin #049)                             |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Rule 39 — self-validation before delivery      | Doktrin #049, amended v12.27 (local sequence default, CI as final gate) |
| Rule 40 — Architect only in 3 cases            | Doktrin #049                                                            |
| Rule 41 — GitHub operations are Executor-owned | Doktrin #049                                                            |
| Rule 42 — role-based multi-model escalation    | Doktrin #049, added v12.34                                              |
| Rule 43 — two models must agree on diagnosis   | Doktrin #049, added v12.34                                              |
| Rule 44 — attempt ledger and 5-turn cap        | Doktrin #049, added v12.34                                              |
| Rule 36 — delegation record                    | Doktrin #048                                                            |
| 4-step cycle                                   | Item #74; item #73 (escalation schema); item #60 (record schema)        |
