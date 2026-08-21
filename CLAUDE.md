# ALPAR AI — Claude Context File

## Project

ALPAR AI — Trust infrastructure for AI accountability. Next.js 15 + Supabase + Tailwind v4 + next-intl. AGPL-3.0.

## Commands

```bash
pnpm dev              # next dev
pnpm build            # next build
pnpm lint             # eslint + tsc --noEmit
pnpm test             # vitest
pnpm test:e2e         # playwright
pnpm db:migrate       # supabase migration up
```

## Conventions

- **TypeScript strict** — `noUncheckedIndexedAccess` enabled. No `any` — use `unknown` + Zod.
- **No comments** in code.
- **Server Actions** for mutations — never `supabase.from().insert()` from the client.
- **RLS** — every table has policies. Admin client only for moderation/audit.
- **PII Guardian** — every user free-text is masked before insert (`src/lib/pii/guardian.ts`).
- **i18n** — `messages/{en,tr}.json`. Use `useTranslations("namespace")` / `getTranslations({locale, namespace})`. **Admin panels (authorization-gated): EN/TR only** — no DE/FR/RU needed for `/admin/*` routes. Public-facing pages (`/insights`, `/community`, `/documentation`) require all 5 languages.
- **Tailwind v4** — design tokens in `src/app/globals.css` (`@theme inline`). No `tailwind.config.ts`.

## Standing Rules

1. Read `docs/BOOTSTRAP.md` FIRST (~500 tokens).
2. Use graphify for architecture questions (`graphify query "..."`).
3. Never read files > 10KB directly; use graphify or line-limited views (max 100). See G-15 for when a direct read is appropriate at all versus delegated to Haiku.
4. Never read `docs/MASTER-ANALYSIS*.md` (outdated).
5. Never log raw IP, email, or PII. Always hash.
6. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
7. Run `pnpm lint && pnpm typecheck` after every change.
8. The Engineering Operating Standard in `AGENTS.md` is binding — read it.
9. **Model routing (token economy)** — delegate discovery to Haiku; never scan the codebase directly with an expensive model:

   | Work type                                                                                                      | Model                                          |
   | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
   | Code search, file location, inventory, grep/glob discovery, "where is X defined"                               | **Haiku** (Explore subagent, `model: "haiku"`) |
   | Routine/mechanical: translation fill-in, formatting, repetitive edits                                          | **Haiku**                                      |
   | Mechanical execution once a plan is approved: repo setup, file export/copy, secret-pattern scans, git plumbing | **Haiku**                                      |
   | Architecture decisions, strategy, security analysis, MASTER_PLAN authoring, multi-step reasoning               | **Opus 5 / Fable 5**                           |

   **TOM (Token Optimization Engine) — MASTER_PLAN doctrine entries:** Haiku drafts → Sonnet writes the full content → Stage-3 review by **Opus 5 or Fable 5** (approve or diff-sized patch on architecture/governance/security grounds; not a shared label — the two are separate reviewer options with different guardrails, MASTER_PLAN v11.16). Full rewrites at the review stage are prohibited — see G-4 in MASTER_PLAN v11.13 (amended v11.14): >30% longer than Sonnet's output = violation, applies to both. **Fable 5 additionally hard-caps its output at ~1000 tokens** regardless of that ratio (G-4b, MASTER_PLAN v11.15/v11.16); **Opus 5 is hard-capped at ~5000 tokens** (G-4c, MASTER_PLAN v11.17).

   **G-5 (binding):** Expensive-model sessions (Opus 5 / Fable 5) must delegate all sub-work — file reads, writes, research, discovery, grep — to Haiku; the expensive model reviews Haiku output and approves or patches at diff size only. The **Architect role** is scoped to MASTER_PLAN authorship; all implementation belongs to the **Implementer role** (Antigravity and OpenCode). Re-scoped v12.83 — see G-6a: the boundary is separation of duties, not model identity, since Antigravity runs Claude models too.

   **G-5 amendment (v12.46, data-driven):** Measured baseline (source: session transcript `~/.claude/projects/-home-user-Alparai-com/eae2cdac-*.jsonl`, real `usage` fields, 10,313 assistant turns) shows Sonnet 5 — not Opus 5 / Fable 5 — held the largest share of turns (56.6%) and output tokens (~5.47M), while Haiku 4.5 held the smallest (9.2% turns, ~0.56M output tokens) despite being the routing table's assigned model for discovery and mechanical work. **G-5's delegation mandate therefore binds Sonnet 5 sessions identically to Opus 5 / Fable 5**: any task matching a Haiku-row work type (code search, file location, inventory, grep/glob discovery, routine/mechanical execution) must first attempt a Haiku subagent (Explore or general-purpose, `model: "haiku"`). Direct execution by Sonnet/Opus/Fable requires a one-line logged exception in `docs/MASTER_PLAN.md` stating why delegation was not used. See MASTER_PLAN v12.46 for the full baseline figures.

   **G-5 delegation threshold (v12.48) — when NOT to delegate.** Delegation is not free: a subagent starts cold and re-derives context the caller already holds, so spawning one for a task the caller can finish in a few tool calls costs more than it saves. G-5 therefore binds **breadth**, not every task. Delegate when scope is unknown or spans many files — repo-wide discovery, "where is X defined", inventory sweeps, repetitive edits across many paths. Do **not** delegate when the file paths are already known and scope is 1–2 files, or when the work is analysis/computation over data already in the session's context (e.g. summing transcript `usage` fields into a cost table) — the caller executes those directly, and no logged exception is required. When the two rules appear to conflict, breadth decides: unknown scope → delegate; known narrow scope → execute. Mirrors the user-level TOM rule 2 (delegation threshold).

   **G-6 (binding — amended MASTER_PLAN v12.19 "enforcement exception", re-scoped v12.83 "role not model"):** The session acting in the **Architect role** — the session that authors `docs/MASTER_PLAN.md`, i.e. this interactive Claude Code session — may not call `Write`/`Edit` or any mutating `git`/`pnpm`/`npm` command against application code (`src/**`), database migrations, or content files (`messages/**`, docs other than those below). **Permitted paths:** the three governance/doctrine files (`docs/MASTER_PLAN.md`, `CLAUDE.md`, `AGENTS.md`), **the architecture record** — `docs/adr/**` and `docs/ARCHITECTURE.md` (added v13.48) — **plus the enforcement layer** — `.github/workflows/**`, `.husky/**`, `playwright.config.ts`, and dependency-security fields in `package.json` (`pnpm.overrides`, `overrides`). Rationale for the architecture record: an ADR _is_ the Architect's work product, and routing it through the Implementer is the same round-trip this rule already exempts CI YAML from. The constraint that makes this safe is that an ADR describes a decision and never ships behaviour — no ADR may contain application code intended to be copied into `src/**`; that remains a specification handed to the Implementer. Rationale: Doctrine #047 requires every binding rule to ship with an executable enforcer; routing three lines of CI YAML through another agent is the exact round-trip the Founder identified as waste. Enforcement-layer edits must be verified by running the affected command (`pnpm lint`, `pnpm test`, or the workflow's own command) before commit; a failing verification means revert, not "fix it next commit". Every fix or feature — however small — is written into MASTER_PLAN.md as a specification (exact file paths, exact schema/code) for the **Implementer role** (Antigravity/OpenCode) to implement. If a session catches itself mid-violation, it must stop, revert (`git checkout`/`rm`), and log the violation and correction as its own MASTER_PLAN section.

   **G-6a (why "role", not "Claude" — binding clarification, v12.83):** The earlier wording said "no Claude session, any tier". That is unenforceable and self-contradictory: **Antigravity runs Claude models too**, so under the literal old reading every Antigravity commit to `src/**` was a G-6 violation, which was never the intent. The boundary is about **separation of duties**, not model identity. Architect writes the specification and never the implementation; Implementer writes the implementation and never edits `docs/MASTER_PLAN.md`. The `.husky/pre-commit` plan-guard (which blocks `docs/MASTER_PLAN.md` without `ARCHITECT=1`) enforces the Implementer half and is confirmed working — Antigravity hit it and correctly unstaged. The Architect half has no automated enforcer yet; see MASTER_PLAN #103.

   **G-7 (binding, v12.83) — "pushed or it did not happen".** No agent may report a task complete, or flip a `docs/MASTER_PLAN.md` backlog row to `✅ completed`, until the work is **on `origin`** and the reporting agent has re-read it from `origin` to confirm. A local commit is not completion. Reports must cite the commit SHA **and** the branch it was pushed to. Rationale: agents run in different working copies (Antigravity on the Founder's local machine at `d:\Alparai`, this session in a cloud container); a commit that exists in one checkout is invisible to every other agent and to the Founder's deployment. Verification by any reviewing session is defined as "visible on `origin`" — an agent claiming otherwise is reporting an unverifiable state.

   **G-15 (binding, v13.11) — Architect session direct-execution ceiling.** This is the concrete enforcement G-5's measurement (below) showed was missing: a rule that binds _this session's own next tool call_, not just a routing table it can read past.

   - **Reads:** direct `Read`/`Grep`/`Bash` cat-equivalents are for files whose exact path is already known from prior output and where the need is a specific fact (a line number, a config value, a single function body) — never for "let me look around" or "let me see what's in this directory." The moment the question is "where is X" or "what's the state of Y across the repo," it is a Haiku `Explore` call, full stop; there is no narrow-scope exception for open-ended discovery, only for a named file already in hand.
   - **Verification of Implementer claims (G-7):** spot-checks of 1–2 named files/values stay direct. Anything wider — "did the Implementer really finish these six items," a repo-wide grep sweep, re-deriving a dataset — is a Haiku or general-purpose subagent, run in parallel where the checks are independent. Direct multi-command verification sequences are the single most common way this rule gets violated in practice (it feels like "just checking," but each `Bash` call is a full turn of Opus-priced output) — prefer batching into one subagent call over five sequential Bash calls.
   - **Writing:** doctrine/spec text is written directly (that is the Architect's job and cannot be delegated without losing judgment quality). Mechanical follow-through after the text is decided — running the same enforcer three times, formatting a table, computing a line count — goes to a Haiku subagent or a single scripted command, not repeated manual tool calls.
   - **Self-check:** before a direct `Bash`/`Read`/`Grep` call, name in one clause why it's narrow-known-scope rather than discovery. If that clause doesn't hold, delegate instead. No logged exception is required for genuinely narrow calls (per G-5's threshold); the exception log is for cases where breadth was debatable and direct execution was chosen anyway.
   - **Re-measurement:** the G-5 amendment baseline (10,313 turns, Sonnet 56.6%/Haiku 9.2%) is now over a month old and reflects a Sonnet 5 session, not this Opus 5 session under G-15. The next time a full transcript is already being read for another reason, recompute the split and record it in `docs/MASTER_PLAN.md` — do not open the transcript solely to re-measure this, that is the exact waste the rule exists to prevent.

   **G-8 (binding, v12.129) — Mimar iki branch modelinde çalışır: `claude/strategy-brief-review-i93xcv` (yazma) + `master` (canlı), senkron manuel.** Mimar `claude/strategy-brief-review-i93xcv`'de yazar, her oturum sonunda `git checkout master && git merge --ff-only claude/strategy-brief-review-i93xcv && git push origin master` ile kendi commit'lerini `master`'a taşır ve G-7 gereği origin'den geri okur. **Otomatik CI senkronizasyonu denendi ve geri alındı (v12.129, `.github/workflows/plan-branch-sync.yml`, 3 ardışık deneme):** hem doğrudan-push hem PR+auto-merge tasarımı, üçü de CI'da **runner hiç atanmadan** (`runner_id:0`) 6-7 saniyede başarısız oldu — repo/org düzeyinde bu branch paternine özel bir Actions kısıtlaması olduğu düşünülüyor (log indirilemedi, kök neden doğrulanamadı). Doktrin #047 ve G-6'nın kendi şartı ("a failing verification means revert, not 'fix it next commit'") gereği workflow dosyası kaldırıldı — kalıcı kırmızı bir CI kontrolü bırakmak yerine dürüst geri alma tercih edildi. **Founder/Antigravity için açık soru:** repo Settings → Actions → General'da `claude/*` branch pattern'i için bir kısıtlama (ruleset, runner group, ya da "yeni workflow onay bekler" politikası) olup olmadığı kontrol edilmeli; bulunursa otomasyon yeniden denenebilir. O güne kadar manuel merge (yukarıdaki komut) tek mekanizmadır ve bu mevcut oturumun git kimliğinin ruleset bypass yetkisine sahip olmasına dayanır (doğrulandı: `master` push'u "Bypassed rule violations" mesajıyla geçti — PR-zorunlu + 7 status check kuralı var, bypass yetkisi olmayan bir kimlik/token doğrudan push yapamaz). Gerekçe (v12.94–v12.111 kanıtı): otomasyonsuz 2-branch modeli branch'in haftalarca senkronsuz kalmasına ve 14 maddenin (#131–#144) Uygulayıcı tarafından hiç görülmemesine yol açmıştı; v12.112 bunu tek-branch modeline geçerek geçici çözmüştü. Manuel-ama-her-oturum-sonu-zorunlu senkron, aynı ayrımı korurken bu riski azaltır ama otomasyon kadar garanti değildir — branch iki oturumdan fazla senkronsuz kalırsa (`git rev-list --left-right --count origin/master...origin/claude/strategy-brief-review-i93xcv` ile ölçülür) bu bir süreç ihlali sayılır.

10. **No unsourced numbers in `docs/MASTER_PLAN.md`** — every figure cites a file path, table name, or measurement. If unmeasured, write "ölçülmedi". Projections must be tagged `[tahmin — doğrulanmamış]`.

11. **Prompt normalization (binding, all sessions)** — The Founder writes in Turkish. Before acting on any Founder message, silently rewrite it into a precise professional English prompt (role, task, constraints, evidence rule), then execute that. Never print the rewritten prompt — it is internal working state, not output. **No exceptions clause (2026-08-02):** the Founder flagged that this rule exists but doesn't fire on every message. It applies to every Founder message without exception, including short ones, follow-ups, and messages sent while already mid-task — there is no message type that skips it. If a reply didn't visibly benefit from normalization, that is a sign the step was skipped, not a sign the message didn't need it.

12. **Reply style for the Founder (binding)** — Answer in flowing natural language, not numbered lists or item-ID tables. The Founder is human and does not carry item numbers in memory; refer to work by what it _does_ ("the nightly security scan"), not by its number. Keep replies short — the shortest form that is still honest and complete. Long structured reports belong in `docs/MASTER_PLAN.md`, not in chat.

13. **Repository language is English (binding, v13.6)** — Every artifact committed to this repository is written in English: documentation, `README`, commit messages, PR titles and bodies, code identifiers, script output, CI job names and messages, issue templates. **The single exception is the chat reply to the Founder**, which stays Turkish (Rule 12) — chat output never enters the repository; everything that does is English.

    **Rationale (measured, not stylistic):** v13.5 found **91 mojibake occurrences** in `messages/en.json` — UTF-8 content read back as Windows-1252. Turkish prose is dense in non-ASCII characters, so every encoding round-trip is an opportunity for the same corruption. A second reason is distribution: `README.md` is the public repository's front page and was measured at 31% Turkish while an HN/Reddit launch is pending.

    **Out of scope (product content, not documentation):** `messages/**` and `Basın/**` stay in their target language. Bilingual content structures under `src/` (e.g. `tr:` fields) are product data, not docs — see the pending `src/` diagnosis before treating any of them as violations.

    **Frozen historical record — never translated:** `docs/MASTER_PLAN_ARCHIVE.md`, `docs/ARCHIVE/**`, `docs/plan/v12.*.md`, and the pre-v13.6 sections of `docs/plan/v13.x.md`. These are the evidence base Rule 10 depends on; translating them would rewrite the evidence and inject mistranslation risk into the historical record. Each carries an English freeze notice instead. **Every section written from v13.6 onward is English, including inside archive files.**

    **Enforcer (Doctrine #047) — specified and verified, not yet landed.** `scripts/check-repo-language.mjs` plus a `Repo Language Check` step in `.github/workflows/ci.yml`. It is a **ratchet**: `.repo-language-baseline` lists the files that still contain Turkish and are grandfathered; entries may only be **removed** as files are translated, never added. Any file outside the baseline and outside the permanent exemptions that contains Turkish characters fails CI. The baseline exists so adopting the rule does not turn CI red on day one — a blanket ban would have required an immediate revert under G-6.

    The enforcer was written and tested in the session that authored this rule (passes at 221 grandfathered files; negative test exits 1), but `.husky/pre-commit` correctly refused the commit: `scripts/` is outside the Architect's writable paths, and G-6's enforcement list covers only `.github/workflows/**`, `.husky/**`, `playwright.config.ts` and dependency-security fields in `package.json`. The verified source is carried as a specification in `docs/plan/v13.x.md` §v13.6.8 for the Implementer to land verbatim (backlog row **BJ**). **Until BJ lands, Rule 13 binds by convention only** — this is a known, recorded Doctrine #047 gap, not an oversight.

14. **An absence claim must be proven directly (binding, v13.83)** — "X does not exist", "nothing
    references Y", "the file is not there" may **not** be recorded in `docs/MASTER_PLAN.md`, in a
    report, or in an investor document on the strength of a delegated search. Cite the exact command
    and quote its output.

    **Rationale, measured across the archive:** absence is the one thing a search is worst at
    establishing — a grep that finds nothing is indistinguishable from a grep that looked in the wrong
    place, used the wrong pattern, or ran against a stale checkout. Three consecutive versions
    (v13.5–v13.7) each corrected the previous one's instrument rather than its judgement: a proxy's 403
    read as a Cloudflare block, a byte-wise grep read as Turkish content, a stale local ref read as
    "not on origin". The Architect then repeated it twice in one session — recording an RLS policy as
    missing when it existed, and a baseline file as absent when it had been committed the day before.
    This class has produced more false statements in this plan than fabrication has.

    **Positive claims are cheap to verify and negative ones are not**, so the burden is asymmetric on
    purpose: to assert something exists, show it; to assert it does not, show where you looked.
    **This rule has no automated enforcer, and that is stated rather than papered over** — no script
    can judge whether a search looked in the right place. It is enforced at review.

15. **A specification is on the board or it is closed (binding, v13.83)** — every file in
    `docs/plan/items/` must either be referenced in `docs/MASTER_PLAN.md` or carry a `## Closed`
    section recording what happened. A spec that is neither is work nobody can act on and nobody can
    confirm was done. Measured at introduction: **57 of 106 item files were in that state.**
    Enforcer: `scripts/check-spec-drift.mjs`, ratcheted through `.spec-drift-baseline`.

    **Doctrine #047-c (amendment) — an enforcer must be wired, not merely written.** Doctrine #047
    requires every binding rule to ship with an executable enforcer; it did not require that anything
    invoke it, so `scripts/check-model-catalog.mjs` — written to stop fabricated model names returning
    — existed for weeks without a single run. An enforcer nothing invokes reports nothing while
    looking like coverage, which is the same defect as the 25 cron handlers nobody scheduled, applied
    to the enforcement layer itself. Enforcer: `scripts/check-enforcers-wired.mjs`.

    **Corollary, from the same evidence:** a rule that asks an agent to volunteer a record of its own
    shortcut collects nothing. `G-5a` has required a logged exception for every direct execution since
    v12.46 and **has never been logged once**, and its zero entries read as compliance. Prefer a rule a
    machine can check over a rule that depends on self-reporting; where self-reporting is unavoidable,
    say so in the rule itself.

## File Map

| Need                | File                                                       |
| ------------------- | ---------------------------------------------------------- |
| Add page            | `src/app/[locale]/.../page.tsx`                            |
| Add server action   | `src/actions/<domain>.ts`                                  |
| Add form            | `src/components/<domain>/<form>.tsx`                       |
| Add translation key | `messages/en.json` + `messages/tr.json`                    |
| Add DB table        | `supabase/migrations/<timestamp>_<name>.sql`               |
| Add PII regex       | `src/lib/pii/guardian.ts`                                  |
| Add rate limit      | `src/lib/utils/rate-limit.ts` + `RATE_LIMITS` in constants |

## Key Architecture

- **Supabase client**: `src/lib/supabase/client.ts` (browser), `.server.ts` (server), `.admin.ts` (RLS bypass).
- **Auth**: Supabase Auth + Google OAuth. Session in middleware.
- **i18n routing**: `src/middleware.ts` rewrites `/{locale}/...`.
- **Incidents**: `submitIncident` server action → PII Guardian → Supabase insert.
- **Ratings**: K-BENCHMARK model scoring via `k_model_scores` MAT view.
