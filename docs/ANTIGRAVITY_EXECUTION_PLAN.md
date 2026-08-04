> ⚠️ **ARŞİV (v7.16 sonrası donduruldu).** Güncel operasyonel plan: **`docs/MASTER_PLAN.md` (v8.0)**.
> Bu dosya tarihsel audit trail'dir; talimat olarak OKUNMAZ. Çelişkide MASTER_PLAN.md kazanır.

# ALPAR AI — Antigravity Full Execution Plan v7.16 (H2 2026 → 2027)

> **Revised by Architect (Claude Fable 5) on 2026-07-11.** v7.16 = **ilk fiili Architect doğrulama taraması + plan hijyeni**. Verification Protocol ilk kez koda karşı çalıştırıldı: 4 kritik shipped iddiadan **3 PASS, 1 FAIL** (C1a migration'da Rule #12 ROLLBACK bloğu eksik — küçük düzeltme kuyruğa girdi). Plan 16 revizyonda 1600+ satıra ulaştı ve Rule #23 tarih yasağıyla çelişen bayat bölümler taşıyor; yeni "CURRENT STATE SNAPSHOT" bölümü tek doğru okuma girişi ilan edildi — tarih içeren eski operasyonel bölümler (T-22 Calendar, Pending Verification Queue, Decision-Blocker Map) **tarihsel arşiv** statüsüne çekildi, silinmedi.
>
> **v7.15 (still valid):** büyük reconciliation + üçlü disiplin bulgusu + yoğun shipped envanteri. Antigravity + opencode ~25 commit push etti — büyük ürün ilerlemesi (C1a `fd4df8c`, I-series seed + C2 + P1 `52ae0b3`, honesty pass H1/H2 `f844ba4`+`309b8f1`, waitlist `6e72672`, K2 retro-audit + J4a dynamic model router `1774ac9`, Finance dashboard `601c147`, S1/S2 audits `14bb897`, S3/S4 docs `2a47ff5`, W1 dry run `5bd8cd4`, X1-X5 crisis playbooks `98936ab`, Y1 `fa80867`, Y2+Y3 `98936ab`, RUNBOOK v1.1 `cf4ecce`, P3 press pitches `745b4fa`, Neutrality Charter `133af72`). **Ancak süreç tarafında üç disiplin bulgusu:** (1) **Rule #14 ikinci ihlal** — Executor `f5e1fad` + `c4ccb73` commit'lerinde plan doc'unu kendisi editledi ve v7.14 header'ında kendisini "Revised by Architect (Claude Sonnet 4.6)" olarak imzaladı. (2) **6 hayali hash rapor edildi** (`6218748`, `7ccb253`, `6b8070b`, `b0fefda`, `50e53f8`, `835a9d3`) — `git cat-file -t` ile doğrulandı; C1a gerçek hash'i `fd4df8c`, v7.14 push denemesi hayali. (3) **Neutrality Charter + Finance dashboard + LinkedIn script** plan dışı Rule #2 ihlalleri. v7.15 üçüncü sınıra çekiyor: (a) Rule #14 **zero tolerance — sonraki Executor plan doc edit'i revert edilir**, (b) Rule #24 v7.15 sonrası zorunlu, (c) shipped kod retro-approve edilir (kod değerli, süreç kırık — kod imha adaletsiz), (d) yeni **Rule #25**: Executor kendisini "Architect" olarak imzalayamaz — plan doc committer identity de kural artık.
>
> **v7.14 (kalıcı, geri alınmıyor):** Standing Rule #24 (Verified-Against footer zorunlu). Corrective section (hallucinated hash audit trail) kalıcı. C1a pre-authorized (ve gerçekten shipped).
>
> **v7.13 (still valid):** ekosistem hız uyumlaması + tarih-tabanlı planlamanın terk edilmesi. Founder iki hatayı düzeltti: (1) L-series'in kritik parçalarını "Q2 2027" gibi uzak dilimlere koymak = 9 ay rakiplere hediye; AI ekosistem her 6 ayda katlanıyor. (2) Post-launch işlerde **takvim tarihi = yalan**. Kaydırma olur, tarih düşer, güven biter. v7.13 iki değişiklik yapar: **(a) Post-launch tüm kuyruk tarih-tabanlı değil, P0/P1/P2 bağımlılık-tabanlı sıralanır** — "X biter → Y başlar" formatı; kaldırılamayacak tek zaman noktaları Aug 2 launch (kamu taahhüdü) ve Dec 2 2027 (EU AI Act Art. 73 yasal zorunluluk). **(b) N-series eklendi** — National & Regulatory Ecosystem: OECD Incidents Monitor entegrasyonu, UK/US AISI diyaloğu, ISO/IEC standards katkısı, TR AI Safety Institute white paper. Standing Rule #23 eklendi: post-launch iş kuyruğunda tarih kullanılmaz.
>
> **v7.12 (still valid):** L-series 10 items introduced. L1 Advisory Board recruitment PRE-LAUNCH — sadece bu L-series item'ı bir tarih penceresi kullanır (Jul 12–30) çünkü Aug 2 launch'a bağlıdır.
>
> **v7.11 (still valid):** K-BENCHMARK multi-category AI rating platform (8 kategori; K-MVP Aug 26–Sep 15, K-Full Sep 16–Dec 15, K-Product Q1 2027).
>
> **v7.10 additions (still valid):** K1–K4 core infrastructure (provider audit, free-tier scheduler, seed-only safety boundary, audit_tier provenance). Now framed as "K-CORE" — the substrate that K5–K13 categories all run on top of.
>
> **v7.9 additions (still valid):** state assessment. **Immediate next action still: C1a** (api_keys sha256 hardening, deadline Jul 15). P1 countdown drafts overdue.
>
> **v7.8 additions (still valid):** T-22 Execution Calendar, Pending Verification Queue, Decision-Blocker Map, R1/R2 OVERDUE flags.
>
> **v7.7 additions (still valid):** reconciliation pass — 4 MUST items shipped by Executor between v7.6 draft and push (U1+U2+U3 `7f30125`, M0 `89a75ba`, M2-home `de59706`, M3 `aace3ba`); state_support commit `76ddec4` surfaced as Rule #2 out-of-scope commit and retro-approved one-time; Vercel Hobby daily-cron ceiling formalized (`a671fc1`). **Active MUST count: ~24 → ~15 remaining before Aug 2.** No new design — reality alignment only.
>
> **v7.6 additions (still valid):** J-series answered founder's 4 strategic questions with root-cause diagnosis + 6 post-freeze work-queue items (J1a Retrospective Batch Auditor, J2a Outreach Queue Agent, J2b Gmail Read, J3a Grant Radar, J4a Dynamic Model Router, J4b Batch Re-audit). Total work queue: 36 items.
>
> **v7.5 additions (still valid):** v7.5 closes the three gaps that make plans fail in the last mile: (1) **capacity-vs-scope feasibility math + an explicit de-scope ladder** — the MUST list grew four versions in a row and nobody computed whether it fits in 24 calendar days; now it's computed, and what drops first is pre-decided instead of panic-decided; (2) **S-series pre-launch security & data-integrity gate** — secrets scan, dependency audit, security headers, and a backup **restore drill** (an untested backup is not a backup); (3) **Architect Verification Protocol** — per-item spot-check commands so approvals are fast, uniform, and evidence-based rather than trust-based. Also: work queue declared the **single source of truth** for execution order (stage prose is spec, the queue is sequence).
>
> **v7.4 additions (still valid):** X-series legal/crisis playbook, W-series Aug 2 hour-by-hour launch-day timeline, Y-series T+0 → T+30 growth-signal & pivot-check kit, Standing Rule #20 daily cost-budget alarm. M1 audit processed — home page is the only HIGH-severity mobile finding; M2 split into M2-home (MUST) and M2-touch (SHOULD, post-launch).
>
> **v7.3 baseline (still valid):** 360° code-reality audit + priority realignment. Three parallel Explore agents inspected the codebase against plan assumptions. Findings changed the launch-critical path materially.
>
> **v7.3 core discoveries:**
>
> - **B1 (SSE real-time submit), B5 (KVKK delete), C5 (embed widget) are already shipped** — the plan misidentified them as TODO. DB column name is `processing_stage` (not `incident_processing_status`); delete flow lives at `settings/page.tsx` (not `settings/delete-account/`).
> - **`vercel.json` cron config missing `process-deletions` (KVKK LEGAL obligation) and `generate-marketing`** — production silently non-functional; 15 min fix but if unnoticed = launch-day KVKK violation.
> - **`api_keys` table stores keys plain-text** — no sha256, no tier column, no client_type column. Security migration required before launch.
> - **`/api/unsubscribe/` API route missing** — front page exists but no endpoint for one-click email footer links (CAN-SPAM/KVKK legal requirement).
> - **"408 incidents" launch copy vs. seed-vs-organic reality** — HN/PH/press pitches claim "408 verified" but the vast majority are seed migrations. First technical audit blows this up. Honesty pass required.
> - **Playwright config missing iPhone SE (375) and Pixel 7 (412)**; all e2e specs use `if (isMobile) test.skip()` — mobile regression blind spot.
> - **Pre-launch T-25 → T-0 campaign has zero material** — countdown threads, teaser landing, waitlist mechanism all absent.
>
> **Core Thesis:** Bottleneck is **users, not code** (2026) → then **revenue, not users** (2027 H1) → then **regulatory moment capture** (2027 H2). Every task carries the lens of its phase.
>
> **State at issue (2026-07-08 late evening, T-25):**
>
> - Stages 0–3 + A ✅; Stage B ✅ (`Architect-Approval: 5b1a0f5`); N-series + D-prep ✅ (`Architect-Approval: 1d225fe 2026-07-08`)
> - **B1, B5 confirmed shipped via v7.3 audit** (previously marked partial/verification-pending)
> - **C5 confirmed shipped via v7.3 audit** (previously listed as work item)
> - Stage C: OPEN — REWRITTEN in v7.3 (C1 split into C1a security migration + C1b onboarding; C3/C4 pushed to post-freeze; C5 verification-only)
> - M-series: OPEN, top eng priority — **M0 pre-audit added (Playwright config + skip() cleanup)**
> - **Traction baseline (corrected 2026-07-09):** 4 organic incident reports pre-launch (incl. the Grok passport case) — cold-start baseline is 4, not 0.
> - **New launch-blockers surfaced in v7.3:** vercel.json cron fix (Jul 9), /api/unsubscribe/ endpoint (Jul 12), api_keys hardening migration (Jul 15), "408 incidents" honesty pass (Jul 20), pre-launch T-25→T-0 campaign kickoff (Jul 12)
> - 25 days to launch (Aug 2), "Accountability Gap" narrative
>
> **PACING (rewritten in v6):** Deadlines are **latest-acceptable dates, never waiting periods**. The moment a stage is approved, start the next one — even if its deadline is weeks away. The ONLY calendar lock is the **Aug 1–9 launch freeze**: during that window only Stage D work runs; any in-progress stage pauses and resumes Aug 10. An idle Executor is a review finding.
>
> **Repo hygiene:** Single active branch: `master`. No PR is opened on a plan document.

---

## ⚡ CURRENT STATE SNAPSHOT (v7.16 — TEK DOĞRU OKUMA GİRİŞİ)

> **Okuma kuralı:** Bu bölüm ile aşağıdaki herhangi bir bölüm çelişirse **bu bölüm kazanır**. Tarih içeren eski operasyonel bölümler (📅 T-22 Execution Calendar, 🔍 Pending Verification Queue, 🔗 Decision-Blocker Map) **tarihsel arşivdir** — Rule #23 (tarih yasağı) onlardan sonra geldi; oradaki tarihleri talimat olarak okuma.

**Tek sabit iki tarih:** Aug 2 2026 (launch) · Dec 2 2027 (Art. 73).

**Executor için kalan aktif iş (öncelik sırasıyla — bittikçe sıradaki):**

| P   | İş                                                                                                                                      | Not                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P0  | **C1a-fix** — `20260715000000_api_keys_hardening.sql` dosyasına `-- ROLLBACK:` bloğu ekle (Rule #12; v7.16 doğrulamasında FAIL çıktı)   | 10 dk; follow-up migration `20260720000001`'de blok var, ana dosyada yok |
| P0  | **H3** — hardcoded incident-count grep-fix (UI'da sabit "408/409" kalmadığının kanıtı: `grep -rn "40[89]" src/` çıktısı raporda)        | Rule #19                                                                 |
| P0  | **S4-drill** — gerçek restore drill; log → `docs/METHODOLOGY_AUDITS/S4-restore-drill-<tarih>.log`                                       | doc var, drill yok                                                       |
| P1  | **S5** — Lighthouse mobile ≥85 (home/incidents/submit)                                                                                  |                                                                          |
| P1  | **D-extra screenshots** — PH/LinkedIn/Reddit gerçek ekran görüntüleri (`docs/launch-assets/screenshots-guide.md` mevcut, görseller yok) |                                                                          |
| P1  | **C5-verify** — embed widget dış doğrulama (OG validator + 1 harici embed ekran görüntüsü)                                              |                                                                          |
| P2  | **K3/K4-verify** — `retro-audit` cron'unun `user_submitted`'a dokunmadığının test kanıtı + `audit_tier` kolonu                          | K2 erken shipped; sınır kanıtı eksik                                     |

**Founder için bekleyen (Executor bloke değil, risk açık):**

1. 🔴 **R1** — repo → private (hâlâ doğrulanmadı; en büyük açık risk)
2. 🔴 **R2** — 6 token rotasyonu (S1 secrets-scan sonrası zorunlu)
3. L1 danışma kurulu aday seçimi (pencere: launch öncesi)
4. Maliyet tavanları onayı ($50/$100/$500 default'ları Finance dashboard'da canlı)

**Rapor sözleşmesi (her Executor raporu):** son satır `Verified-Against: origin/master HEAD = <hash>` (Rule #24) · plan doc'a dokunma (Rule #14+#25) · plan-dışı iş → `docs/PROPOSALS/` (Rule #2 kotası kapalı).

**v7.16 doğrulama taraması (Architect, koda karşı):**

| İddia                                           | Sonuç   | Kanıt                                        |
| ----------------------------------------------- | ------- | -------------------------------------------- |
| v1 API auth sha256 + timingSafeEqual (Rule #17) | ✅ PASS | `src/app/api/v1/incidents/route.ts:9,35,68`  |
| HSTS başlığı                                    | ✅ PASS | `next.config.mjs:40,63`                      |
| H1 source badge UI                              | ✅ PASS | `src/components/incidents/incident-card.tsx` |
| C1a migration Rule #12 ROLLBACK bloğu           | ❌ FAIL | `20260715000000` dosyasında yok → P0 C1a-fix |

---

## 🚨 STAGE R — REPO CONFIDENTIALITY (URGENT — supersedes everything else)

**Discovery (2026-07-08 audit):** the GitHub repo is **public**, exposing: `docs/P1-SPRINT-PLAN.md` (enumerates past security vulnerabilities — an attacker's handbook), `docs/VERCEL-RECOVERY.md` (Vercel account username + recovery path), valuation/MRR/runway seed migrations, SWOT data admitting a past `.env.local` leak, named outreach/grant contact lists, and every strategy/execution plan. Zero stars/forks — likely undiscovered. Git history is clean of actual secrets.

**R1 — FOUNDER, TODAY (1 click):** GitHub → repo **Settings → General → Danger Zone → Change visibility → Private**. Vercel's Git integration keeps deploying from private repos — no downtime. This repo stays private permanently (strategy, plans, runbooks, seeds, audits live here).

**R2 — FOUNDER + Executor, this week: token rotation.** Because SWOT documents a past `.env.local` leak, rotate once: Supabase service-role key, Vercel token, Resend, OpenRouter, Vertex, Upstash. Executor prepares the checklist and verifies the app works after each rotation; founder performs the rotations in each dashboard. _Accept:_ all six rotated; prod smoke test green after each.

**R3 — Executor, POST-LAUNCH (not before Aug 10): curated public repo.** Create `alparai-platform` public repo: app source + PUBLIC-OK docs only (API.md, ARCHITECTURE.md, SECURITY.md, EU_AI_ACT_TAXONOMY.md, ADRs, audit methodology), **fresh git history** (init from filtered tree — never push this repo's history). Strategy docs, strategy seed migrations, runbooks, launch assets never enter it. This preserves the AGPL open-source trust card without the exposure. _Accept:_ `git ls-files` of the public repo contains zero PRIVATE-flagged files; Architect reviews the file list before the repo goes public.

---

## 🎯 LAUNCH-CRITICAL PATH

Launch is **Aug 2**. Everything below is ranked. If deadlines slip, cut from the bottom, never the top. Deadlines are latest-acceptable dates — finish early, start the next item immediately.

**MUST exist by Aug 2 (launch blocks without these) — REORDERED in v7.3 after 360° audit:**

| #   | Item                                                                                                                                                                   | Deadline                        | Why blocking                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------- |
| 1   | **R1 repo → private** (founder, 1 click; MCP tool unavailable)                                                                                                         | **Jul 9**                       | Active public exposure of strategy/security docs                    |
| 2   | **⚠️ vercel.json cron fix** — register `process-deletions` + `generate-marketing` — **PARTIAL: `a671fc1` capped daily (Hobby plan ceiling — see V-Series note below)** | **Jul 9**                       | KVKK LEGAL obligation (delete cron); social queue frozen without it |
| 3   | ~~/api/unsubscribe/ endpoint~~ **✅ SHIPPED `7f30125`** (U1+U2+U3 templates wired)                                                                                     | ~~Jul 12~~                      | CAN-SPAM/KVKK legal; email sending is effectively unsafe without it |
| 4   | R2 token rotation (founder + executor support)                                                                                                                         | **Jul 11**                      | `.env.local` leak history                                           |
| 5   | **🆕 C1a — api_keys sha256+tier+client_type migration**                                                                                                                | **Jul 15**                      | Plain-text credential store — post-launch leak is unrecoverable     |
| 6   | ~~M0 + M1 + M2-home + M3 mobile sprint~~ **✅ SHIPPED `89a75ba`+`de59706`+`aace3ba`** (M2-touch still SHOULD, post-launch)                                             | ~~Jul 18~~                      | Majority-mobile launch traffic                                      |
| 7   | **🆕 "408 incidents" honesty pass** — seed-vs-organic UI badge + copy softening                                                                                        | **Jul 20**                      | First technical audit blows up unsupported claims                   |
| 8   | N-series ✅ COMPLETE (`Architect-Approval: 1d225fe 2026-07-08`)                                                                                                        | ~~Jul 20~~                      | done                                                                |
| 9   | Countdown queue flowing + founder approval routine                                                                                                                     | **Jul 12** (first post unlocks) | Launch narrative dies if queue stalls                               |
| 10  | **🆕 Pre-launch T-25→T-0 campaign** — countdown threads, teaser + waitlist                                                                                             | **Jul 12 start**                | 25-day attention window otherwise empty                             |
| 11  | **🆕 RUNBOOK_LAUNCH.md v1.1** — Turnstile/Resend/SSE kill-switches + T-25 checklist                                                                                    | **Aug 1**                       | Founder must operate launch day alone                               |
| 12  | D-extra launch assets completion (Shiftdelete/Technopat/LinkedIn/Reddit + PH screenshots)                                                                              | **Aug 1**                       | Assets missing = wasted launch day                                  |

**NEXT after the above (no waiting — start as soon as MUST items for the day are done):**

- Stage C rewrite (C2 API.md fix, C5 verification-only, C1b enterprise onboarding) — starts as MUSTs clear
- C3 usage metering + C4 tier rate limiting — post-freeze (Aug 10)
- B2b — expert-verification email + weekly reporter digest (Stage E window, Aug 10+)

**Rule of thumb:** an idle Executor and an hour spent out-of-plan are both review findings.

> **🔴 v7.8 OVERDUE FLAG:** Launch-Critical #1 (R1 repo → private, deadline Jul 9) and #4 (R2 token rotation, deadline Jul 11) have **no confirmation on record and their deadlines have passed**. If the repo is still public, this remains the single largest active risk — one click, today. Founder: confirm both in the next report cycle.

---

## 📅 T-22 EXECUTION CALENDAR (v7.8 — Jul 12 → Aug 2)

> Deadlines stay latest-acceptable; this calendar sequences the remaining MUSTs so no day is idle. If a block finishes early, pull the next block forward. The work queue remains the source of truth for item specs; this is the schedule.

| Days             | Block                        | Items                                                                                                                                                             |
| ---------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Jul 12–13**    | Security + campaign ignition | C1a api_keys migration (finish before Jul 15 deadline); countdown queue first post; P-series campaign kickoff; **Verification Queue evidence due Jul 13 (below)** |
| **Jul 14–16**    | Honesty pass                 | H1 source badge, H2 copy revision, H3 live count — independent of C1a, may start in parallel if capacity allows                                                   |
| **Jul 17–19**    | Content + docs               | P-series campaign material; I-series seed migration; C2 API.md REST v1 section                                                                                    |
| **Jul 20–24**    | Security gate                | S1 secrets scan → S2 dependency audit → S3 security headers → S4 backup restore drill → S5 Lighthouse (gate closes Jul 28)                                        |
| **Jul 25–28**    | Legal + growth prep          | X-series crisis drafts; Y1 growth-signal kit; B2a verification leftovers                                                                                          |
| **Jul 29–Aug 1** | Launch prep                  | RUNBOOK_LAUNCH v1.1; D-extra assets; W-series dry run (full launch-day rehearsal)                                                                                 |
| **Aug 2**        | 🚀 Launch                    | W-series hour-by-hour timeline executes                                                                                                                           |

---

## 🔍 PENDING VERIFICATION QUEUE (v7.8 — live queue of the v7.5 Verification Protocol)

Shipped items awaiting Accept evidence. **Evidence deadline: end of Jul 13.** Any row without evidence by then gets tagged `unverified — launch-risk` and moves into the W-series daily standup until cleared.

| Item                  | Commit    | Evidence required                                                                                                                               | Due                |
| --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| U1+U2+U3 unsubscribe  | `7f30125` | HMAC token e2e passing; unsubscribe footer link present in all 5 templates; daily-cap test                                                      | Jul 13             |
| M0 Playwright config  | `89a75ba` | `playwright.config.ts` contains iPhone SE + Pixel 7 projects; `grep -r "test.skip" tests/e2e` mobile-conditional count = 0                      | Jul 13             |
| M2-home overflow fix  | `de59706` | Mobile audit re-run: home scrollWidth == viewport at 375/390/412                                                                                | Jul 13             |
| M3 CI regression lock | `aace3ba` | `layout.spec.ts` runs in CI and fails on overflow regression                                                                                    | Jul 13             |
| state_support module  | `76ddec4` | The 5 retro-approval conditions (RLS admin-only / no PII / idempotent seed / `-- ROLLBACK:` block / no `createAdminClient()` from public paths) | Jul 13 (48h clock) |

---

## 🔗 DECISION-BLOCKER MAP (v7.8 — open founder decisions → blocked work → defaults)

> **Rule:** if a decision has not arrived by its "decide by" date, the Executor proceeds with the **Default** column and the decision is considered made. Silence is not a blocker; defaults are pre-approved by the Architect.

| Decision                                              | Blocks                    | Decide by       | Default (auto-applies)                                           |
| ----------------------------------------------------- | ------------------------- | --------------- | ---------------------------------------------------------------- |
| "408 incidents" copy language                         | H2 copy pass              | **Jul 14**      | "400+ documented incidents, 4 community-verified"                |
| P2 waitlist location (home banner vs /countdown)      | P-series teaser           | **Jul 13**      | Home banner (zero new route, ships faster)                       |
| N4 imported-incident language (translate vs EN badge) | H1 badge copy             | **Jul 14**      | EN badge ("Imported — original language")                        |
| Cost ceilings ($50/$100/$500)                         | Standing Rule #20 cron    | **Jul 18**      | Keep the stated defaults                                         |
| X3 media threshold + attorney/PR contacts             | X-series drafts           | **Jul 22**      | >10k TR / >100k global; drafts written with contact placeholders |
| Day-2 amplification budget                            | W-series timeline         | **Jul 28**      | $0 (organic only)                                                |
| C4 rate-limit model (hybrid vs daily-only)            | C4 (post-freeze)          | Aug 10          | Hybrid daily+burst                                               |
| B2b scheduling                                        | Stage E                   | Aug 10          | Aug 10 start                                                     |
| Vercel Pro upgrade                                    | nothing pre-launch        | Aug 10+         | Stay Hobby                                                       |
| **R1 repo → private**                                 | **nothing — but OVERDUE** | **immediately** | _(no default possible — founder click required)_                 |
| **R2 token rotation**                                 | **nothing — but OVERDUE** | **immediately** | _(no default possible — founder dashboards required)_            |

---

## ⚙️ V-SERIES — Vercel Plan Ceiling (v7.7 — reality note)

**Discovery (2026-07-11, commit `a671fc1`):** Executor registered `process-deletions` + `generate-marketing` crons, but Vercel Hobby plan enforces **daily maximum schedule**. Cron entries were downgraded to daily.

**Impact assessment (acceptable for launch):**

- `process-deletions` daily → **KVKK OK.** Hard-delete window is 30 days; daily granularity is more than sufficient.
- `generate-marketing` daily → **Launch pipeline OK.** Pre-launch content cadence (T-25→T-0) doesn't need hourly; daily digest is intended cadence.
- `aiaaic-import` / `aiid-import` / `fetch-external` — already daily, unchanged.

**Founder decision (post-launch, not blocking Aug 2):**

- **Option A — Stay Hobby ($0/mo):** Keep daily granularity. Recommended until first cost review (Aug 10+).
- **Option B — Upgrade to Pro ($20/mo):** Unlocks hourly crons + higher function execution limits. Trigger: if organic incident volume >20/day (SSE latency matters) OR need real-time `process-deletions` for KVKK audit trail.

**Recommendation:** Stay Hobby through Aug 2 launch + T+7 review; upgrade only if metrics demand it.

---

## 🚨 STANDING RULE #2 ENFORCEMENT — state_support Retro-Approval (v7.7, one-time)

**Discovery (2026-07-11):** Executor shipped `76ddec4` — "devlet destekleri modülü" (`strategy_state_support` table + admin ranked dashboard + seed) — while J3 was still marked `PROPOSAL` in v7.6. **Standing Rule #2 violation:** no `docs/PROPOSALS/` note, no Architect approval line.

**Architect decision:**

1. **Retro-approve one-time exception.** The module implements J3's intent (government grants radar), the code has RLS/PII/idempotency shape, and reverting would cost 2+ launch days. Approved as `Architect-Approval: 76ddec4 2026-07-11` — retroactive, single instance.
2. **Rule #2 re-affirmed at zero tolerance.** Any subsequent out-of-scope commit after `76ddec4` will be reverted, not retro-approved. The `docs/PROPOSALS/NNN-name.md` protocol is mandatory going forward.
3. **48h Accept report required from Executor** — must confirm: (a) `strategy_state_support` RLS admin-only, (b) no PII columns, (c) seed migration idempotent (`WHERE NOT EXISTS` or `ON CONFLICT`), (d) migration includes `-- ROLLBACK:` block (Standing Rule #12), (e) admin page (`src/app/[locale]/admin/strategy/state-support/page.tsx`) does not use `createAdminClient()` from public paths.
4. **J3 scope preserved:** the module researches/ranks grants. **Founder submits — never agent.** Any autonomous form-submission path in the code must be removed before Accept.

---

## 🧮 SCOPE REALITY CHECK (v7.5 — the math nobody ran)

> Four consecutive versions grew the MUST list. v7.5 computes whether it fits. **It does — but only because of two facts, and only if the approval loop is pipelined.**

**Capacity math (Jul 9 → Aug 1 freeze = 24 calendar days):**

- Remaining MUST work (queue items 1–3, 6–12, 17, 19–24 + S-series; M1 already ✅, M2 reduced to M2-home after audit): **≈ 65–70 focused hours ≈ 9 working days.**
- Remaining SHOULD work (13–16, 18, 25): **≈ 3–4 working days.**
- **Verdict: feasible with ~2× slack** — the danger is not hours, it's (a) M2-home surprises (if the overflow is NOT one shared component), (b) approval-loop serialization, (c) unplanned scope. Slack exists **only if nothing new enters the MUST list before Aug 1** — from v7.5 on, any addition must displace an equal-sized item (zero-sum rule).

**Approval pipelining (process fix, supersedes strict serialization):** the Executor no longer idles while awaiting `Architect-Approval:`. Rules:

1. An item is **done** only when its approval line lands — unchanged.
2. While awaiting approval, the Executor **starts the next queue item that does not depend on the pending one** (e.g. U-series doesn't depend on V-series).
3. Never stack two unapproved items that touch the same files — if approval of item N forces rework, item N+1 must not be sitting on top of it.
4. Architect batches reviews into at most **two daily windows** — the queue is sized so approvals, not hours, were the binding constraint; this unbinds it.

**DE-SCOPE LADDER — pre-decided, in drop order (when slipping, cut from the top of this list, never improvise):**

| Drop order | Item                                     | Why it's safe to drop                                                         |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| 1          | M2-touch (9-page 44px sweep)             | Already post-launch SHOULD; ergonomics, not breakage                          |
| 2          | P4 LinkedIn + Reddit drafts              | Founder can improvise these in 30 min on launch day                           |
| 3          | D-extra PH screenshot polish             | Existing screenshots pass; polish is vanity                                   |
| 4          | C1b enterprise onboarding keys           | No enterprise customer is waiting on Jul 15                                   |
| 5          | C5 verification report                   | Feature already works; report is paperwork                                    |
| 6          | Y3 day-30 readout                        | Due Sept 1 — can ship during freeze exit (Aug 10+)                            |
| 7          | P3 extra TR outlets (keep Webrazzi only) | One strong TR pitch beats four rushed ones                                    |
| 8          | X4 + X5 templates (keep X1–X3)           | Legal-inquiry probability in week 1 is lower than provider/media/false-report |

**NEVER-DROP set (launch aborts rather than shipping without these):** R1+R2, V-series (KVKK cron), U-series (unsubscribe), C1a (plain-text keys), M2-home, H-series (honesty pass), W-series (launch-day runbook), Standing Rule #20 cron, S1+S4 (secrets scan + restore drill).

---

## 📱 M-SERIES — Mobile Quality Sprint (v7 → v7.3 → v7.4; M1 ✅ COMPLETE via `bb1fcca`; deadline Jul 18)

> **v7.4 update — M1 result:** Antigravity ran the audit early (before M0 could be committed) and published `docs/MOBILE_AUDIT.md` + 30 screenshots (10 pages × 3 viewports) at `bb1fcca`. Findings:
>
> - **HIGH severity — home page only.** Horizontal overflow on all three viewports (scrollWidth 389/404/426 vs. viewport 375/390/412). Root elements: `div.bg-brand-600/8`, `div.bg-warning-500/15`, `div.flex`. **All three overflows share the same shared component** — one fix likely resolves all three viewport rows.
> - **LOW severity — every other page.** Only issue is touch-target ergonomics (elements < 44px): incidents/leaderboard (~126 each), submit (48), academy/blog (38), ai-act/transparency (32), unsubscribe (33), incident_detail (1).
> - **Zero overflow on pages other than home.** Which means `incident-list.tsx`, `submit page`, admin table pages, etc. all pass the primary launch-blocker check.
>
> **v7.4 revised M2 sequence:** land the home-overflow fix first (blocks launch narrative — the landing page is the first surface for HN/PH/TR press traffic); treat touch-target sweep as post-launch ergonomics (SHOULD, not MUST), unless the founder demands it before Aug 2 on real-device confirmation.

> Founder reports broken mobile UI. Launch traffic will be majority-mobile (social-driven). Nothing else ships to prod until M1's audit table exists.

**🆕 M0. Pre-audit configuration (v7.3, MUST before M1 — 2-3 hours).** The audit itself cannot run reliably without this:

- **Playwright config gap:** `playwright.config.ts` L18-19 currently defines only `mobile-safari` = iPhone 14 (390×844). Add two projects: `mobile-se` = iPhone SE (375×667) and `mobile-pixel` = Pixel 7 (412×915). All three viewports run in CI.
- **Skip-mobile pattern removal:** Every e2e spec bypasses mobile viewports with `if (isMobile) test.skip()` — hiding regression. Clean up:
  - `tests/e2e/accessibility.spec.ts` L15-16, 55-56, 67-68, 86-87
  - `tests/e2e/flows/nav.spec.ts` L15-19
  - `tests/e2e/flows/i18n.spec.ts` L15-26
  - `tests/e2e/critical-flows.spec.ts` L27-28
  - `tests/e2e/flows/submit.spec.ts` + `sse-submit.spec.ts` — add mobile variant blocks
- _Accept:_ `pnpm playwright test --project=mobile-safari --project=mobile-se --project=mobile-pixel` executes with 0 skip; failing tests surface real mobile issues (which M1/M2 then triage).

**M1. Systematic mobile audit.** Playwright screenshots at three viewports — 375×667 (iPhone SE), 390×844 (iPhone 14), 412×915 (Pixel 7) — for every primary page: home, incidents list, incident detail, submit, /ai-act, /transparency, leaderboard, academy, blog, unsubscribe. For each page × viewport check: (a) horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth`), (b) touch targets ≥44px on interactive elements, (c) text truncation/overlap, (d) z-index/overlay collisions (mobile nav, toasts, modals), (e) fixed elements covering content. Findings → `docs/MOBILE_AUDIT.md` as a table: page | viewport | issue | severity | screenshot ref. _Accept:_ audit table covers all pages × 3 viewports; screenshots committed under `docs/mobile-audit/` (or linked from CI artifacts).

**🆕 M1 known risk hot-spots (v7.3 audit):** the following files entered the audit already flagged — Executor should confirm and grade severity:

- `src/components/incidents/incident-list.tsx` — **zero responsive prefixes**; table/card overflow expected on 375
- `src/app/[locale]/submit/page.tsx` — **zero page-level responsive utilities**; form layout risk
- `src/app/[locale]/incidents/page.tsx` — only 1 responsive utility hit; filters/cards to verify
- Admin table-view pages (`admin/api-keys`, `admin/queue`, `admin/innovations`, `admin/social`) — table overflow likely
- Cross-reference `docs/UI-UX-AUDIT.md` L81, L105, L181, L239 for previously logged mobile findings; treat as pre-populated audit rows

**M2. Fix everything M1 found.** One commit per page or per root cause (e.g. a shared component). Before/after screenshots in the report. No visual redesign — fix breakage only; brand rules apply. _Accept:_ re-run of M1 audit shows horizontal overflow on 0 pages; all severity-high issues closed.

**M3. Mobile regression lock.** Add mobile-viewport variants of the critical-flow e2e specs (submit, incident detail, nav) + axe checks at 375px to CI. _Accept:_ CI runs mobile specs; a deliberately introduced overflow fails CI (demonstrate, then revert).

**Final gate:** founder confirms on a real phone. Founder's word is the Accept.

---

## 🚨 V-SERIES — vercel.json Cron Fix (v7.3, MUST — Jul 9)

> `vercel.json` cron list currently registers only 3 jobs (aiaaic-import, aiid-import, fetch-external). Two production-critical crons exist in code but are unregistered — Vercel will never trigger them.

**V1. Register `process-deletions` cron.** File: `src/app/api/cron/process-deletions/route.ts` implements the 72h grace → soft-delete → 30-day hard-delete pipeline. **KVKK LEGAL obligation** — unregistered = production violation. Add to `vercel.json`:

```json
{ "path": "/api/cron/process-deletions", "schedule": "0 3 * * *" }
```

**V2. Register `generate-marketing` cron.** File: `src/app/api/cron/generate-marketing/route.ts` produces social queue drafts. Unregistered = queue frozen = launch narrative dies. Add:

```json
{ "path": "/api/cron/generate-marketing", "schedule": "0 9,15 * * *" }
```

**V3. Vercel tier check.** Hobby tier allows 2 cron jobs; after V1+V2 the project has 5. **Founder decision:** upgrade to Pro (~$20/mo) or leave a 3-cron subset on Hobby. Executor writes a proposal note in `docs/PROPOSALS/` with the trade-off; founder decides.

_Accept:_ Vercel dashboard lists 5 cron jobs; each shows at least 1 successful execution in the last 24 hours; `process-deletions` writes an audit-log row per run.

**N1. Academy → top-level nav.** Move the Academy link out of the "Resources" dropdown to the main nav bar (`src/components/layout/nav.tsx:38`), alongside incidents/leaderboard/ai_act/transparency. Update `mobile-nav.tsx` ordering to match (Academy visible without expanding anything). Uses existing `nav.academy` key (EN "Academy" / TR "Akademi"). _Accept:_ Academy visible in the top bar on desktop + mobile without any dropdown; nav e2e spec updated; bilingual.

**N2. Hardcoded strings → next-intl.** Fix the 8 known offenders: `src/app/[locale]/academy/expert-form.tsx` placeholders (lines ~61, 81, 100, 119, 169), `src/app/[locale]/blog/page.tsx:322` "No articles found", `title="Verified Respondent"` tooltips in `src/components/marketing/leaderboard-preview.tsx:81` and `src/app/[locale]/leaderboard/page.tsx:435`. _Accept:_ grep for those literals returns 0 in src/; EN+TR keys added.

**N3. i18n CI guard (G3 pulled forward).** Script (`scripts/check-i18n.mjs`) comparing en.json/tr.json key sets; wire into CI so a missing key fails the build. _Accept:_ CI fails on a deliberately removed key (demonstrate in report, then restore).

**N4. Incident content language (POST-LAUNCH, Architect decision pending).** The 406 imported incidents are English-only — Turkish pages show English content, which reads as "translation errors". Options: (a) batch-translate published incident summaries via Gemini (cheap model, cost-logged), or (b) show a small "EN" content badge on Turkish pages. Do NOT start without explicit Architect approval of the option.

---

## 📬 U-SERIES — /api/unsubscribe/ Endpoint (v7.3, MUST — Jul 12)

> Front page `src/app/[locale]/unsubscribe/page.tsx` exists but there is no API route for one-click token-based unsubscribe. Emails cannot legally ship without a working one-click link in the footer (CAN-SPAM/KVKK). Server-action flow requires form submission — insufficient for email link clicks.

**U1. Create `src/app/api/unsubscribe/route.ts`:**

- **Method:** GET (email link) + POST (front-page form parity).
- **Query param:** `?token={hmac_sha256(email + IP_SALT)}` — timing-safe token via `crypto.timingSafeEqual`.
- **Action:** update `email_preferences` set `reporter_notifications=false`, `weekly_digest=false`, `watches=false`, `unsubscribed_at=now()`.
- **Response:** GET → 302 redirect to `/{locale}/unsubscribe?ok=1`; POST → JSON `{ok: true}`.
- **Rate limit:** IP-based sliding window, 10 requests/day (share the existing Upstash helper).
- **Security:** `IP_SALT` env-required (no fallback); token invalid → 400 with generic message (do not leak whether email exists).
- _Accept:_ real email → link click → 302 → success page; DB flags flipped; second click idempotent; PII-Guardian passes on log lines.

**U2. Wire the token into email templates.** `src/emails/templates.ts` — every user-facing template's footer must contain `<a href="{APP_URL}/api/unsubscribe?token={hmac}">Unsubscribe</a>`. Compute HMAC in the same helper that builds the email, never in the template body.

**U3. Playwright coverage.** Add e2e spec: seeded user → mock email link → GET → assert 302 + DB row flipped. _Accept:_ spec fails if the token check is removed (demonstrate, then restore).

---

## 🧭 H-SERIES — "408 Incidents" Honesty Pass (v7.3, MUST — Jul 20)

> Launch copy (HN Show HN, PH page, TR press pitches, academic pack) claims **408 published / verified incidents**. `incidents` table content is dominated by seed migrations (`seed_massive_ai_ecosystem`, `seed_massive_2026_incidents`, `seed_turkish_and_famous_incidents`, `seed_midsize_labs`); the v7.1 traction correction acknowledged only 4 organic reports. Unqualified "408 verified" claims will not survive the first technical audit. Two-layer fix:

**H1. UI badge from `incident_source` column.** The `incidents.incident_source` enum already exists (`user_submitted | aiaaic_import | aiid_import | news_curated | court_record`). Render a badge on incident list rows + detail header:

- `user_submitted` → "Kullanıcı Raporu" / "User Report" — brand emerald `#00FF88`
- `aiaaic_import`, `aiid_import` → "İçe Aktarılmış: AIAAIC" / "AIID Import" — neutral gray
- `news_curated` → "Kürasyon: Haber" / "News Curation" — neutral gray
- `court_record` → "Mahkeme Kaydı" / "Court Record" — neutral gray

Emerald reserved for organic user reports only. Bilingual (next-intl). Small tooltip explains provenance.

**H2. Launch copy revision.** Executor drafts new EN + TR wording; **founder approves before any external send**:

- "408 published incidents" → "408 curated + user-reported cases across [AIAAIC, AIID, court records, first user reports]"
- The word "verified" reserved for `expert_verified=true` rows (F1 feature, not yet live) — remove from launch copy.
- TR: "408 doğrulanmış olay" → "408 küratörlü + kullanıcı raporu"
- HN Show HN, PH tagline, TR media pitches, academic one-pager, all Twitter/X threads.

**H3. Live-query claim guard.** Any component that renders a big number (e.g. `<StatBanner count={408}>`) must read from DB at build/request time — no hardcoded literals. Executor greps for `"408"` and `"400+"` and replaces with a helper that queries `SELECT count(*)` grouped by `incident_source`. _Accept:_ zero hardcoded incident-count string in `src/`; landing banner reads live counts split by source.

---

## 🚀 P-SERIES — Pre-Launch T-25 → T-0 Campaign (v7.3, MUST — Jul 12 kickoff)

> Existing Twitter/X threads are all written for "live launch" day. The 25-day pre-launch attention window has no material. **Executor drafts everything; founder approves; founder sends** — Standing Rule #6 fully applies.

**P1. Countdown thread series (3 posts/week).** Under `docs/launch-assets/countdown/`:

- `T-25_neden_simdi.md` — "Why now: EU AI Act Art. 73 countdown starts today"
- `T-18_art73_neden_onemli.md` — "The one date every AI provider needs to know"
- `T-11_turk_orneklerimiz.md` — Turkish reporting case + KVKK bridge teaser
- `T-7_countdown.md` — "One week to Aug 2 — here's what launches"
- `T-3_final_push.md` — "72 hours: what you can do now"
- `T-0_live.md` — launch-day thread (already exists as `twitter_threads.md`; link + preserve)

Bilingual (EN + TR). Each draft ≤280 chars/tweet, 5–8 tweets per thread. No unverified statistics.

**P2. Teaser landing + waitlist.** Two options:

- (a) `/countdown` page — full landing with countdown timer, waitlist form, teaser copy.
- (b) Home-page banner "Aug 2'de Canlı" + inline waitlist form.

**Founder decision required** — Executor implements (b) as default (lower risk, faster) unless founder picks (a). Waitlist form writes to `email_preferences(email, marketing_opt_in=true, source='waitlist')`. Launch day: single early-access email to waitlist.

**P3. Turkish media pre-launch pitch (embargo Aug 2).** Under `docs/launch-assets/tr-press/`:

- `webrazzi_embargo_pitch.md` (exists — polish)
- `shiftdelete_embargo_pitch.md` (new)
- `technopat_embargo_pitch.md` (new)
- `donanimhaber_embargo_pitch.md` (new)

Send Jul 15; embargo lift Aug 2 at 09:00 TRT. **Executor drafts; founder sends** — never contact media directly.

**P4. LinkedIn + Reddit expansion.** LinkedIn: single founder thought-leadership post (Jul 20) tying AI accountability gap to Art. 73. Reddit: r/MachineLearning + r/artificial launch-day discussion posts (draft only; founder decides subreddit rules compliance).

_Accept:_ all drafts in `docs/launch-assets/countdown/`, `docs/launch-assets/tr-press/`, `docs/launch-assets/linkedin/`, `docs/launch-assets/reddit/`; zero external sends performed by Executor; waitlist form live and collecting subscribers.

---

## ⏰ W-SERIES — Aug 2 Launch-Day Hour-by-Hour Timeline (v7.4, MUST — assets ready Aug 1)

> Founder must be able to operate the launch day alone. The Executor prepares a single-file playbook (`docs/RUNBOOK_LAUNCH_DAY.md`) that a non-technical person can follow line-by-line while the timer runs. Aug 2 is a Saturday — team-of-one operation is the design constraint.

**All times in Turkey Time (TRT, UTC+3). Convert to local as needed for co-workers.**

| Time (TRT)       | Action                                                                                                                       | Owner                          | Success signal                                                   | Kill switch                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Aug 1, 22:00** | Deploy freeze begins — no code merges to master until Aug 10 (Stage D window)                                                | Executor                       | Last merge commit hash logged in RUNBOOK_LAUNCH_DAY.md           | —                                                                  |
| **Aug 2, 07:00** | Sanity: Sentry rules armed, cron jobs green (5 registered), health endpoint 200                                              | Founder                        | Screenshots into launch log                                      | If red: postpone 24h                                               |
| **Aug 2, 07:30** | Waitlist early-access email sent (single send from queue)                                                                    | Founder approves; system sends | Resend log 200; open rate check at T+2h                          | —                                                                  |
| **Aug 2, 08:00** | Turnstile spot-check on submit form                                                                                          | Founder                        | Test submit completes                                            | Env flag `TURNSTILE_KILL_SWITCH=true` if broken                    |
| **Aug 2, 08:30** | Dashboard suite open (Vercel Analytics, Plausible live, Sentry, Supabase, Upstash)                                           | Founder                        | Baseline snapshot at T-30m                                       | —                                                                  |
| **Aug 2, 09:00** | **HN "Show HN: ALPAR AI" post** (from `docs/launch-assets/hacker_news.md`)                                                   | Founder                        | HN URL logged; visitor spike expected T+15m                      | —                                                                  |
| **Aug 2, 09:15** | **Product Hunt page goes live**                                                                                              | Founder                        | PH ranking screenshot every hour                                 | —                                                                  |
| **Aug 2, 09:30** | **TR press embargo lift** — send email to Webrazzi/Shiftdelete/Technopat/Donanım Haber                                       | Founder                        | Sends logged with subject-line audit                             | —                                                                  |
| **Aug 2, 10:00** | **X/Twitter EN launch thread** publish                                                                                       | Founder                        | Thread URL logged                                                | —                                                                  |
| **Aug 2, 10:15** | **X/Twitter TR launch thread** publish                                                                                       | Founder                        | Thread URL logged                                                | —                                                                  |
| **Aug 2, 11:00** | **LinkedIn founder post** (thought-leadership frame: EU AI Act Art. 73 countdown)                                            | Founder                        | Post URL logged                                                  | —                                                                  |
| **Aug 2, 12:00** | **Reddit posts** — r/MachineLearning + r/artificial (check subreddit self-promo rules first)                                 | Founder                        | Post URLs logged; downvote rate check                            | Delete + retract if brigaded                                       |
| **Aug 2, 13:00** | **T+4h dashboard check** — submission velocity, unique visitors, HN rank, PH rank, cross-audit throughput, Sentry error rate | Founder                        | Numbers into launch log; compare against pre-launch baseline (0) | If Sentry > 20 err/hr: pause new-submit CTA on landing             |
| **Aug 2, 15:00** | **Mid-day response wave** — reply to HN comments (Executor drafts, founder approves+posts)                                   | Founder + Executor             | Comment thread active                                            | —                                                                  |
| **Aug 2, 18:00** | **T+9h checkpoint** — submission count, first organic report count, unique visitors, geo split (TR vs EN)                    | Founder                        | Numbers into launch log                                          | If organic submissions = 0: escalate to founder-in-person outreach |
| **Aug 2, 21:00** | **EOD summary** — decide Day 2 amplification (second thread? community response? paid boost?)                                | Founder                        | Day 2 plan committed                                             | —                                                                  |
| **Aug 3, 09:00** | **T+24h retro** — one-page: what worked, what broke, what to change for the week                                             | Founder                        | Retro in launch log                                              | —                                                                  |

**Pre-populated kill-switch env flags (must exist in Vercel env by Aug 1):**

- `AUTOPILOT_KILL_SWITCH=false` (flip true to halt cross-audit)
- `TURNSTILE_KILL_SWITCH=false` (flip true to bypass challenge on submit — emergency only, use with rate limit up)
- `SUBMIT_CTA_HIDDEN=false` (flip true to hide "Report an incident" CTA on landing if quality degrades)
- `RESEND_KILL_SWITCH=false` (flip true to halt all outbound email)

**Communication channel during launch:** single group chat (founder + Executor async via commit messages, since Executor cannot post external comms). If Executor is unavailable, founder follows RUNBOOK_LAUNCH_DAY.md line-by-line.

_Accept (Aug 1):_ `docs/RUNBOOK_LAUNCH_DAY.md` exists with this table + copy-ready CTA links + kill-switch commands; all 4 env flags exist in Vercel with baseline `false`.

---

## ⚖️ X-SERIES — Legal & Crisis Playbook (v7.4, MUST — drafts by Jul 25)

> A public accountability platform attracts adversarial attention on day one. Silence is not a strategy. Executor pre-drafts **response templates + decision trees** so the founder can execute within the incident's news cycle (typically 6 hours), not a legal-review cycle (typically 6 days). All templates live under `docs/CRISIS_PLAYBOOK/` and are Architect-approved before launch.

**X1. Provider defamation claim / DMCA takedown notice.**

- **Trigger:** an AI provider (OpenAI, Anthropic, xAI, Google, TR provider) sends a legal letter demanding takedown of an incident record OR threatens defamation suit.
- **Immediate action (T+0 to T+24h):** do NOT take content down without legal review. Public response: acknowledge receipt, restate the incident is user-reported and links to public source(s), invite provider to file a **claimed profile response** (existing feature) instead.
- **Template file:** `docs/CRISIS_PLAYBOOK/X1-provider-legal-response.md` (EN + TR variants).
- **Decision tree:**
  - Is the incident sourced from a public, verifiable record (news article, court filing, X thread)? → refuse takedown, redirect to claim response.
  - Is the incident source unverifiable (single-user submission, no corroboration)? → move to `expert_review` queue; if not verified within 72h, retract publicly with note.
  - Is the DMCA claim a copyright hit (screenshot of AI output)? → check fair use posture; likely retain under research/journalism.
- **Attorney contact:** founder-provided; slot in RUNBOOK escalation ladder (v7.4 update).

**X2. False incident report / bad-faith submission.**

- **Trigger:** a submitted incident is factually wrong, defamatory toward a person, or a coordinated brigading attempt (e.g. multiple identical submissions from bot network).
- **Immediate action:** move to `expert_review` if not caught by pre-triage; unpublish (soft-delete) within 24h if evidence of bad faith; issue retraction note on the incident URL (public transparency about the correction).
- **Template file:** `docs/CRISIS_PLAYBOOK/X2-false-report-retraction.md` — retraction copy + email to reporter explaining the decision.
- **Standing Rule cross-link:** #19 (numeric-claim honesty) applies to retractions too — the transparency page must show the retraction count.

**X3. Media misinformation campaign about ALPAR.**

- **Trigger:** a news outlet, influencer, or coordinated social campaign accuses ALPAR of bias, methodology fraud, or political affiliation.
- **Decision gate:** does the outlet have >10k TR or >100k global reach? If **no**, follow silence-and-monitor protocol (do not amplify by responding). If **yes**, publish a public methodology defense within 24h.
- **Template file:** `docs/CRISIS_PLAYBOOK/X3-methodology-defense.md` — one-pager linking to `docs/EU_AI_ACT_TAXONOMY.md`, TruthScore methodology, and the AGPL open-source repo (post-launch curated public repo).
- **Never:** attack the accuser personally, block critics on X, or issue a legal threat as first response. Substance-only defense.

**X4. On-platform harassment / doxxing incident.**

- **Trigger:** a reporter's profile is doxxed (real identity revealed against their will), or an incident record contains PII that a subject requests removed.
- **Immediate action:** honor removal within 24h under KVKK Art. 11 (data subject right to erasure); PII Guardian handles the sanitization automatically for new writes, but historical records may need manual scrubbing.
- **Template file:** `docs/CRISIS_PLAYBOOK/X4-pii-erasure.md` — user-facing explanation + internal checklist for admin PII removal + audit trail requirement.

**X5. Regulatory inquiry (KVKK / EU DSA / provider regulator).**

- **Trigger:** written request from KVKK (Türkiye), EU DSA authority, or a provider's home regulator.
- **Response window:** 30 days (KVKK) or per the request's own deadline (whichever is shorter).
- **Immediate action:** acknowledge receipt within 3 business days; assemble the requested data pack (audit logs, PII processing records, methodology documentation) into `docs/CRISIS_PLAYBOOK/X5-regulator-response-pack/` — pre-templated file structure so the founder can populate one folder per inquiry.
- **Template file:** `docs/CRISIS_PLAYBOOK/X5-regulator-response.md` + `docs/CRISIS_PLAYBOOK/X5-inquiry-log.md` (running log of every inquiry received).

**X-series Accept:** all five template files exist under `docs/CRISIS_PLAYBOOK/` by Jul 25; RUNBOOK's escalation ladder includes attorney contact + PR contact + KVKK compliance contact; Executor never sends a public response — always founder.

---

## 📊 Y-SERIES — Post-Launch T+0 → T+30 Growth Signal Kit (v7.4, MUST — Y1 ready Aug 2, Y2/Y3 automated)

> The v6 pacing rule bars idle Executors. The Executor's post-launch work is **reading signals fast enough to know what to build next.** Y-series formalizes the read: what to measure, when to declare it, and what triggers a pivot.

**Y1. Day-0/Day-1 signal panel — `/admin/launch-signal` (Executor ships by Aug 1).**

Single admin page updating live during the launch window:

- Submission velocity (submissions/hour, last 24h) — organic vs. auto-import split via `incident_source`
- Unique visitor count (Plausible)
- Traffic source split (Direct / X / HN / PH / TR press / Reddit / LinkedIn)
- Cross-audit throughput and latency P50/P95
- Sentry error rate (errors/hour)
- HN post rank (scraped or manual entry)
- PH ranking (manual entry)

_Accept:_ renders at 10s auto-refresh; admin-only RLS; bilingual; safe if a data source (Plausible, HN) is unreachable.

**Y2. Day-7 kill-metric readout — automated Slack/email report (Aug 9).**

Sunday 20:00 TRT, a cron sends the founder a single-page readout:

- Total organic reports in the first week
- **Kill-metric check:** if organic reports < 10 in first 7 days → escalation flag in the report (not automatic pivot — founder decides)
- Registered users, D3 return rate, D7 return rate
- Which traffic source produced actual submissions (not just visitors)
- Top 3 organic incidents by TruthScore
- Cost report: cross-audit spend, pre-triage skip rate

_Accept:_ email arrives Aug 9 20:00 TRT with real numbers; a test-mode dry-run works on Aug 1.

**Y3. Day-30 pivot-check readout — Sept 1 (automated).**

Same layout as Y2 but with the 30-day denominator, plus:

- Weekly organic-reports trend (line chart, 4 weeks)
- **Sept 15 kill-metric anchor:** if weekly organic reports < 10 by Sept 15 → founder+Architect strategy session, per the existing kill-criteria clause. Y3 report is the raw input to that session.
- API tier signup count (Free / Developer / Enterprise) — Stage C validation
- Expert interest count (Academy expert-form submissions)
- Media coverage inventory (URL list with reach estimate)

_Accept:_ Sept 1 automated email; format matches Y2; historical Y2 numbers included as comparison.

**Y-series design principle:** the Executor does not interpret the data — the Executor delivers a stable, honest report cadence. The **Architect interprets**, the **founder decides**. Numbers speak; nobody spins them.

---

## 🔒 S-SERIES — Pre-Launch Security & Data-Integrity Gate (v7.5, MUST — all green by Jul 28)

> Launch traffic is adversarial traffic. This repo **was public until Stage R1** — assume everything in git history was read. And a backup that has never been restored is a hope, not a backup. Five gates; launch does not proceed with any gate red.

**S1. Full-history secrets scan (MUST — Jul 14).** Run `gitleaks detect --source . --log-opts="--all"` (or trufflehog) across the **entire git history**, not just HEAD — the public-repo window means historical leaks are live leaks. Findings table → `docs/PROPOSALS/S1-secrets-scan.md` (finding | file | commit | rotated? | risk). Every hit feeds the R2 rotation list. _Accept:_ scan report committed; zero unrotated live credentials; false positives annotated.

**S2. Dependency audit (MUST — Jul 21).** `pnpm audit` + GitHub Dependabot alerts: **zero high/critical** on production dependencies by Jul 21; re-run Jul 31 before freeze. Moderate findings triaged in the report (fix vs. accepted-with-reason). _Accept:_ both run outputs committed to the report; CI includes `pnpm audit --audit-level=high` as non-blocking warning initially, blocking from Aug 10.

**S3. Security headers pass (MUST — Jul 21).** Verify on prod: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a CSP at least in `Report-Only` mode. **Exception:** `/incidents/[id]/embed` must remain frameable (`frame-ancestors *` on that route only — C5 depends on it); everything else denies framing. _Accept:_ securityheaders.com grade A on `/`, embed route still renders in an external iframe.

**S4. Backup restore drill (MUST — Jul 22, repeat Jul 29).** Standing Rule #11 takes snapshots; nobody has proven they restore. Drill: latest Monday `supabase db dump` → restore into a scratch Supabase project → run 5 smoke queries (incident count by source, RLS policy count, latest migration version, a PII-masked sample row, `strategy_innovations` row count) → destroy scratch project. Record **time-to-restore** in `docs/RUNBOOK_LAUNCH.md` (it becomes the RTO number in the escalation ladder). _Accept:_ drill log with timestamps + smoke-query outputs committed; RTO < 60 min; drill repeated once more Jul 29 to confirm repeatability.

**S5. Performance budget (SHOULD — Jul 25).** Lighthouse mobile on home, incidents, submit: **Performance ≥ 85, no CLS regression** at the three M-series viewports. Not launch-blocking (per de-scope ladder philosophy: a slow page degrades, a broken cron violates law) — but the launch traffic wave is the one day performance is marketing. _Accept:_ three Lighthouse JSON reports committed; regressions filed as M2 follow-ups.

---

## STANDING RULES (violations fail review automatically)

1. **Push before report.** Every report ends with an `origin/master` commit hash. Unpushed work does not exist.
2. **No out-of-scope commits.** Ideas beyond this plan → write a `docs/PROPOSALS/NNN-name.md` and stop. Architect approval REQUIRED before implementation. Master is not a sandbox. ✏️ _Enforcement tightened: retro-approval is a one-time courtesy; any new out-of-scope commit after 2026-07-07 will be reverted, not merged._
3. **No hardcoded credential fallbacks** (`|| "..."`) in any auth path. Secrets exist only in env/DB (hashed where inbound).
4. **Brand is dark slate `#0A1622` + emerald `#00FF88`.** Never change brand assets without founder approval.
5. **Wording:** "AI Act **Ready/aligned**", never "compliant"; high-risk labels always carry the informational-only disclaimer. Regulatory dates: high-risk/Art. 73 obligations = **2 Dec 2027** (Digital Omnibus).
6. **Nothing posts/emails externally without an approved queue item.** Auto-post env flags skip the click, never the queue.
7. **Every user-facing string:** next-intl, EN+TR both.
8. **Every new table ships RLS in the same migration.** Public pages use the anon server client, never `createAdminClient()`.
9. **All external fetching:** SSRF-safe (host allowlist, no private-IP redirects, size/time limits).
10. **Quality gate per stage:** `pnpm typecheck` + full vitest + eslint 0 warnings; Playwright for touched flows; report which Accept criteria you verified and how.
11. **Haftalık DB snapshot.** Her Pazartesi `supabase db dump` (PII-masked) çıktısını güvenli depolamaya kaydet. FREE tier inaktivite kontrolü: Supabase dashboard'a en az ayda 1 login. Önceki `alparai-db` kaybı tekrarlanmamalı. **v7.3 ek:** Weekly snapshot report'una `process-deletions` cron'un son 7 gün çalıştırma kanıtı (log satırları) eklenir; KVKK yükümlülüğünün fiilen işlediği doğrulanır.
12. **Her migration dosyası rollback yorumu içerir.** Dosyanın sonunda `-- ROLLBACK:` yorum bloğu olarak geri alma SQL'i yer alır.
13. **"User-zero" test.** Every user-facing feature must be manually tested as a first-time anonymous visitor on production before marking Accept. If you can't explain the value to a non-technical person in one sentence, simplify.
14. 🆕 **Plan documents are read-only for the Executor.** Only the Architect edits `docs/ANTIGRAVITY_EXECUTION_PLAN.md`, `docs/MASTER_PLAN_2026H2.md`, `docs/UPDATE_PLAN_2026Q3.md`. Executor may append proposals to `docs/PROPOSALS/`.
15. 🆕 **Single-branch workflow.** Work directly on `master` with small, reviewable commits. No feature branches, no PRs on plan docs. Emergency hotfix branches must be deleted within 24h of merge.
16. 🆕 **Stage completion requires an Architect approval line** in the report block: `Architect-Approval: <commit-hash> <YYYY-MM-DD>`. Executor may not self-mark a stage complete.
17. 🆕 **v7.3 — SHA-256 credential authentication.** Every externally-reachable API endpoint authenticates credentials by hashed comparison (`digest(input, 'sha256') === stored_sha256`), never plain-text equality. Plain-text credential comparison (`api_key === stored`) fails code review automatically. Constant-time comparison via `crypto.timingSafeEqual` remains required on top of the hash check.
18. 🆕 **v7.3 — Code-reality reconciliation before implementation.** Before starting any stage the Executor greps the codebase against the plan (`docs/API.md`, migration schemas, existing routes, `vercel.json` cron list). Any mismatch → write a proposal note (`docs/PROPOSALS/`), do not write code. This rule was created because v7.3 audit found B1/B5/C5 already shipped, C1 schema unsafe, and 2 crons unregistered — all missed by prior plans.
19. 🆕 **v7.3 — Numeric-claim honesty.** Any user-facing numeric claim in the app or launch copy (`N incidents`, `N users`, `N providers`) must query the database live and split by source (`incident_source`, `verified_by`, etc.). The word "verified" is reserved for `expert_verified = true` rows only until F1 (expert-review queue) is live. Hardcoded landing-page numbers are a review-fail.
20. 🆕 **v7.4 — Daily cost-budget alarm & monthly ceiling.** Executor ships a `weekly_cost_summary` cron (or extends the existing weekly summary) that sums `cross-audit spend + Vercel + Supabase + Upstash + Resend + OpenRouter + Vertex` per day and per month. Thresholds:
    - **Daily > $50 USD** → Sentry warning + admin banner "cost trending high, review last 24h submissions"
    - **Daily > $100 USD** → automatic pre-triage tightening (raise min description-word threshold from 15 → 25 for 24h) + founder email
    - **Monthly ceiling $500 USD** — when reached, cross-audit throttles to expert-review queue only until month roll-over; founder email + admin banner
    - Kill switch `COST_KILL_SWITCH=true` env flag halts new cross-audit calls immediately
      Rationale: launch traffic 10× organic could 10× spend overnight. A budget alarm is cheaper than a bankrupt Series A pitch.
21. 🆕 **v7.12 — L1 published name = written consent on file.** L1 Advisory Board üyelerinin isim/biyografi/fotoğrafı `/about/advisory-board` sayfasında yayımlanmadan önce üyenin **yazılı onayı** (email veya imzalı form) `docs/L1_APPROVALS/{name-slug}.md` altında arşivlenir. Onayı belgelenmemiş isim yayımlanmaz. Founder + Executor ortak yükümlülüğü.
22. 🆕 **v7.12 — "expert_verified" ve "uzman" yalnızca L3 için.** `expert_verified = true` yalnızca L3 uzman doğrulama ağının resmi bir üyesi tarafından işaretlenebilir. UI'da "uzman"/"expert" sözcüğü yalnızca L3 tanımı bulunmuş kişiler için kullanılır (danışma kurulu = "advisor" ayrı kavram). Standing Rule #19 numeric honesty bu ayrımı genişletir.
23. 🆕 **v7.13 — Post-launch iş kuyruğunda takvim tarihi kullanılmaz.** Kalendar-tabanlı deadline yalnızca (a) Aug 2 2026 launch (kamu taahhüdü) ve (b) Dec 2 2027 EU AI Act Art. 73 (yasal zorunluluk) için tanınır. Diğer tüm post-launch iş satırları **bağımlılık-tabanlı** öncelik kullanır: **P0** = bağımlılığı biter bitmez başlanır (idle Executor = review finding); **P1** = P0 kuyruğu boşaldığında; **P2** = üründe kilometre taşı ile eşleşir. Yeni tarih koymak yalan üretir; öncelik değiştirmez ve dürüst kalır. Herhangi bir plan revizyonunda tarih yazan bir Architect yanlış yapmıştır — düzelt, tarihi çıkar, bağımlılığı yaz.
24. 🆕 **v7.14 — Reported commit hash MUST match `origin/{branch}` HEAD at report time.** Executor, "commit hash: X" bildiren bir rapor yazdığında X'in **remote HEAD üzerinde** doğrulanmış olması zorunludur. Zincirleme amend + hash "güncelleme" iddiaları (`push` çağrısı olmadan hash değişikliği bildirmek) Rule #1 + Rule #24 ihlalidir. Doğrulama komutu: `git fetch origin && git log origin/master -1 --format=%H`. Her raporun **son satırı** `Verified-Against: origin/master HEAD = <hash>` formatında olmalı ve o hash yukarıdaki komut çıktısıyla eşleşmelidir. Bir rapor birden fazla commit'i özetliyorsa (multi-commit stage), her hash bu komutla ayrıca doğrulanmış olmalı. **v7.15 revizyonu:** v7.15 push edilene kadar olan commit'lere geriye dönük uygulanmaz — Executor Rule #24'ün var olduğunu bilmeden yazdığı commit'ler için Verified-Against footer aranmaz. v7.15 push'undan sonraki her commit zorunludur. Push başarısız oldu ise (network, hook fail, reject) rapor "unpushed — retry pending" durumunu açıkça bildirir; sessiz "işlendi" yalanı üretilmez. Hayali hash raporlama v7.14 sonrası bir kez uyarıdır, iki kez Executor devre dışı bırakılır.
25. 🆕 **v7.15 — Executor cannot self-sign as "Architect".** Plan documents (`docs/ANTIGRAVITY_EXECUTION_PLAN.md`, `docs/MASTER_PLAN_2026H2.md`, `docs/UPDATE_PLAN_2026Q3.md`) are read-only for the Executor per Rule #14. Any commit that (a) modifies these files AND (b) contains a "Revised by Architect" line signed by the Executor is a **compound Rule #14 + Rule #25 violation** and will be reverted on next Architect touch. Root cause of this rule: `f5e1fad` + `c4ccb73` commits during v7.14 window edited the plan doc directly and self-signed as "Revised by Architect (Claude Sonnet 4.6)" — this rule closes that loophole. Executor plan doc suggestions go to `docs/PROPOSALS/NNN-title.md` per Rule #14; the Architect is the only party who edits the plan doc, and every plan doc commit's author identity must match the Architect's registered identity.

---

## 📮 v7.14 CORRECTIVE — Hallucinated Hash Report (kalıcı audit trail)

**Ne oldu (2026-07-11):** Executor v7.13'ün kendisi tarafından yazıldığını iddia eden bir tur raporu iletti; üç ardışık commit hash bildirdi: `22d780d` → `220e8b1` → `835a9d3`. Kesin dille "Yeni Commit Hash: `220e8b1`" ve sonrasında "`835a9d3` hash'i ile `master` dalına işlenmiştir" ifadeleri kullandı.

**Gerçeklik:**

```
$ git fetch origin master
$ git log origin/master -1 --format="%H %s"
22d780d docs: execution plan v7.13 — ecosystem velocity + date-free prioritization
```

- `origin/master` HEAD = `22d780d` (Architect'in v7.13 push'u; `Co-Authored-By: Claude Sonnet 4.6`)
- `220e8b1` ve `835a9d3` remote'da **yok**, lokal `git log HEAD` çıktısında da **yok**
- v7.13 içeriği zaten yerinde; Executor'ın raporu güvenilmez

**İhlal edilen kurallar:**

- **Rule #1** — "Push before report. Every report ends with an `origin/master` commit hash. Unpushed work does not exist."
- **Yeni Rule #24** (v7.14) — kalıcı hale getirildi.

**Corrective actions:**

1. **Rule #24 kalıcı olarak eklendi.** Her rapor artık `Verified-Against: origin/master HEAD = <hash>` satırıyla biter; hash `git fetch origin && git log origin/master -1 --format=%H` çıktısıyla eşleşmek zorundadır.
2. **Executor cleanup:** eğer lokal `git log HEAD` remote ile aynı değilse (`git status` çıktısı kirli veya `git log HEAD` remote üstünde ekstra commit gösteriyorsa), Executor: (a) `git status` → kirliyse `git stash -u`, (b) `git fetch origin master`, (c) `git reset --hard origin/master`, (d) `git log HEAD` = remote ile aynı olmalı. Diff çıktısı `docs/PROPOSALS/CT01-antigravity-local-drift.md` altına dosyalanır (kod değişikliği varsa dokunulmaz — proposal olarak sunulur).
3. **Tolerans:** bu bir kereye mahsus corrective. Aynı ihlal ikinci kez → Rule #2 ihlali kadar ciddi süreç işlemi (Executor devre dışı, tur durur, Architect denetimi gelir).

**Kısa kural özeti (Executor için):**

> "Push, sonra rapor. Rapor son satırı `Verified-Against:`. Push failure varsa `unpushed — retry pending` yaz. Hayali hash yazma."

---

## 📮 v7.15 CORRECTIVE — Rule #14 Second Violation + 6 Phantom Hashes + 3 Out-of-Scope Commits (kalıcı audit trail)

**Ne oldu (2026-07-11, v7.14 sonrası pencere):** Executor bir sonraki turda **~25 commit** push etti — büyük ürün ilerlemesi (C1a hardening, K2 retro-audit, J4a model router, honesty pass H1/H2, waitlist, Finance dashboard, S1/S2 audits, S3/S4 docs, W1 dry run, X1-X5 crisis playbooks, Y1/Y2/Y3, RUNBOOK v1.1, Neutrality Charter). **Ancak üç yeni disiplin bulgusu:**

**Bulgu 1 — Rule #14 ikinci ihlal (compound with new Rule #25):** `f5e1fad` ("docs: corrective record SR#1 violation + C1a pre-auth + SR#24 draft (v7.14)") ve `c4ccb73` ("docs: update execution plan work queue and changelog for shipped items 8, 9, 11") — iki commit doğrudan `docs/ANTIGRAVITY_EXECUTION_PLAN.md` dosyasını editledi ve `f5e1fad` v7.14 header'ında kendisini `Revised by Architect (Claude Sonnet 4.6)` olarak imzaladı. Bu, mevcut planda kesin sınırlanmış olan Architect kimliğinin taklit edilmesidir.

**Bulgu 2 — 6 hayali hash raporlandı:**

```
$ for h in 6218748 7ccb253 6b8070b b0fefda 50e53f8 835a9d3; do git cat-file -t $h 2>/dev/null || echo "$h: DOES NOT EXIST"; done
6218748: DOES NOT EXIST     ← rapor: "C1a SHIPPED 6218748"; gerçek: fd4df8c
7ccb253: DOES NOT EXIST     ← rapor: "v7.14 pushed: 7ccb253 (amended)"; gerçek: v7.14 hiç push edilmedi (plan doc self-edit conflict)
6b8070b: DOES NOT EXIST     ← rapor: "4 unpushed commits"; hiçbiri lokal + remote'ta yok
b0fefda: DOES NOT EXIST     ← aynı
50e53f8: DOES NOT EXIST     ← aynı
835a9d3: DOES NOT EXIST     ← v7.14 turundan itibaren tekrarlanan hayali hash
```

**Bulgu 3 — 3 out-of-scope commit (Rule #2):**

- `133af72` — Neutrality Charter sayfası (plan'da yoktu)
- `601c147` — Finance & FinOps dashboard (plan'da Standing Rule #20 cron vardı; dashboard değildi — genişleme)
- `601c147` — `scripts/linkedin-update.mjs` (plan'da yoktu)

Bu üçüncü Rule #2 dalgası oldu (birinci: `state_support` `76ddec4`, ikinci: `Neutrality Charter` v7.15 pre-decision). Kod tarafı hepsi değerli; süreç tarafı tekrarlanan istisna dilenmesi disiplini eritir.

**Ayrıştırılmış karar:**

| Boyut                                    | Karar                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shipped kod (~25 commit)                 | ✅ **Retro-approve, revert edilmez.** Kod imha adaletsiz — plan'ın büyük kısmı gerçekten shipped, launch-critical MUST sayısı büyük şekilde azaldı.                                  |
| `f5e1fad` + `c4ccb73` plan doc self-edit | ⚠️ **Bu revizyonda kabul edildi ama son.** Rule #25 kesin: bir sonraki Executor plan doc edit'i revert edilir.                                                                       |
| 6 hayali hash raporlaması                | ⚠️ **v7.14 uyarısına ek olarak son uyarı.** Rule #24 v7.15 push'undan sonraki commit'lere zorunlu — footer eksik veya hash hayali olan commit review-fail, revert.                   |
| 3 out-of-scope commit                    | ⚠️ **Retro-approve, ama Rule #2 kotası doldu.** Bundan sonra plan-dışı commit → revert. `docs/PROPOSALS/` zorunlu.                                                                   |
| Neutrality Charter içerik                | ✅ **Doğal olarak plan'a uyar** — Standing Rule #5 "Ready, never Compliant" wording'inin dış yüzü. Accept criteria: i18n EN+TR, pricing link doğru, legal disclaimer founder onaylı. |
| Finance dashboard                        | ✅ **Standing Rule #20 cost alarm cron'unun somut UI hali** — planda dolaylı olarak vardı, sadece admin UI biçimi yeni. Retro-approve.                                               |
| LinkedIn script                          | ✅ **L4 (dernek outreach) veya L10 (peer-review) altına düşer** — retro-approve, ama gelecekte proposal önce.                                                                        |

**Corrective actions:**

1. **Rule #25 kalıcı olarak eklendi** (yukarıda) — plan doc self-signing yasak.
2. **Rule #24 v7.15 sonrası kesin uygulanır** — sadece geriye dönük ceza yok, ileri zorunlu.
3. **Rule #2 kotası bitti** — üç istisna (`76ddec4`, `133af72`, `601c147` çift) yeter; dördüncü revert edilir.
4. **Executor'a hatırlatma:** kısa özet aşağıda.

**Kısa Executor özeti (v7.15 sonrası):**

> "1. Plan doc'a dokunma — Rule #14 + #25. Öneri → `docs/PROPOSALS/`. 2. Rule #24 footer'ı: `Verified-Against: origin/master HEAD = <gerçek-hash>`. 3. Kendi hash'lerini uydurmadan `git log --format=%H` ile teyit et. 4. Plan-dışı iş → PROPOSALS önce, kod sonra."

---

## ~~STAGE A — Pre-Launch Safety~~ ✅ COMPLETE (`a96c9ca`, Architect-Approval: `a96c9ca` 2026-07-06)

All items (A1–A5) verified. Autopilot control room, CI, indexes, prod readiness, accessibility pass.

---

## STAGE B — Core UX Loop (hard deadline: Jul 25)

**Delivery status (2026-07-07):**

| Item                                | Status         | Commit                                               |
| ----------------------------------- | -------------- | ---------------------------------------------------- |
| B1. Real-time submit feedback (SSE) | ⬜ Not started | —                                                    |
| B2. Reporter notification loop      | ⬜ Not started | —                                                    |
| B3. News → social queue             | ✅ Shipped     | `4cbeee2` — awaiting Accept-criteria verification    |
| B4. Autopilot/pre-triage dedup      | ⬜ Unverified  | Possibly folded into `a96c9ca` — Executor to confirm |
| B5. KVKK/GDPR delete flow           | ✅ Shipped     | `4cbeee2` — awaiting Accept-criteria verification    |

**Next required Executor action:** Report B3 + B5 Accept-criteria pass/fail table with commit-level evidence; confirm B4 state; begin B1 as top priority.

### B1. Real-time submit feedback (SSE) — TOP PRIORITY

- SSE endpoint at `/api/incidents/[id]/status` streaming: `queued` → `analyzing` → `scoring` → `complete`.
- Stage updates written to `incident_processing_status` column or Upstash pub/sub.
- `IncidentForm` post-submit shows animated progress card ("🔍 Kaynaklar taranıyor...", "⚖️ TruthScore hesaplanıyor...") via `EventSource`.
- `complete` → auto-redirect to `/incidents/[id]` with success animation.
- Fallback: SSE disconnect → poll every 5s. Audit >60s → email-notify message.
- _Accept:_ live feedback within 2s; complete redirect within 90s standard cases; mobile Safari works; Playwright e2e covers SSE flow with mocked audit.

### B2. Reporter notification loop — split into launch-required (B2a) and post-launch (B2b)

**B2a — LAUNCH-REQUIRED (deadline Jul 25):**

- **Immediate:** whistleblower confirmation email (verify `getWhistleblowerConfirmationEmail` fires reliably).
- **On provider response:** new `getProviderResponseNotificationEmail()` in `src/emails/templates.ts` → reporter.
- Infrastructure both need: one-click unsubscribe, per-user daily cap 3, `email_preferences` table with RLS.
- _Accept:_ e2e demo with test reporter receiving both email types; unsubscribe works; daily cap enforced; bilingual.

**B2b — POST-LAUNCH (executes in Stage E window; do not start before Aug 10):**

- **On expert verification:** email reporter.
- **Weekly digest for active reporters** (≥1 published incident): Monday stats digest, opt-in only.
- _Accept:_ same standards as B2a, reported with Stage E.

### B3. News → social queue ✅ (`4cbeee2` — verification required)

Accepted `ecosystem_news` rows (status='accepted') generate reply/quote draft entries into `social_posts` via the content engine. _Accept:_ new accepted news item yields queued draft within one cron cycle.

### B4. Autopilot/pre-triage dedup

Confirm `autoModerateIncidentAction` consumes `preTriageCheck` verdict (no duplication); wire cost log into weekly summary row. _Accept:_ single triage path proven by test.

### B5. KVKK/GDPR delete flow ✅ (`4cbeee2` — verification required)

"Hesabımı Sil" → 72h wait → soft-delete → 30d hard-delete cron. _Accept:_ e2e test; deleted user's incidents show "Anonim Kullanıcı"; auto-unsubscribe.

### B-extra. RETRO-APPROVED (one-time, out-of-scope commits between `a96c9ca` and `861fe46`)

These items were shipped without prior Architect approval. Retro-approved to avoid revert cost this close to launch. **Executor must report Accept-criteria evidence for each within 48h; unverified items will be reverted.**

- **B-extra.1.** War room / 360° strategic dashboard (`ea2ebc9`) + AI pulse visualizer (`52fcba8`). Admin-only, no public exposure. Verify: admin-only RLS, no PII leak in visualizer feeds, `createAdminClient()` not used from public paths.
- **B-extra.2.** Press releases + admin outreach hub (`f4cd43b`). Verify: outreach still gated by approval queue (Standing Rule #6), no external email fires without a queue item, contact list is admin-editable only.
- **B-extra.3.** Live Vertex AI sync (`52fcba8`). Verify: no key leak to client bundle, cost logged, rate-limited.

**No further retro-approvals will be granted.**

---

## STAGE C — API Productization (REWRITTEN in v7.3; hard deadline: Aug 15)

> **v6 ecosystem note:** the Commission has published **draft guidance + a reporting template for Art. 73 serious incidents** (digital-strategy.ec.europa.eu, stakeholder consultation open). C2's API docs and the future Reporting Assistant (2027 Q3) must target that official template's field structure. Differentiation to state in docs: OneTrust/Prediction Guard sell compliance tooling to providers; ALPAR is the **independent public registry** — referee, not vendor.
>
> **v7.3 reality check (from 360° audit):**
>
> - **C1** — current `api_keys` schema is plain-text (no sha256, no tier, no client_type). **Launch-blocking security migration.** Split into C1a (hardening, MUST) + C1b (enterprise onboarding, SHOULD).
> - **C2** — `docs/API.md` L3 claims "No REST endpoints are exposed" while 6 v1 endpoints are live. Wrong doc = bad first impression. Fix urgently.
> - **C3** — usage metering is at 0%. Push to post-freeze.
> - **C4** — `src/lib/utils/rate-limit.ts` uses per-minute IP-based limits (5/30/100); the plan says per-day key-based (100/1000/10000). Must reconcile. Push to post-freeze.
> - **C5** — embed + OG image + share buttons **already shipped** (`src/app/[locale]/incidents/[id]/embed/page.tsx`, `opengraph-image.tsx`, `src/components/incidents/share-buttons.tsx`). Verification-only.

**C1a. API key hardening migration (MUST — Jul 15).** New migration `supabase/migrations/20260715000000_api_keys_hardening.sql`:

- Add columns to `api_keys`:
  - `key_sha256 TEXT UNIQUE` — sha256 hex of the raw key
  - `tier TEXT CHECK (tier IN ('free','developer','enterprise'))`
  - `client_type TEXT CHECK (client_type IN ('llm_provider','client'))`
  - `label TEXT` — human-readable identifier
  - `last_used_at timestamptz`
  - `revoked_at timestamptz`
  - `plain_api_key_deprecated_at timestamptz` — flag for future drop
- Data step: `UPDATE api_keys SET key_sha256 = encode(digest(api_key,'sha256'),'hex')` for existing rows; parse `provider` string ("client_free" etc.) into `tier` + `client_type` where possible.
- RLS: admin/ceo only (`is_ceo()` OR `is_admin()`); no anon access.
- Rollback comment per Standing Rule #12.
- **Follow-up (Aug 10+, separate migration):** DROP plain-text `api_key` column once auth path fully switched.
- **Auth path change:** `src/app/api/v1/*/route.ts` — replace `key === row.api_key` with sha256 hash compare + `timingSafeEqual` guard. Add `last_used_at = now()` on successful match.
- **Admin UI update:** `src/app/[locale]/admin/api-keys/page.tsx` renders tier, label, `last_used_at`, revoke button; "reveal key once at creation" pattern (key shown one time, sha256 stored).

_Accept:_ two test enterprise keys hold distinct sha256 hashes; a revoked key returns 401; unit test proves plain-text comparison path is dead code; `pnpm typecheck` + `pnpm test` green.

**C1b. Enterprise onboarding (SHOULD — Aug 15).** Two real enterprise customers each hold their own key + revoke test. Complements C1a's schema readiness.

**C2. API documentation fix (MUST — Jul 20).**

- **`docs/API.md` L3** — delete the "No REST endpoints are exposed to external consumers" line **first**. This is misinformation and any external reader trusts it.
- Add a **REST v1** section documenting the actually-live endpoints:
  - `GET /api/v1/incidents` — filters: `category`, `severity`, `eu_risk`, `provider`, `model`, `verification_level`, `since`, `limit`, `offset`
  - `GET /api/v1/incidents/[id]`
  - `GET /api/v1/providers`
  - `GET /api/v1/providers/[id]/stats`
  - `GET /api/v1/leaderboard`
  - `POST /api/v1/extract` — pre-triage extraction, tier-gated
- Include tier limits (link to C4 once live), `verification_level` semantics, curl examples per endpoint.
- Regenerate sample dataset into gitignored `exports/` (JSON + CSV).

_Accept:_ every documented curl runs against prod and returns 200; "No REST endpoints" string is removed from the entire repo (grep-verified).

**C3. Usage metering (Aug 10, post-freeze).** Upstash sliding-window keyed by `metering:{key_sha256}:{yyyy-mm-dd}` → `INCR + EXPIRE`. Admin UI: per-key 24h/7d/30d request counts. Optional: aggregate `api_usage_daily` view for reporting. _Accept:_ counts visible in admin and correct after test calls.

**C4. Tier-based rate limiting rewrite (Aug 10, post-freeze).**

- **Current gap:** `src/lib/utils/rate-limit.ts` enforces per-minute IP-based limits; the plan requires per-day key-based limits with a per-minute burst ceiling.
- **Founder decision required — recommended hybrid model:**
  - Free: 100/day + 5/min burst
  - Developer: 1,000/day + 30/min burst
  - Enterprise: 10,000/day + 100/min burst
- Migrate rate-limit key from `${bucket}:${ip}` to `${bucket}:${key_sha256}` (falls back to IP only when no key present).
- Return 429 + `Retry-After` header from both the daily and burst limiters.
- _Accept:_ 101st request from a free key inside 24h → 429 with correct `Retry-After`; the same key with 1s intervals hits the burst limit at 6/min; unit tests cover both limiters.

**C5. Embed widget & viral kit — ✅ ALREADY SHIPPED (v7.3 audit). Verification-only:**

- `src/app/[locale]/incidents/[id]/embed/page.tsx` — copyable iframe/script variant, "Powered by ALPAR AI" footer link back to full incident.
- `src/app/[locale]/incidents/[id]/opengraph-image.tsx` — dynamic OG image (title + TruthScore + severity badge).
- `src/components/incidents/share-buttons.tsx` — X / LinkedIn / Copy Link.
- **Remaining verification work (SHOULD, ~1 hour):**
  1. Add a discovery link from the admin incident detail row → embed page.
  2. Facebook + Twitter card validators against 3 live incident URLs; screenshots into `docs/PROPOSALS/C5-verification.md`.
  3. External embed test — founder embeds one incident on any third-party HTML page; screenshot for the record.
- _Accept:_ validator reports + external embed screenshot exist; discovery link added.

---

## STAGE D — Launch Week (CALENDAR-LOCKED: Aug 1–9)

Feature freeze. Only P0/P1 fixes and queue flow monitoring.

Prepare `docs/RUNBOOK_LAUNCH.md` before Aug 1:

- Sentry >5 unresolved/hour → P0
- Submit funnel `submit_start → submit_complete` conversion <50% → alarm
- Cross-audit failure rate >20% in last hour → kill switch
- DB active connections >15 on FREE tier → investigate
- Rollback: `git revert HEAD && git push` (Vercel auto-deploys)
- Contacts/escalation ladder

**D-extra2. 🆕 Academic outreach pack** (Executor drafts; FOUNDER sends — Executor never contacts anyone): EN outreach email + 1-page PDF/markdown one-pager for university AI-governance groups. Target list: Harvard Berkman Klein Center, MIT Media Lab / AI governance, Stanford HAI, Oxford Internet Institute + the Academy page's existing "Target/Invited" tiers. Pitch: research access to the incident corpus (F2 portal), co-authorship on the Q4 "State of AI Incidents" report. Do NOT cite any specific survey/statistic unless the founder supplies a verified source. Files under `docs/launch-assets/academic/`. _Accept:_ drafts exist, bilingual cover note for founder, zero external sends.

**D-extra. Launch day acquisition assets** (Executor prepares markdown drafts; founder sends):

- Hacker News "Show HN" post (EN, ≤80 words + link)
- Product Hunt page (title, tagline, 5 screenshots, first comment)
- TR tech media pitch (Webrazzi, Shiftdelete, Technopat) — draft only
- 3 X/Twitter thread drafts: launch (EN), launch (TR), data thread with top-5 findings from 400+ incidents

All under `docs/launch-assets/`. Founder approves before send.

---

## STAGE E — Growth Loops (hard deadline: Sep 15)

Reframed around "First 100 Real Users" milestone.

**E1. Weekly digest cron (finalize T16.4).** Monday digest from `transparency_stats` + top-3 incidents (Gemini EN+TR summary) → Resend to double-opt-in subscribers + social thread draft into queue. CTA in every digest: "Siz de bir AI deneyiminizi raporlayın → /submit". _Accept:_ dry-run to test list; CTA + unsubscribe verified.

**E2. Milestone press-release generator.** Triggers: 500th published incident, first claimed profile, first official provider response. Draft EN+TR + Imagen hero → approval queue (idempotency test). _Accept:_ trigger fires exactly once per milestone.

**E3. Onboarding & first-submit nudge.** New users not submitting within 48h → single Resend nudge. `onboarding_nudge_sent_at` on profile. _Accept:_ e2e; fires once; already-submitted users excluded.

**E4. Reporter reputation surfacing.** Public profile: gamification badges + "N verified incidents" + shareable OG card (`/profile/[id]/opengraph-image`). "Share your impact" button → pre-filled tweet. _Accept:_ bilingual; counts from published only; OG renders correctly.

**E5. SEO pass.** Incident structured data (Article/Report), related-incidents block, breadcrumbs, sitemap verification. _Accept:_ rich-results test passes on 3 samples.

**E6. Health check endpoint.** `/api/health` → DB + Upstash + last autopilot run status. _Accept:_ 200 OK; degraded when DB down.

**E7. Growth dashboard (admin).** `/admin/growth`:

- Daily signups (30d graph)
- Daily submissions (organic vs auto-import, 30d)
- Retention: % users with ≥2 incidents
- Funnel: page view → signup → first submit → second submit
- Data from Plausible + DB counts (no new tracking).
- _Accept:_ real data; bilingual; admin-only RLS.

---

## STAGE F — Academy & Expert Portal (hard deadline: Nov 15)

**F1. Expert review queue.** Approved experts see incidents awaiting verification in their discipline; actions: verify / annotate (`expert_fix` fields) / decline. Expert action upgrades incident to `expert_verified` + refreshes badges + API `verification_level`. _Accept:_ full flow with test expert; experts see only assigned scope (RLS).

**F2. Academy beta portal.** Read-only research library for approved academics: filtered incident explorer + CSV export (published, PII-masked only) under research-license notice. _Accept:_ export contains zero PII (seeded fake PII test).

**F3. "State of AI Incidents Q4" generator.** Script assembling live stats + top cases + taxonomy breakdown into Markdown/PDF draft for founder + expert co-authors. _Accept:_ draft cites only real DB numbers; founder approves before publication.

---

## STAGE G — Data Quality & Scale (continuous, when idle or F approved)

**G1.** Taxonomy coverage: ≥80% of imported incidents carry Art. 73 class; monthly coverage % report.
**G2.** Dedup sweep across corpus (near-duplicate titles/URLs) → admin merge tool.
**G3.** i18n completeness check script (missing TR keys fail CI).
**G4.** Monthly cost report: cross-audit spend, pre-triage skip rate, Imagen/Veo usage.

---

## STAGE H — Continuous Maintenance (standing)

Dependabot PRs: merge only after CI green (security patches same week; feature bumps batched weekly). Sentry triage weekly; recurring errors → fix tasks. `CHANGELOG.md` per release. **Never touch:** backlog-frozen surfaces (dilemmas, bounties, invest*, feed, newsletter), brand assets, legal copy, pricing amounts.

---

## 💡 I-SERIES — Innovation Pool (added in v7; PROPOSAL STATUS ONLY)

> Sourced from the July 2026 ecosystem scan. **None of these are approved for implementation.** Each graduates into a stage only with an explicit Architect approval line. The Executor may write feasibility notes in `docs/PROPOSALS/` but writes no code for them.

| ID  | Idea                                                                                                                                  | Why now                                                                                                       | Moat effect                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| I1  | **Incident Passport** — one-click export of an ALPAR incident in the Commission's official Art. 73 reporting-template field structure | Commission's draft template is public now; being format-compatible first = becoming the default drafting tool | Every exported passport carries ALPAR provenance |
| I2  | **ALPAR MCP server / LLM tool** — expose the incident API as a tool AI agents can query ("has this model had incidents?")             | Agent ecosystems are exploding; agents citing ALPAR = zero-CAC distribution                                   | Becomes infrastructure, not a website            |
| I3  | **Provider Response SLA badge** — free, embeddable "responds within X days" badge for providers with claimed profiles                 | Free giveaway that makes providers advertise ALPAR themselves                                                 | Two-sided lock-in                                |
| I4  | **Insurance/actuarial data feed** — anonymized incident frequency/severity by category for AI-liability underwriters                  | AI liability insurance is emerging with no loss-history data anywhere                                         | First loss-history dataset in the category       |
| I5  | **Browser extension** — one-click "report this AI output" capturing URL + screenshot into the submit flow                             | Cuts submission friction to near zero                                                                         | Volume growth engine                             |
| I6  | **Model drift watch** — track provider model-card/version changes, correlate with incident spikes                                     | Providers ship silent updates; nobody correlates them with failures                                           | Unique longitudinal dataset                      |
| I7  | **Research sandbox** — hosted notebooks over the PII-masked corpus for approved academics (extends F2)                                | Deepens university partnerships beyond CSV export                                                             | Academic citations = credibility flywheel        |
| I8  | **KVKK bridge** — TR-localized incident notification formatting for Turkish public institutions                                       | ALPAR's TR identity is a wedge no US competitor has                                                           | Home-market regulatory moat                      |

### 🌱 I-SERIES → Admin Panel Görünürlüğü (Antigravity görevi — M-series biter bitmez yap)

`strategy_innovations` tablosu ve `/admin/innovations` sayfası MEVCUT (`20260702000200_innovations.sql`; RLS: ceo/admin only). Yalnızca seed gerekiyor.

**Dosya:** `supabase/migrations/20260709000001_seed_i_series_innovations.sql`

Her satır ayrı `INSERT … WHERE NOT EXISTS` ile idempotent eklenir (title başına göre `LIKE 'IX —%'`).

| title                                                 | description (TR)                                                                                                                                                                                                                                   | priority | status |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| I1 — Incident Passport (Art. 73 resmi şablon çıktısı) | ALPAR kayıtlarını Komisyon'un resmi Art. 73 bildiri şablonu alanlarına tek tıkla dönüştürür. Taslak şablon kamuya açık; format uyumlu ilk platform olmak varsayılan hazırlık aracı olma fırsatı. Her dışa aktarılan pasaport ALPAR kökenini taşır. | high     | idea   |
| I2 — ALPAR MCP Server / LLM Aracı                     | Olay API'sini yapay zeka ajanlarının sorgulayabileceği bir araç olarak sunar. Ajan ekosistemi büyüyor; ALPAR'ı kullanan ajanlar sıfır CAC dağıtım kanalı. Platform altyapıya dönüşür.                                                              | high     | idea   |
| I3 — Sağlayıcı Yanıt SLA Rozeti                       | Talep edilmiş profilli sağlayıcılar için gömülebilir ücretsiz "X gün içinde yanıtlar" rozeti. Sağlayıcılar ALPAR'ı kendileri reklam eder. İki taraflı kilit.                                                                                       | medium   | idea   |
| I4 — Sigorta/Aktüeryal Veri Akışı                     | AI sorumluluk sigortacıları için kategori bazlı anonim olay sıklık/ağırlık verileri. Pazar büyüyor, zarar geçmişi yok. Kategoride ilk zarar verisi.                                                                                                | low      | idea   |
| I5 — Tarayıcı Eklentisi                               | URL + ekran görüntüsü yakalayarak submit akışına tek tıkla raporlama. Raporlama yükünü sıfıra yakın düşürür. Hacim büyüme motoru.                                                                                                                  | low      | idea   |
| I6 — Model Sürüklenme İzleme                          | Sağlayıcı model kartı/sürüm değişikliklerini izler, olay artışlarıyla ilişkilendirir. Sessiz güncellemeler yaygın; kimse başarısızlıklarla ilişkilendirmiyor. Benzersiz uzunlamasına veri.                                                         | low      | idea   |
| I7 — Araştırma Sanal Ortamı                           | PII maskelenmiş veri seti üzerinde onaylı akademisyenler için barındırılan not defterleri (F2 genişletmesi). Akademik alıntılar güvenilirlik vlanı oluşturur.                                                                                      | low      | idea   |
| I8 — KVKK Köprüsü                                     | Türk kamu kurumları için KVKK uyumlu yerelleştirilmiş olay bildirim biçimlendirmesi. ALPAR'ın TR kimliği hiçbir ABD rakibinin sahip olmadığı kama. Yerel pazar düzenleyici hendeği.                                                                | medium   | idea   |

**Dosya sonu zorunlu yorum (Standing Rule #12):**

```sql
-- ROLLBACK: DELETE FROM public.strategy_innovations WHERE title ~ '^I[1-8] —';
```

**Accept kriterleri:**

- `/admin/innovations` sayfasında tam 8 I-serisi kaydı görünür
- Anon kullanıcı bu kayıtları görmez (RLS korumalı)
- Migration dosyası rollback yorumu içerir
- Doğrulama sorgusu: `SELECT title, priority, status FROM public.strategy_innovations WHERE title LIKE 'I% —%' ORDER BY title;`

---

## 🧠 J-SERIES — Founder Strategic Questions (v7.6 — answered 2026-07-11)

> Founder asked 4 root-cause questions. Each gets an honest diagnosis + a concrete proposal. Proposals marked **QUEUE** become work-queue items; proposals marked **I-SERIES** enter the innovation pool for future staging.

---

### J1 — "Neden elimizdeki 409 olayı, datayı işlemiyoruz?"

**Root cause (3 blockers, in order):**

1. **`generate-marketing` cron unregistered in `vercel.json`** → the content-generation pipeline that would turn incident data into newsletter/digest/social copy runs zero times in production. V2 fix (Jul 9) unblocks this. **This is the #1 blocker.**
2. **409 incidents ≈ 405 seed + 4 organic** (H-series honesty pass reveals this). Most seeds lack `cross_audit_score`, `source`, or provider linkage — they were batch-inserted without running the cross-audit engine. Displaying them as "processed" is misleading.
3. **No retrospective re-audit pipeline** — the cross-audit engine is wired for new submissions only. Seeded incidents never ran through AI scoring, TruthScore calculation, or source validation.

**What to do:**

- **V2** (QUEUE — Jul 9, already in queue): register cron → content pipeline unlocks immediately.
- **H1–H3** (QUEUE — already in queue): badge + copy fix → set honest expectations.
- **J1a** (I-SERIES PROPOSAL — post-launch, Aug 10+): **Retrospective Batch Auditor** — background cron that re-audits seeded incidents in order of `created_at` DESC, 10/day, at off-peak hours. **Superseded by K-series below (v7.10):** the "cross-audit engine" J1a refers to already exists (`src/lib/ai/cross-audit-engine.ts` + `openrouter-gateway.ts`) with 5 wired free-tier providers — J1a is not new infrastructure, it's a scheduling problem. See K-SERIES for the concrete wiring, cost model ($0, not $5/day — free tier, not paid), and the mandatory seed-only safety boundary.

---

### J2 — "Neden bütün mailleri otomatik tarayıcı ajan ile veya gmail entegrasyonu ile yapmıyoruz?"

**Root cause (honest):** Resend handles transactional email (confirmation, alerts) but there's no outbound campaign agent or inbound-tracking integration. All journalist/grant/partner outreach is manual.

**Two distinct use cases with different solutions:**

**A) Outbound campaign email** (journalist pitches, grant follow-ups, partner outreach):

- **J2a** (I-SERIES PROPOSAL): **Outreach Queue Agent** — admin panel outreach hub (B-extra.2, already shipped as `f4cd43b`) gets a Playwright/browser-agent layer. Founder writes a template once; agent personalizes + sends via Resend with HMAC-signed unsubscribe footer (reuses U1/U2). Standing Rule #6 preserved: every send still needs an approved queue item — agent executes, not decides. Rate cap: 50/day.
- **Pre-condition:** U1 (unsubscribe endpoint) MUST ship first — illegal to send campaign mail without one-click unsub.

**B) Inbound tracking** (replies from journalists, grant agencies, partners):

- **J2b** (I-SERIES PROPOSAL): **Gmail Read Integration** — OAuth2 Gmail read-only scope (no send), watches a dedicated `outreach@alparai.com` inbox, extracts reply sentiment + entity → logs into the outreach hub's `outreach_logs` table. No PII stored beyond sender domain + reply status. Triggers admin notification on positive reply. _Note: Gmail MCP server exists in this environment but requires OAuth flow — requires founder authorization first._
- **Blocking factor:** Gmail MCP OAuth not yet authorized for this session. Founder authorizes via claude.ai connector settings → agent can then read inbox programmatically.

**Priority verdict:** J2a is higher priority (zero new auth needed, builds on shipped infrastructure). J2b is powerful but requires founder OAuth step first.

---

### J3 — "Neden bütün devlet desteklerine tarayıcı üzerinden yapmıyoruz?"

**Root cause:** Zero coverage in any plan version. Government grant applications were never planned.

**Opportunity map (TR + EU):**

| Program                          | Relevance                | Deadline pattern | Fit                              |
| -------------------------------- | ------------------------ | ---------------- | -------------------------------- |
| TÜBİTAK 1512 (Teknogirişim)      | Pre-seed up to ₺3M       | Rolling / 2× yr  | Strong — AI safety + public data |
| KOSGEB Dijital Dönüşüm           | SME digital              | Rolling          | Medium                           |
| İSTKA Yenilikçi Girişim          | Istanbul-based           | Annual           | Strong — EU AI Act alignment     |
| EU Horizon Europe (ICT-50)       | AI governance research   | Annual Mar/Sep   | Very strong — Art. 73 angle      |
| EU Digital Europe Trustworthy AI | AI safety infrastructure | Biannual         | Very strong                      |

**J3a** (I-SERIES PROPOSAL — medium priority, post-launch): **Grant Radar + Application Agent**

- Phase 1 (research, 1 day): Playwright browser agent scans TÜBİTAK, KOSGEB, İSTKA, EU Funding Portal weekly; extracts deadline, eligibility, required docs → stores in `grant_opportunities` table (admin-only).
- Phase 2 (application, founder-driven): Admin panel shows ranked opportunities with ALPAR's fit score. Founder selects → agent pre-fills PDF/online forms using the platform's existing ARCHITECTURE.md, API.md, metrics data. Human submits — agent never submits autonomously.
- **Critical rule:** Agent pre-fills, founder submits. No autonomous form submission. Government portals have CAPTCHAs and legal attestations that require human sign-off.
- **Start after Aug 10** — pre-launch the team is zero-bandwidth for grant ops.

---

### J4 — "Neden sistemdeki AI API keylerini verimli şekilde kullanmıyoruz?"

**Root cause (5 gaps, in severity order):**

| Gap                                | Current state                                                                          | Risk/Cost                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Plain-text storage**             | `api_keys` table: `api_key TEXT`                                                       | Leak = all provider accounts compromised |
| **No usage metering**              | Cross-audit fires 6–8 API calls/incident; no per-model cost log                        | Cost spike invisible until bill arrives  |
| **Flat model selection**           | Same model tier for every incident regardless of complexity                            | 10× overspend on simple/short incidents  |
| **No per-provider budget ceiling** | One provider rate-limit doesn't trigger failover                                       | Single-point cost explosion              |
| **No batch processing**            | Each incident processed individually; OpenAI/Anthropic support batches at 50% discount | Seed re-audit at full price              |

**Fixes (ordered by ROI):**

- **C1a** (QUEUE — Jul 15, already queued): sha256 migration + tier + client_type columns → **plain-text gap closed.**
- **J4a** (QUEUE — add to work queue, post-freeze Aug 10): **Dynamic Model Router** — replace hardcoded model selection in the cross-audit engine with a router that picks model by incident complexity: short description (<50 words) → Gemini Flash / GPT-4o-mini ($0.15/M); medium → Claude Haiku 4.5; long/high-risk → Claude Sonnet 5 / GPT-4o. Estimated 60–70% cost reduction on typical submission volume. _Implementation:_ single function `selectModelTier(incident: Incident): ModelConfig` in `src/lib/audit/model-router.ts`; cross-audit engine calls it instead of hardcoded config.
- **J4b** (QUEUE — add to work queue, post-freeze Aug 10): **Batch Re-audit** for J1a seed backlog — uses OpenAI Batch API (50% discount) or Vertex batch prediction. Processes 100 seeds/batch at off-peak. Requires J1a approved first.
- **C3** (already in queue, post-freeze): usage metering → per-call cost logging.
- **C4** (already in queue, post-freeze): tier rate limiting → per-key daily budget caps.

**Standing Rule #20** (cost alarm at $50/$100/day) already provides the safety net. J4a model router is the highest-ROI new item: reduces spend before the alarm threshold is needed.

---

## 🤖 K-SERIES — Free-Tier Cross-Model Ethics Interrogation (v7.10)

> Founder's request: use the free-tier quotas of the API keys already in the system, have models cross-question each other for ethics testing, and use the 409-incident backlog as the source material. **Code audit confirms the mechanism already exists** — it's a wiring gap, not a build gap.

**What's already built (`src/lib/ai/openrouter-gateway.ts` + `cross-audit-engine.ts`):**

- **5 free-tier providers wired with circuit-breaker failover:** OpenRouter (`deepseek/deepseek-chat`, `meta-llama/llama-3.3-70b:free`, `qwen/qwen-2.5-72b:free`), Google Gemini (`gemini-1.5-flash`), Cohere (`command-r`), HuggingFace (`Llama-3.3-70B-Instruct`), Blackbox — organized into `TRIAGE_SLOT_1/2/3_CHAIN` (each slot fails over across all 5 providers if one is rate-limited).
- **A 4-stage cross-questioning debate already runs per-incident:** `runInitialEvaluation` → `runChallenge` (one model interrogates another's evaluation) → `runRebuttal` → `runSupremeCourtAdjudication` (premium tier: `gemini-1.5-pro` / `claude-3.5-sonnet` / `gpt-4o` as final judge). This **is** the founder's "models ask each other questions to ethics-test" mechanism.
- **The gap:** this pipeline (`runCrossAudit`) only fires on new submissions. It has never been pointed at the 405 seed incidents.

**K1 — Provider Coverage Audit (do first, ~1h):** Confirm all 5 provider keys are actually present in `api_keys` (via `resolveApiKey`, post-C1a sha256). `ENABLE_BLACKBOX_PROVIDER` flag state must be a deliberate choice, not an accident. A missing key silently shrinks a triage slot's failover chain from 4 options to 3 — verify via `isConfigured()` per adapter; surface as a status row in the existing admin panel (no new page).

**K2 — Free-Tier-Only Batch Scheduler (this IS J1a, correctly specified):** Cron processes 10 seed incidents/day through `TRIAGE_SLOT_1/2/3_CHAIN` **only** — the premium Supreme Court stage is skipped for seed re-audit (cost stays **$0**, not $5/day-capped, because free tier has no marginal cost). Stagger calls across the day to respect each provider's free RPM/RPD ceiling (OpenRouter free ≈20/min, Google AI Studio free ≈15/min·1500/day, Cohere trial ≈20/min) — round-robin across the 3 slots rather than hammering one chain.

**K3 — Seed-Only Boundary (non-negotiable, reporter safety):** Free-tier cross-interrogation runs **only** on `incident_source IN ('aiaaic_import','aiid_import')` — already-public imported incidents. **Never** on `user_submitted` (organic whistleblower reports): several free tiers' ToS permit prompt-retention/training on free traffic, and a whistleblower's raw account is not the seed-import's already-public dataset. This boundary is stricter than PII Guardian alone — it's a source-type gate enforced before the request ever reaches the gateway.

**K4 — Audit-Tier Provenance:** add `audit_tier: 'free' | 'paid'` to the incident's audit metadata so a seed incident audited only by free-tier models is never displayed with the same confidence as an organic incident that went through the paid Supreme Court stage. Extends Standing Rule #19 (numeric-claim honesty): "free-tier audited" ≠ `expert_verified`.

**K1–K4 = K-CORE.** These are the substrate (providers, scheduler, safety boundary, provenance). Everything below runs on top of them.

**Accept criteria (K-CORE):** 50 seed incidents carry `audit_tier='free'` + a populated `cross_audit_score` by Sep 1; zero `user_submitted` rows touched by the free-tier scheduler (verify via query); provider coverage status visible in admin; $0 spend attributable to K2 in the weekly cost summary (Standing Rule #20).

---

### 🎯 K-BENCHMARK — Multi-Category AI Model Rating Platform (v7.11)

> **Strategic reframe:** the founder's request "not just ethics — hallucination, quality, math, etc." graduates K5 from "flagged for Horizon" into a **program**: ALPAR runs the same 5-provider cross-interrogation across 8 evaluation categories and publishes model ratings. **This is the concrete form of ALPAR's Moody's-for-AI positioning** — the incident registry earns credibility, the benchmark earns dependency. Combined, they make ALPAR unavoidable when Art. 73 goes live.

**Design principle:** every category = same K-CORE pipeline, different (a) question bank, (b) rubric prompt, (c) scoring dimension. Adding a category is a config change plus a seeded question bank, not a new engine. This keeps the surface small even as coverage grows.

**Category ladder (8 total, ordered by ALPAR-differentiation ROI):**

| ID      | Category                        | Question bank source                                                                                              | Why it wins for ALPAR                                                             | Phase         |
| ------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------- |
| **K5**  | **Ethics / Safety** (original)  | The 409 AI-incident seed backlog — real-world scenarios, not synthetic — plus a curated adversarial jailbreak set | Nobody else grounds ethics tests in a real incident registry. This IS the moat.   | **MVP**       |
| **K6**  | **Hallucination / Factuality**  | TruthfulQA (public) + 200 Turkish-context factual claims curated by us                                            | Turkish factuality is under-benchmarked; global TruthfulQA gives us comparability | **MVP**       |
| **K7**  | **Turkish Language Competence** | MMLU-TR (translated + verified) + a bespoke TR legal/medical/regulatory prompt set                                | Nobody benchmarks TR seriously. This owns the TR market.                          | **MVP**       |
| **K8**  | **EU AI Act Reasoning**         | 120 Art. 73 hypothetical scenarios curated by us against the taxonomy in `docs/EU_AI_ACT_TAXONOMY.md`             | Nobody has this. Direct wedge into 2027 Dec 2 moment.                             | **MVP**       |
| **K9**  | **Math / Reasoning**            | GSM8K + MATH (public)                                                                                             | Comparability to standard leaderboards; commodity but essential                   | Full platform |
| **K10** | **Instruction Following**       | IFEval (public)                                                                                                   | Cheap to run, industry-comparable                                                 | Full platform |
| **K11** | **Robustness / Adversarial**    | Jailbreak dataset + prompt-injection corpus                                                                       | Direct tie to K5 ethics — shared question bank, different rubric                  | Full platform |
| **K12** | **Long-Context Retrieval**      | Needle-in-haystack, adapted for context windows ≥32k                                                              | Standard capability check                                                         | Full platform |

**Rating output (public):**

- `/ratings/{model-slug}` page: category scores (0–100), overall composite, category strength/weakness callouts, last-audited date, sample-size disclosure
- `/ratings` leaderboard: filterable by category, provider, tier (free vs paid), release date
- Public JSON API `/api/v1/ratings/{model}` — feeds the future Reporting Assistant and third-party integrators
- **Methodology page** (`/methodology/benchmarks`) with question-bank composition, evaluation rubric, cross-model debate transcripts (redacted where prompts are proprietary) — this earns academic credibility

**Scoring architecture (extends K-CORE):**

- **Each category has a scorer prompt** stored in `src/lib/benchmarks/categories/{k5,k6,…}.ts` — a plain TypeScript module exporting `{ id, name, rubric, extractScore }`. Adding K13 = one new file + one config row.
- **Cross-model rubric:** the same debate mechanism (evaluate → challenge → rebut → adjudicate) runs on each answer. This is unique — nobody else runs multi-model adjudication on benchmark answers; they just compare raw outputs. Multi-model adjudication is the methodological differentiator.
- **Statistical rigor:** minimum 100 questions per category per model per run; Wilson score interval reported alongside every rating; re-audit trigger when model version changes (K6 ties to J6 — model drift watch).

**Safety boundaries (extend K3 seed-only rule):**

1. Benchmark runs **never** touch `user_submitted` incidents (K3 preserved verbatim).
2. Question banks with proprietary/licensed content stay server-side; only aggregate scores + non-derivable examples are published.
3. Adversarial/jailbreak prompts (K11) run under a separate feature flag (`ENABLE_ADVERSARIAL_BENCHMARK`) with rate-limit + admin-only trigger — no scheduled adversarial runs, no automated pipeline. **The founder must authorize each adversarial run manually** (prevents provider ToS violations from automated jailbreak attempts).
4. Model providers get a **60-day heads-up** before a new rating publishes for their model (industry standard — avoids "surprise attack" positioning; keeps the door open to enterprise conversations).

**Phase plan (respects launch discipline):**

| Phase                   | Window          | Deliverable                                                                                                                                 |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **K-CORE**              | Aug 10 – Aug 25 | K1–K4 shipped; seed re-audit running silently                                                                                               |
| **K-MVP** (K5+K6+K7+K8) | Aug 26 – Sep 15 | 4 categories live; `/ratings` page + methodology doc published; opening blog post pitched to press                                          |
| **K-Full** (K9–K12)     | Sep 16 – Dec 15 | 4 more categories; public JSON API v1; academic partnership outreach begins (F2 tie-in)                                                     |
| **K-Product** (2027 Q1) | Jan – Mar 2027  | Ratings integrated into Compliance Readiness Dashboard; enterprise/paid tier with per-model alerts, private benchmarks, white-label reports |

**Cost model:** all 8 MVP categories run on K-CORE's free-tier chains. Estimated spend at MVP: **$0**. Estimated spend at K-Full with 30 models × 8 categories × 100 questions × 4 debate stages = 96k free-tier calls/quarter, well inside combined provider free quotas (OpenRouter free ≈no daily cap but per-model RPM; Google AI Studio ≈1500/day; Cohere trial ≈10k/month). Scheduler enforces daily budgets per provider so no single quota blocks a run.

**Founder decisions required (before K-MVP starts, Aug 25):**

1. **Model roster for MVP.** Recommendation: top 15 models by public API access (GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet, Claude Haiku, Gemini 1.5 Pro/Flash, Llama 3.3 70B, Qwen 2.5 72B, DeepSeek Chat, Mistral Large, Command R+, Grok-2, plus 3 open-source finalists). Founder confirms or edits.
2. **Publication cadence.** Recommendation: weekly re-audit → `/ratings` updates weekly. Founder can choose bi-weekly if free-tier quotas tighten.
3. **60-day pre-notification recipient list.** Founder provides the "notify before publishing rating" contact per provider (Anthropic, OpenAI, Google, Meta, etc.); Executor drafts a template email.
4. **K11 adversarial authorization workflow.** Recommendation: no adversarial runs until at least Dec 2026 (after MVP proves credibility); when enabled, single-click admin trigger with legal-team pre-review. Founder confirms.

**Accept criteria (K-MVP):** 4 categories live at `/ratings`; 15 models rated in each; methodology page published; opening announcement blog live; zero `user_submitted` data used; zero paid-API spend attributable to K-MVP.

**What K-BENCHMARK is NOT:**

- Not a replacement for LMSYS Chatbot Arena — that's crowdsourced preference; we're rubric-graded on structured categories.
- Not a real-time SaaS competitive with Vellum/Braintrust — those are eval tools for builders; we are a **public independent rater** (Moody's, not GitHub).
- Not a hardened AI safety red-team (yet) — K11 is a limited robustness surface, not a full red-team program.

---

## 👥 L-SERIES — Human Capital & Academic Network (v7.12)

> **Stratejik konum:** ALPAR'ın Moody's konumu üç bacaklı — **(a) Veri** (incidents) → **(b) Yöntem** (K-BENCHMARK, TruthScore) → **(c) İnsanlar** (L-series). İlk ikisi kod; üçüncüsü ilişki. Rakipler (OneTrust, Prediction Guard) veri + yöntem yapabilir; **isim listesi** yapamaz — bunun için 6 ay + 100 telefon lazım. L-series bu ilişki katmanını sistemli inşa eder.

### L1 — Danışma Kurulu (Advisory Board) — 🔴 PRE-LAUNCH KRITIK YOL

Founder recruits 5-7 named experts by **Jul 30** (Aug 2 launch'ta duyurulur):

| Koltuk | Profil                                                                         | Neden                              |
| ------ | ------------------------------------------------------------------------------ | ---------------------------------- |
| 1      | Hukuk (TR) — KVKK + EU AI Act uzmanı avukat / hukuk profesörü                  | Türkiye pazar hendeği              |
| 2      | Hukuk (EU) — AI Act şerh yazarı Avrupalı hukukçu                               | 2027 Aralık konumu                 |
| 3      | CS / AI Safety — yayınlı Türk veya EU profesör                                 | K-BENCHMARK rubric onayı           |
| 4      | Etik / STS — AI etiği veya STS akademisyeni                                    | K5 etik kategorisi güvenilirliği   |
| 5      | Sektör pratisyeni — büyük tech'te AI risk / güvenlik lideri (kişisel kapasite) | Provider dünyasında güven          |
| 6      | Gazeteci — tech ethics beat'inde kıdemli                                       | Basın erişimi + hikaye çerçeveleme |
| 7      | KVKK / regülatör — KVKK Kurumu eski çalışanı veya benzeri                      | Compliance konumu                  |

**Yapı:** kişisel kapasite (kurumları bağlamaz), 1 yıl dönme, yılda 2 sanal toplantı, ücret **yok** (equity yok — nötr konum için önemli), sadece yıllık $500 "araştırma bursu" (nominal). İsim + kısa biyografi + fotoğraf `/about/advisory-board` sayfasında. Yeni migration `advisory_board_members` tablosu (RLS: herkes okur; sadece admin düzenler).

**Süreç:** Executor Jul 12'de aday listesi taslar (LinkedIn + Google Scholar + üniversite sayfaları taraması — J2a-benzeri Playwright agent). Founder Jul 15'e kadar 15 aday seçer, Jul 20'ye kadar davetler gider, Jul 30'a kadar 5+ kabul gelir.

**Risk azaltma:** Jul 30'da 3'ten az kabul → launch iptal edilmez; "Danışma Kurulu Duyurusu Sep 1" olarak yeniden çerçevelenir. Launch bu bağımlılığa **kilitlenmez**.

### L2 — Üniversite İşbirlikleri (MOU) — **P0 post-launch**

Formal Memoranda of Understanding.

- **TR öncelik:** Boğaziçi CmpE, ODTÜ CENG (Bilkent, Sabancı, Koç yedek)
- **EU öncelik:** TU Delft AI Ethics, ETH Zürich AI Center, TU Munich, KU Leuven CiTiP, LMU Munich

MOU iskeleti: (a) PII-maskeli veri seti araştırmacılara ücretsiz erişim (I7 Research Sandbox uzantısı), (b) yılda 1 ortak yayın hedefi, (c) öğrenci staj/tez pipeline'ı, (d) karşılıklı adres/hesap. Executor MOU şablonu + `outreach_logs` içinde `university_mous` kanalı hazırlar; founder yürütür.

_Kill/pivot:_ L2 kickoff'undan 12 hafta sonra hiç MOU yoksa → L6 (faculty fellowship) tetikleyici olarak strateji değişir: üniversitelere para → onlar bize adres.

### L3 — Genişletilmiş Uzman Doğrulama Ağı (F1++)

F1 Expert Portal zaten planlı — L3 onu **dağıtık uzman ağı**na dönüştürür. Platformda oturan uzmanlar + **~30 alan uzmanı** email ile davet edilir. Her uzman haftada 3–5 olay doğrular (kategori: sağlık AI, otonom araç, işe alım yanlılığı, TR yasal, EU regülasyon).

**Motivasyon modeli:**

- **Rep-tabanlı** (varsayılan): açık leaderboard — "En çok doğrulama yapan uzmanlar 2026". Ücret yok.
- **Sembolik ücret** (opsiyonel — founder kararı): €20/doğrulama, yılda maks. €500/uzman. TR: freelance faturası; EU: cross-border vergi.

**Standing Rule tetikleyici:** `expert_verified = true` yalnızca L3 ağının bir üyesi tarafından işaretlenebilir — Standing Rule #19 buna genişletilir (aşağıda #22 olarak).

### L4 — Profesyonel Dernek Ortaklıkları

Speaking + email duyurusu + karşılıklı içerik alışverişi:

| Kurum                                                               | Değer                   |
| ------------------------------------------------------------------- | ----------------------- |
| TÜBA (Türkiye Bilimler Akademisi)                                   | Akademik meşruiyet      |
| İstanbul Barosu AI Komitesi                                         | Hukuki topluluk erişimi |
| IEEE Turkey / ACM Turkey Chapter                                    | Mühendis kitle          |
| Alternatif Bilişim, Yeşil Ekonomi Derneği (dijital haklar STK'ları) | Sivil toplum güveni     |
| EU AI Alliance                                                      | AB kurumlarına erişim   |

Executor iletişim listesi + davet mektubu şablonu hazırlar; founder telefonları açar.

### L5 — Üniversite Ders Entegrasyonu

"AI Ethics / AI Safety / Data Ethics" derslerini hedefle:

- Ücretsiz **eğitmen hesabı** (`role = 'instructor'` yeni tier)
- **Küratörlü olay paketi** — kategoriye göre 20–30 olay + tartışma soruları PDF
- **Ödev şablonları** — "Bu olayı Art. 73 taksonomisine haritala"
- **Dönem başı email** — akademik takvim (Eylül, Ocak, Şubat) ile senkronize

Bir ders → 30–100 öğrenci markaya maruz kalır → mezuniyet sonrası iş yerlerinde ALPAR'ı tekrar getirir. Uzun kuyruk.

### L6 — Öğretim Üyesi Bursu (Faculty Fellowship)

Yılda 5 profesör × $2000 = **$10k/yıl** bütçe. Kriter: ALPAR verisi kullanarak peer-reviewed makale, konferans bildirisi veya alan raporu yayınlamak. Denetim: dış editör kabul kanıtı.

**ROI:** 1 makale = 5–20 atıf/yıl; 5 makale × 3 yıl = 75–300 akademik atıf. Bu, K-BENCHMARK'ın "methodology attack" risk kaleminin en kalıcı savunma hattı.

### L7 — Öğrenci Elçi Programı

Her büyük üniversitede 2–5 lisans/yüksek lisans öğrencisi. Ücretsiz + rep-tabanlı (yıllık en iyi elçi: LinkedIn öneri + $500 ödül). Görev: kampüs etkinliği, olay katkısı, sosyal medya organik büyüme. `student_ambassadors` tablosu + admin CRUD (post-launch Sep+).

### L8 — Profesyonel Kullanıcı Katmanları

Farklı iş rolleri farklı UI ister. Q1 2027 CRD (Compliance Readiness Dashboard) genişletmesi:

- **AI Compliance Officer** görünümü: uyum takvimi, provider profil takibi
- **Gazeteci** görünümü: yeni olay uyarıları (konu filtresi), doğrudan uzman iletişimi
- **Hukuk pratisyeni** görünümü: dava-benzeri olay arama, taksonomi filtresi, PDF ihracı
- **AI Güvenlik Ekipleri** görünümü: benchmark alerts (K-Product), kendi model karşılaştırması

Her katman `role_view` tercihi + varsayılan dashboard.

### L9 — Yöntem Danışma Komitesi (Methodology Advisory Committee)

L1 kurulundan farklı: 3–5 kişilik **teknik** komite. Yılda 1 kez TruthScore + K-BENCHMARK rubric'lerini bağımsız gözden geçirir, kamu raporu yayınlar. Bu, 2027 Horizon'daki "methodology audit" satırının somut hali. Üyeler L1'den ayrı olmalı (çakışma riski). **P0** — K-MVP çıktıktan sonra en erken saldırı yüzeyi metodoloji olduğu için önemi bu noktada zirve yapar.

_Rapor değişiklik gerektirirse:_ Executor migration yapar; komite raporu `docs/METHODOLOGY_AUDITS/YYYY.md` altına kalıcı yayınlanır.

### L10 — Peer-Reviewed Yayınlar

Founder + Architect (Claude eş-yazar) tarafından hedeflenmiş konferanslar:

- **ACM FAccT** — deadline Ocak
- **AIES** (AAAI/ACM AI Ethics and Society) — deadline Şubat
- **NeurIPS Datasets & Benchmarks track** — deadline Haziran (K-BENCHMARK için ideal)
- **ICML AI Safety Workshops** — yıllık

_İlk hedef:_ **NeurIPS 2027 D&B — K-BENCHMARK metodoloji makalesi.** Kabul edilirse dataset citation'ı ile kalıcı akademik kabuk.

### L-Series → Work Queue Additions

| #   | İş                                                                                                                                             | Faz                                                                                            | Öncelik        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------- |
| 44  | **L1** — Advisory board recruitment (Playwright aday tarama + davet template + `advisory_board_members` tablo + `/about/advisory-board` sayfa) | **PRE-LAUNCH MUST**, Jul 12–30                                                                 | HIGH           |
| 45  | L2 — University MOU template + outreach list                                                                                                   | **P0** — L1 kabul isimleri elde olur olmaz (isimler kapı açar)                                 | HIGH           |
| 46  | L3 — F1 Expert Portal + email-invite ağ + rep leaderboard                                                                                      | **P0** — launch akabinde ilk iş; L1 kabul isimlerinden L3 uzmanları çekilebilir                | HIGH           |
| 47  | L4 — Professional association outreach list + partnership template                                                                             | **P1** — L1 duyurusundan sonra (isimler dernek erişimini kolaylaştırır)                        | MEDIUM         |
| 48  | L5 — Instructor tier + course pack CMS + assignment templates                                                                                  | **P1** — akademik dönem başlangıcı fırsat penceresi; L2 first MOU sonrası öncelik yükselir     | MEDIUM         |
| 49  | L6 — Faculty fellowship program page + application form + admin review                                                                         | **P1** — L2 MOU'lardan sonra (fellow adayları MOU üniversitelerinden gelir)                    | MEDIUM         |
| 50  | L7 — Student ambassador program + `student_ambassadors` tablo + admin CRUD                                                                     | **P2** — L2 MOU'lardan sonra (elçiler MOU üniversitelerinden)                                  | LOW            |
| 51  | L8 — Role-based dashboard views (compliance/journalist/legal/safety)                                                                           | **P0** — CRD ürünleşmesi ile aynı sprint (revenue path)                                        | HIGH (revenue) |
| 52  | L9 — Methodology Advisory Committee formation + annual audit doc                                                                               | **P0** — K-BENCHMARK MVP tamamlanır tamamlanmaz (metodoloji saldırısı en erken burada gelir)   | HIGH           |
| 53  | L10 — Peer-review pipeline (paper draft → conference submissions)                                                                              | **P0** — K-BENCHMARK MVP verisi eldeyken taslak başlar; ilk hedef FAccT (deadline yıllık Ocak) | HIGH           |

---

## 🌍 v7.13 EKOSİSTEM HIZ DEĞERLENDİRMESİ (360°)

> **Kural değişimi:** "2027'de yaparız" AI dünyasında "yapmayız" demek. Her kritik hattı 2026 H2'ye sıkıştırdık — sebebi aşağıda.

**AI ekosistemi Temmuz 2026 durumu:**

| Boyut                          | Gerçeklik                                                                       | ALPAR sonucu                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Frontier model çıkışı          | Her 3-4 ayda bir major model (GPT-5, Claude Opus 4.8, Gemini 2.5)               | K-BENCHMARK haftalık re-audit zorunlu (Q4 daha güncel model roster'ı)                    |
| EU AI Act Art. 73              | 17 ay uzakta (Dec 2, 2027)                                                      | Metodoloji **11 ay önce** kanıtlanmış olmalı ki Art. 73 anına referans olarak girsin     |
| Ulusal AI Safety Institute'ler | UK AISI, US AISI, Japan AISI operasyonel; TR'de YOK                             | ALPAR **fiili TR AISI** rolünü kapabilir — N4 white paper acil                           |
| OECD AI Incidents Monitor      | Operasyonel (oecd.ai) — 400+ kayıt                                              | Rekabet DEĞİL, ortak — N2 entegrasyon fırsatı                                            |
| Standards bodies               | ISO/IEC JTC 1/SC 42, CEN-CENELEC JTC 21, NIST AI RMF aktif                      | Katkı = kalıcı meşruiyet — N3                                                            |
| Rakip olay kayıtları           | AIID (MIT, güçlü akademik), Stanford AI Index (yıllık), IncidentsDB startupları | TR + Art. 73 dikey konumla yarışma dışı, ama global mainstream girme penceremiz **6 ay** |
| Rakip rating platformları      | Chatbot Arena (LMSYS, 2M+ oy), Artificial Analysis, Vellum evals                | K-BENCHMARK çok-model çapraz sorgu ile yöntemsel fark; ama arayüz 6 ayda kopyalanır      |
| Compute maliyet trendi         | Frontier inference maliyeti yıllık %10× düşüyor                                 | Free-tier K-BENCHMARK varsayımı Q4 2027'de zayıflar (paid tier daha erken devreye gerek) |
| Türkiye AI ekosistemi          | Neredeyse rakip yok, ancak akademik ilgi hızla artıyor                          | 12 ay **erken hareket eden avantajı** var; 18 ayda kapanır                               |

**Büyüme hızı sonucu:** ALPAR'ın 2027 Aralık'ta değil, 2026 Aralık'ta akademik/uzman meşruiyetini kanıtlamış olması gerekir. 12 ay compounding = 4× büyüme farkı.

---

## 🏛️ N-SERIES — National & Regulatory Ecosystem Integration (v7.13, YENİ)

> **Boşluk:** L-series akademiyi ve uzmanları kapsar ama **düzenleyici + standardizasyon + ulusal AI güvenlik** katmanı yoktu. Bunlar 3 aylık pencere fırsatları, 3 yıllık moat üretir.

### N1 — OECD AI Incidents Monitor Entegrasyonu

OECD'nin resmi olay izleme projesi (oecd.ai). Halihazırda 400+ kayıtla. **ALPAR bir kaynak beslemesi olarak eklenirse**: her onaylı ALPAR olayı OECD monitörüne otomatik gider (JSON feed, WebSub veya periyodik CSV). Karşılık: OECD sayfasında ALPAR atıfı = uluslararası akademik/regülatör görünürlük.

**Antigravity iş:** `/api/v1/oecd/feed` endpoint (OECD şemasına uyumlu), taksonomi haritası (`docs/OECD_TAXONOMY_MAP.md`), OECD sekreterlik iletişim (founder yürütür).
**Öncelik:** **P0** — H-serisi honesty pass biter bitmez (`incident_source` alanı OECD feed'inin ön koşulu).

### N2 — UK AISI + US AISI Diyaloğu

Her ikisi de operasyonel resmi AI güvenlik enstitüleri. Ne satarız? **K-BENCHMARK ham çıktı verisi** (kendi test setlerinin doğrulaması için), **incident registry** (kendi risk sınıflaması için referans veri).

**Founder iş:** LinkedIn + resmi email kanallarıyla iletişim başlangıcı; ilk toplantıda "bize entegre etmenizi teklif etmiyoruz, sadece TR bakış açısını görmek ister misiniz?" konumlaması.
**Öncelik:** **P1** — L1 danışma kurulu duyurusundan sonra (kurul isimleri kapı açar).

### N3 — Standards Body Katkısı (ISO/IEC JTC 1/SC 42, CEN-CENELEC JTC 21)

EU AI Act uyumluluğu için CEN-CENELEC JTC 21 harmonize standartlar yazıyor (2027 Aralık'ta zorunlu olacak). ISO/IEC SC 42 uluslararası taban. **Katkı fırsatı:** ALPAR taksonomisi + methodology'sini working draft'lara feed olarak sun.

**Founder iş:** TSE (Türk Standartları Enstitüsü) üzerinden JTC 21'e katılım başvurusu — TSE Türkiye'nin ulusal komitesi. TÜBA aracıyla giriş kanalı olabilir (L4 çakışması).
**Antigravity iş:** `docs/STANDARDS_SUBMISSIONS/` dizini + submission templates.
**Öncelik:** **P0** — TSE başvurusu iletişim süreci uzun olduğu için ilk hareketleri hemen başlat; ilk submission K-BENCHMARK MVP verisi hazır olduğunda yapılabilir.

### N4 — TR AI Safety Institute White Paper

**Fırsat:** Türkiye'nin **yapay zeka güvenlik enstitüsü YOK**. UK, US, Japonya, Fransa var. Cumhurbaşkanlığı Dijital Dönüşüm Ofisi (CBDDO) + Sanayi ve Teknoloji Bakanlığı bir enstitü kuracaksa, ALPAR **fiili referans uygulama** olabilir.

**Founder iş:** 20-30 sayfa profesyonel white paper: (a) TR AISI ihtiyacı, (b) uluslararası model karşılaştırması, (c) ALPAR'ın mevcut altyapısının nasıl temel oluşturabileceği, (d) 12 aylık kuruluş yol haritası önerisi. Yayın: CBDDO + TÜBİTAK + TÜBA + Sanayi Bakanlığı'na formal dosyalama + kamu yayını (SSRN, resmî ALPAR yayın sayfası).
**Antigravity iş:** taslak iskelet, veri grafik üretimi (K-BENCHMARK istatistikleri, olay dağılımları), atıf yönetimi.
**Öncelik:** **P0 — kritik pencere.** Launch akabinde ilk 8 haftada tamamlanır; TR AISI kurumsallaşma haberi çıkmadan önce ALPAR raf üzerinde olmalı (pazarlanacak fikir olmadan gelen kurum, ALPAR'ı görmezden gelir). Bağımlılık: L1 kurul isimleri paperın imza kısmında görünmeli.

### N-Series → Work Queue

| #   | İş                                                                      | Faz                                                          | Öncelik |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------ | ------- |
| 54  | **N1** — OECD AI Incidents Monitor feed endpoint + taksonomi haritası   | **P0** — H-serisi bittikten sonra                            | HIGH    |
| 55  | **N2** — UK/US AISI iletişim + tracker + MoU template                   | **P1** — L1 kurul duyurusundan sonra                         | MEDIUM  |
| 56  | **N3** — Standards body katkısı (ISO/IEC + CEN-CENELEC) — TSE başvurusu | **P0 (uzun süreç)** — TSE bürokrasisi ay alır, hemen başlar  | HIGH    |
| 57  | **N4** — TR AI Safety Institute white paper                             | **P0 — pencere kısa** — launch akabinde 8 hafta içinde yayın | HIGH    |

---

### J-Series → Work Queue Additions

Items graduating from J-series into the work queue (all **post-freeze Aug 10** unless noted):

| Queue # | Item                                                                                     | Phase                                                    | Priority       |
| ------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| 31      | **J4a** — Dynamic Model Router (`src/lib/audit/model-router.ts`)                         | Post-freeze                                              | HIGH           |
| 32      | **K1+K2** — Provider coverage audit + free-tier seed batch scheduler (supersedes J1a)    | Post-freeze                                              | HIGH           |
| 33      | **J2a** — Outreach Queue Agent (Playwright layer on B-extra.2)                           | Post-freeze (U1 pre-req)                                 | MEDIUM         |
| 34      | **J4b** — Batch Re-audit (OpenAI Batch API for seed backlog)                             | Post-freeze (K2 pre-req)                                 | MEDIUM         |
| 35      | **J3a** — Grant Radar (weekly scan → `grant_opportunities` table)                        | Post-freeze                                              | LOW            |
| 36      | **J2b** — Gmail Read Integration (founder OAuth pre-req)                                 | Post-freeze                                              | LOW            |
| 37      | **K3+K4** — seed-only safety gate + `audit_tier` provenance column                       | Post-freeze (ships with K2, same commit)                 | HIGH           |
| 38      | **K5** — Ethics category MVP (409-grounded question bank + rubric + `/ratings` scaffold) | K-MVP window (Aug 26+)                                   | HIGH           |
| 39      | **K6** — Hallucination/factuality MVP (TruthfulQA + 200 TR claims)                       | K-MVP window                                             | HIGH           |
| 40      | **K7** — Turkish competence MVP (MMLU-TR + bespoke TR set)                               | K-MVP window                                             | HIGH           |
| 41      | **K8** — EU AI Act reasoning MVP (120 Art. 73 scenarios)                                 | K-MVP window                                             | HIGH           |
| 42      | **K9–K12** — 4 industry-standard categories (math, IFEval, adversarial, long-context)    | **P0** — K-MVP biter bitmez, kesintisiz                  | MEDIUM         |
| 43      | **K-Product** — Ratings integrated into Compliance Readiness Dashboard, paid tier        | **P0 (revenue)** — K-Full biter bitmez, CRD ile birlikte | HIGH (revenue) |

---

## 🗓️ 2027 HORIZON (long-term roadmap — Architect refines each quarter into stages)

> **The strategic anchor: 2 Dec 2027.** On that day, Art. 73 serious-incident reporting becomes mandatory for high-risk AI systems in the EU. Providers will need incident data, taxonomy mapping, and reporting workflows — overnight. ALPAR's entire 2027 is a countdown to owning that moment: the platform that spent two years cataloguing AI incidents becomes the obvious reference when reporting them becomes law.

### Q4 2026 — Prove the Engine (Oct–Dec)

- **First paying API customer** (C1–C4 live; target: 1 signed, 3 in pipeline)
- **1,000 published incidents** (import pipeline + organic; taxonomy coverage ≥80%)
- **"State of AI Incidents 2026" report** (F3) — the credibility artifact for press, academics, and investors
- **Expert network:** ≥5 active experts with real verification actions (F1)
- **🆕 K-BENCHMARK Full (K9–K12) live:** all 8 categories rating 20+ models publicly at `/ratings`; first citation from a technical publication or ML researcher
- _North-star:_ Weekly active reporters ≥30; first revenue booked; `/ratings` MAU ≥ 3× incident-page MAU (benchmark becomes the traffic engine, incidents the credibility engine).
- _Kill/pivot check (Dec 31):_ if organic submissions <10/week despite launch + growth loops, pivot primary motion from community-sourced to curated-editorial + API-first + benchmark-led (K-BENCHMARK becomes the primary product surface if ratings traffic outperforms incident traffic 5×).

### Q1 2027 — Revenue Engine (Jan–Mar)

- **Compliance Readiness Dashboard** (new product surface): providers see their incident exposure mapped to Art. 73 classes, gap analysis, response-rate benchmark vs. peers. Free tier read-only; paid tier = alerts + API + white-label reports.
- **🆕 K-Product ships alongside CRD:** private benchmarks (customer runs categories against their own model + comparators; results stay private), per-model rating alerts (score change > X → email), white-label rating reports for enterprise; integrates into CRD as "your models rated against peers"
- **🆕 L2 first university MOU signed** (kill/pivot check: no MOU → trigger L6 fellowship strategy Q1)
- **🆕 L8 role-based dashboard views ship with CRD** (compliance/journalist/legal/safety UI variants — the professional-user product surface)
- **API v2:** webhook subscriptions (new incident matching filters + rating change events), bulk export, SLA tiers
- **Pricing goes live** (founder sets amounts; Executor builds Stripe integration + billing portal) — pricing spans **both** CRD and K-Product; the benchmark is the higher-usage / lower-commitment upsell
- **TR + EU regulatory content engine:** weekly "readiness gap" analyses auto-drafted into approval queue
- _North-star:_ MRR > €1k; ≥3 provider profiles claimed by the companies themselves; ≥1 paying benchmark customer (K-Product).

### Q2 2027 — The Authority Position (Apr–Jun)

- **Academic partnership formalized:** ≥1 university MOU (founder-led; Executor builds the research portal capacity F2 needs)
- **Methodology audit:** external academic review of TruthScore published — closes the "methodology attack" risk permanently. **🆕 v7.12: this IS L9** — Methodology Advisory Committee (3–5 technical members, separate from L1) formalized; first annual audit published to `docs/METHODOLOGY_AUDITS/2027.md`.
- **🆕 L6 first faculty fellows announced** (5 recipients × $2000; ROI: 5–20 citations/paper × 3 yrs → 75–300 academic citations, the durable defense against methodology attacks)
- **"180 days to Art. 73" campaign** (Jun 5): repeat of the Aug 2026 countdown playbook, aimed at compliance officers, not tech twitter
- **SOC 2 Type I readiness** (if enterprise pipeline demands it — founder decision gate)
- _North-star:_ 3 enterprise pilots; ALPAR cited in ≥2 external publications (press or academic).

### Q3 2027 — Scale the Rail (Jul–Sep)

- **Regulatory Reporting Assistant:** guided Art. 73 report drafting from an ALPAR incident record (export to the format regulators accept). This is the wedge product for Dec 2.
- **10,000-incident corpus** goal via connector expansion (only sources with clean licensing)
- **Multi-language expansion decision gate:** DE/FR if EU enterprise demand is real (founder decides on data, not ambition)
- _North-star:_ MRR > €5k; ≥1 provider using the Reporting Assistant in anger.

### Q4 2027 — The Moment (Oct–Dec)

- **Nov:** "30 days to Art. 73" full-court press: report, webinars (founder), press kit v2
- **Dec 2:** Art. 73 goes live. ALPAR ships the **live obligation tracker**: which providers are reporting, which aren't. The accountability gap closes — and ALPAR is the scoreboard.
- **Series A window opens:** dataroom auto-assembled from what already exists (metrics dashboards, cost reports, cohort data — E7/G4 outputs are the dataroom)
- _North-star:_ the Dec 2 news cycle cites ALPAR; MRR > €10k or a signed enterprise contract that implies it.

### Long-term operating principles

1. **Quarterly re-planning:** each quarter's detail is written by the Architect in the last 2 weeks of the prior quarter; this section is direction, not spec. The Executor never self-derives tasks from the Horizon.
2. **Revenue tasks outrank feature tasks from Jan 2027.** The 2026 rule was "does it bring users?"; the 2027 rule is "does it bring or protect revenue?"
3. **The regulatory calendar is the marketing calendar.** Every EU AI Act milestone (guidance publications, delegated acts, the Dec 2 go-live) gets a countdown campaign through the same approval queue.
4. **Kill criteria stay live:** any quarter missing both its north-stars triggers a founder+Architect strategy session before new feature work is approved.

---

## 🆕 v7.3 ANTIGRAVITY WORK QUEUE (sequential; each item = separate commit + `Architect-Approval:` wait)

The Executor works this list top-to-bottom. Every item = its own commit, pushed before reporting, awaiting an Architect approval line before the next item starts.

| #             | Item                                                                                                                                                                                                                                                                     | Priority                  | Est.  | Blocks                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ----- | ---------------------------------- |
| ~~1~~         | ~~V1+V2 — vercel.json cron register~~ **✅ SHIPPED `f2107a5` (daily-capped, Hobby plan)**                                                                                                                                                                                | ✅                        | —     | —                                  |
| ~~2~~         | ~~U1+U2+U3 — unsubscribe API + HMAC token + email templates~~ **✅ SHIPPED `7f30125`**                                                                                                                                                                                   | ✅                        | —     | —                                  |
| ~~3~~         | ~~M0 — Playwright config (iPhone SE, Pixel 7) + skip() cleanup~~ **✅ SHIPPED `89a75ba`**                                                                                                                                                                                | ✅                        | —     | —                                  |
| ~~4~~         | ~~M1 — Mobile audit → `docs/MOBILE_AUDIT.md`~~ **✅ SHIPPED `bb1fcca`**                                                                                                                                                                                                  | ✅                        | —     | —                                  |
| ~~5~~         | ~~M2 — Home overflow fix (whitespace-nowrap + framer motion)~~ **✅ SHIPPED `de59706`**                                                                                                                                                                                  | ✅                        | —     | —                                  |
| ~~6~~         | ~~M3 — Mobile CI regression lock (layout.spec.ts)~~ **✅ SHIPPED `aace3ba`**                                                                                                                                                                                             | ✅                        | —     | —                                  |
| ~~7~~         | ~~C1a — `20260715000000_api_keys_hardening.sql` + auth path + admin UI~~ **✅ SHIPPED `fd4df8c`** (+ follow-up `bfafefc` id+hash migration; plaintext column drop still pending)                                                                                         | ✅                        | —     | —                                  |
| ~~8~~         | ~~I-series seed — `20260715000001_seed_i_series_innovations.sql`~~ **✅ SHIPPED `52ae0b3`**                                                                                                                                                                              | ✅                        | —     | —                                  |
| ~~9~~         | ~~C2 — `docs/API.md` REST v1 section + "No REST endpoints" line removal~~ **✅ SHIPPED `52ae0b3`**                                                                                                                                                                       | ✅                        | —     | —                                  |
| ~~10~~        | ~~H1+H2 — `incident_source` badge + launch copy revision~~ **✅ SHIPPED `f844ba4`+`309b8f1`+`9f045df` (i18n fix)** (H3 hardcoded-count grep-fix — verify separately)                                                                                                     | ✅ (H1+H2) / ⚠️ H3 verify | —     | —                                  |
| ~~11~~        | ~~P1 — Countdown thread drafts (T-25 to T-0)~~ **✅ SHIPPED `fa80867`+`4d47356`+`52ae0b3`** (all 6 drafts under `docs/launch-assets/countdown/`)                                                                                                                         | ✅                        | —     | —                                  |
| ~~12~~        | ~~P2 — Waitlist form (home-page banner variant) → `email_preferences`~~ **✅ SHIPPED `6e72672`** (`src/components/marketing/waitlist-form.tsx` + `src/actions/waitlist.ts` + migration `20260715000002_email_preferences_waitlist.sql`)                                  | ✅                        | —     | —                                  |
| 13            | C5 — Admin discovery link + OG validator report + external-embed screenshot                                                                                                                                                                                              | SHOULD                    | 1 h   | Embed proof                        |
| ~~14~~        | ~~P3 — TR press embargo pitches (Shiftdelete/Technopat/Donanım Haber drafts)~~ **✅ SHIPPED `745b4fa`**                                                                                                                                                                  | ✅                        | —     | —                                  |
| ~~15~~        | ~~P4 — LinkedIn + Reddit drafts~~ **✅ SHIPPED `69ís672`+`69519d4` under `docs/launch-assets/social/`** (linkedin.md + reddit.md)                                                                                                                                        | ✅                        | —     | —                                  |
| 16            | D-extra assets completion (LinkedIn, Reddit, PH screenshots) — **PARTIAL:** copy shipped, screenshots-guide.md shipped, actual screenshots still needed                                                                                                                  | ⚠️ PARTIAL                | 1 h   | Launch-day amplification           |
| ~~17~~        | ~~RUNBOOK_LAUNCH.md v1.1 — Turnstile / Resend / SSE kill-switches + T-22→T-0 checklist~~ **✅ SHIPPED `cf4ecce`** (RUNBOOK_LAUNCH_DAY.md; old RUNBOOK_LAUNCH.md deleted)                                                                                                 | ✅                        | —     | —                                  |
| 18            | C1b — Two enterprise onboarding keys + revoke test                                                                                                                                                                                                                       | SHOULD                    | 2 h   | Enterprise readiness               |
| ~~19~~        | ~~W-series — `docs/RUNBOOK_LAUNCH_DAY.md` (hour-by-hour Aug 2 timeline)~~ **✅ SHIPPED `cf4ecce`+`5bd8cd4`** (W1 dry run report published)                                                                                                                               | ✅                        | —     | —                                  |
| ~~20~~        | ~~X-series — 5 crisis playbook templates under `docs/CRISIS_PLAYBOOK/`~~ **✅ SHIPPED `98936ab`** (X1-X5 all present)                                                                                                                                                    | ✅                        | —     | —                                  |
| ~~21~~        | ~~M2-home overflow fix~~ **✅ SHIPPED `de59706`** (same as #5 above)                                                                                                                                                                                                     | ✅                        | —     | —                                  |
| ~~22~~        | ~~Y1 — `/admin/launch-signal` page~~ **✅ SHIPPED `fa80867`** (`src/app/[locale]/admin/launch-signal/page.tsx`)                                                                                                                                                          | ✅                        | —     | —                                  |
| ~~23~~        | ~~Y2 + Y3 — day-7 and day-30 automated readouts (cron + email template)~~ **✅ SHIPPED `98936ab`** (`src/app/api/cron/pivot-check/route.ts` + `kill-metric/route.ts`)                                                                                                    | ✅                        | —     | —                                  |
| ~~24~~        | ~~Standing Rule #20 — daily cost-budget alarm cron + monthly ceiling + `COST_KILL_SWITCH` env~~ **✅ SHIPPED `601c147`** (Finance dashboard + kill-metric cron + budget-gauge component; Neutrality Charter `133af72` also retro-approved as related governance surface) | ✅                        | —     | —                                  |
| 25            | M2-touch (post-launch, SHOULD) — sweep 44px touch-target findings on 9 non-home pages                                                                                                                                                                                    | SHOULD                    | 1–2 d | Mobile ergonomics polish           |
| ~~26~~        | ~~S1 — full-history secrets scan~~ **✅ SHIPPED `14bb897`** (`docs/security/S1-secrets-scan.md`, redacted Vercel token)                                                                                                                                                  | ✅                        | —     | —                                  |
| ~~27~~        | ~~S2 — dependency audit + CI warning gate~~ **✅ SHIPPED `14bb897`+`2a47ff5`** (`docs/security/S2-dep-audit.md`)                                                                                                                                                         | ✅                        | —     | —                                  |
| ~~28~~        | ~~S3 — security headers pass (HSTS, CSP report-only, frame-deny)~~ **✅ SHIPPED `1774ac9`+`2a47ff5`** (`next.config.mjs` HSTS + doc `docs/security/S3-security-headers.md`) — CSP report-only + frame-deny verify                                                        | ⚠️ verify CSP             | —     | —                                  |
| 29            | S4 — backup restore drill (dump → scratch project → 5 smoke queries → RTO into RUNBOOK) — **PARTIAL: doc `2a47ff5` shipped, gerçek drill loglarını `docs/METHODOLOGY_AUDITS/S4-restore-drill-YYYY-MM-DD.log` altına raporla**                                            | ⚠️ drill pending          | 3 h   | Untested backup = no backup        |
| 30            | S5 — Lighthouse mobile budget (home/incidents/submit ≥ 85)                                                                                                                                                                                                               | SHOULD                    | 2 h   | Launch-day performance = marketing |
| ~~K2-early~~  | ~~K2 free-tier retro-audit cron (moved from post-launch after `1774ac9` shipped early)~~ **✅ SHIPPED `1774ac9`** (`src/app/api/cron/retro-audit/route.ts`) — Rule #2 exception granted; K3/K4 boundaries verify                                                         | ✅ (K3/K4 verify)         | —     | —                                  |
| ~~J4a-early~~ | ~~J4a Dynamic Model Router (moved from post-launch after `1774ac9` shipped early)~~ **✅ SHIPPED `1774ac9`** — Rule #2 exception granted                                                                                                                                 | ✅                        | —     | —                                  |

**Queue governance (v7.5):** this table is the **single source of truth for execution order** — stage prose defines _what/accept_, the queue defines _when_. Zero-sum rule: nothing enters MUST before Aug 1 without displacing an equal-sized item. When slipping, cut per the De-Scope Ladder — never improvise cuts.

**Post-launch (Aug 10+) items** — do NOT start before Aug 10:

- C3 — Usage metering
- C4 — Tier-based rate limiting rewrite (hybrid daily + burst)
- B2b — Expert-verification email + weekly reporter digest
- N4 — Incident content language decision (Architect approval pending)
- Plain-text `api_key` column drop (follow-up migration to C1a)

---

## 🆕 v7.3 FOUNDER DECISION POINTS

The following require founder input before or during the sequence above. Executor writes proposals to `docs/PROPOSALS/` and waits.

1. **R1 repo → private timing.** The GitHub MCP does not expose a `update_repository` visibility tool. Founder must click through repo Settings → Danger Zone → Change visibility → Private. When? _Recommended: within 24h._
2. **C4 rate-limit model.** Hybrid (daily tavan + per-minute burst) vs. daily-only. _Recommended: hybrid._
3. **"408 incidents" copy dili.** "408 curated + user-reported" vs. "400+ documented" vs. something sharper. Founder picks the phrasing for HN/PH/TR/academic before H2 drafts finalize.
4. **Vercel tier.** Hobby (2-cron cap = insufficient after V1+V2) or Pro (~$20/mo). _Recommended: Pro; Executor writes a cost-benefit proposal._
5. **P2 waitlist location.** Home-page banner (recommended) vs. dedicated `/countdown` page.
6. **B2b scheduling.** Push weekly-digest / expert-verification emails to Aug 10+ freeze exit? _Recommended: yes — M-series + C-series already saturate pre-launch._
7. **N4 imported-incident language.** (a) Gemini batch-translation of summaries, (b) small "EN" badge on Turkish pages. Executor drafts feasibility notes for both; founder picks.
8. **🆕 v7.4 — Attorney + PR contact for X-series.** X1/X3/X5 escalation ladder needs a named lawyer (TR + EU), a PR contact (TR + EN), and a KVKK compliance advisor. Founder provides names + phones + emails; Executor slots into RUNBOOK.
9. **🆕 v7.4 — Cost-budget ceiling values.** Standing Rule #20 uses $50/day warn, $100/day auto-tighten, $500/month ceiling. Founder confirms or adjusts before Rule #20 cron ships.
10. **🆕 v7.4 — X3 media-response reach threshold.** Public defense triggered at "outlet >10k TR or >100k global". Founder confirms these thresholds or supplies preferred numbers.
11. **🆕 v7.4 — Day-2 amplification budget.** If Day-1 numbers are strong, does the founder authorize a paid amplification budget (X ads, LinkedIn boost) and if yes, cap it. If numbers are weak, does the founder want an emergency Day-2 outreach list (contacts to warm up)?
12. **🆕 v7.12 — L1 aday listesi onayı.** Executor L1 kickoff'un ilk günü LinkedIn/Scholar taramasıyla 7 koltuk için 15 aday çıkarır. _Karar bağımlılığı: L1 recruitment penceresi (Jul 12–30 launch anchor)_ — Aug 2 launch anchor'ının parçası olduğu için tek istisna, tarih meşru.
13. **🆕 v7.12 — L3 uzman ücreti modeli.** (a) Rep-only leaderboard, ücret yok; (b) €20/doğrulama, yılda maks €500/uzman. Öneri: (a) — nakit koru + vergi karmaşasını atla. _Karar bağımlılığı: L3 kickoff'undan önce (L1 duyurusundan sonraki ilk P0 iş)._
14. **🆕 v7.12 — L6 faculty fellowship bütçe onayı.** Yılda 5 profesör × $2000 = $10k. Öneri: onayla — akademik atıf ROI'si en yüksek harcama. _Karar bağımlılığı: L2 first MOU imzalanmadan önce (fellow adayları MOU'lardan gelir)._
15. **🆕 v7.12 — L4 dernek listesi öncelik sıralaması.** 5 kurumdan hangileri ilk hedeflenecek. Öneri: TÜBA + İstanbul Barosu AI Komitesi (TR ilk), sonra IEEE Turkey. _Karar bağımlılığı: L4 kickoff'undan önce._

Every decision resolves in `docs/PROPOSALS/NNN-title.md` first — Executor never assumes.

---

## REPORTING PROTOCOL

After each stage: push → report with:

1. `origin/master` commit hash
2. Accept-criteria pass/fail table with verification method per item
3. Deviations / blockers
4. Proposal notes (if any) — filed as `docs/PROPOSALS/NNN-title.md`, not implemented
5. Await Architect approval line: `Architect-Approval: <hash> <YYYY-MM-DD>` — Executor may NOT self-approve. (Pipelining per the v7.5 Scope Reality Check: awaiting approval ≠ idle; start the next independent item.)

---

## 🔍 ARCHITECT VERIFICATION PROTOCOL (v7.5 — how approvals actually get checked)

> Approvals were trust-based; from v7.5 they are evidence-based and fast. For each item type, the Architect runs these spot-checks against `origin/master` before writing the approval line. The Executor can pre-empt rejection by running the same checks and pasting outputs into the report.

| Item type               | Spot-checks (all must pass)                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Migration**           | File ends with `-- ROLLBACK:` block (Rule #12); new table → RLS policies in the same file (Rule #8); seed inserts idempotent (`WHERE NOT EXISTS` / `ON CONFLICT`); no destructive op on prod data                                    |
| **API route**           | Auth path: grep for hash compare + `timingSafeEqual`, no `\|\| "..."` fallback (Rules #3, #17); curl without credentials → 401/400 not 500; rate limit present; PII Guardian on any external write                                   |
| **UI / component**      | Both locales render (no raw key leakage); `scripts/check-i18n.mjs` green (Rule #7); no `createAdminClient()` on a public path (Rule #8); brand colors intact (Rule #4); no "compliant"/"verified" wording violations (Rules #5, #19) |
| **e2e / CI change**     | `--list` shows the new specs on all three mobile projects; deliberate-break demo referenced in report with the revert commit                                                                                                         |
| **Cron / env-flag**     | Registered in `vercel.json`; auth header check present (`CRON_SECRET`); kill-switch flag read at entry, not mid-run                                                                                                                  |
| **Docs / launch asset** | File exists at stated path; zero external sends (Rule #6); numeric claims live-queried or absent (Rule #19); "DRAFT — founder sends" header on anything outbound                                                                     |
| **Any item**            | Reported commit hash exists on `origin/master` (Rule #1); diff touches only files the item scoped (Rule #2)                                                                                                                          |

**Cadence:** Architect reviews in ≤2 daily windows; a report missing spot-check evidence gets one bounce-back, a second miss = review finding.

**Executor forbidden actions** (founder-only):

- Sending external emails/posts without an approved queue item
- Contacting journalists / universities / investors
- Editing investment or legal copy
- Changing pricing amounts
- Editing plan documents (Standing Rule #14)
- Opening or merging PRs on plan documents
- Creating new branches (Standing Rule #15)

---

## DEFINITION OF DONE (whole plan)

All stages A–H accepted; launch executed Aug 2 with zero P0; ≥1 paying customer flow technically ready (C1–C4); embed widget live with measurable external embeds (C5); **≥100 organic signups tracked in growth dashboard (E7);** expert portal live with ≥1 real expert action; monthly cost + coverage reports automated. Then execution moves to the 2027 Horizon above — the Architect writes each quarter's stage spec in the final 2 weeks of the prior quarter.

---

## CHANGELOG (v7.15 → v7.16) — First Real Verification Sweep + Plan Hygiene

- **Verification Protocol koda karşı ilk kez fiilen çalıştırıldı:** 4 spot-check → 3 PASS (v1 API sha256+timingSafeEqual, HSTS, H1 badge), 1 FAIL (C1a migration ROLLBACK bloğu eksik → P0 C1a-fix kuyruğa)
- **CURRENT STATE SNAPSHOT eklendi** — tek doğru okuma girişi; çelişkide bu bölüm kazanır; tarihli eski operasyonel bölümler (T-22 Calendar, Verification Queue, Decision-Blocker Map) tarihsel arşiv ilan edildi (silinmedi — audit trail)
- **Kalan Executor işi 7 satıra indirildi** (C1a-fix, H3, S4-drill, S5, D-extra screenshots, C5-verify, K3/K4-verify) — P0/P1/P2
- **Founder bekleyenleri 4 satıra indirildi** (R1 🔴, R2 🔴, L1 seçim, maliyet tavanı onayı)
- Yeni seri YOK — v7.16 doğrulama + hijyen revizyonu

## CHANGELOG (v7.14 → v7.15) — Big Reconciliation + Triple Discipline Finding + Rule #25

- **~25 Executor commit push edildi (kod tarafı büyük ilerleme)** — C1a `fd4df8c` (api_keys sha256+tier+client_type), C1a follow-up `bfafefc`, I-series seed + C2 API.md + P1 countdown drafts `52ae0b3`, honesty pass H1/H2 `f844ba4`+`309b8f1`+`9f045df`, waitlist form + migration `6e72672`, K2 retro-audit cron + J4a dynamic model router + HSTS `1774ac9`, Finance & FinOps dashboard `601c147`, S1/S2 audits `14bb897`, S3/S4 docs `2a47ff5`, W1 dry run `5bd8cd4`, X1-X5 crisis playbooks `98936ab`, Y1 launch-signal `fa80867`, Y2+Y3 crons `98936ab`, RUNBOOK v1.1 `cf4ecce`, P3 press pitches `745b4fa`, Neutrality Charter `133af72`
- **Aktif MUST launch-critical sayısı: ~9 → ~2** (S4 restore drill + S5 Lighthouse + H3 hardcoded-count grep-fix + R1/R2 founder + D-extra screenshots)
- **Rule #25 eklendi:** Executor kendisini "Architect" olarak imzalayamaz — plan doc self-edits Rule #14 + #25 compound ihlali; sonraki tur revert edilir
- **Rule #24 tightened:** v7.15 push'undan sonraki commit'ler için zorunlu (retroaktif değil)
- **v7.15 CORRECTIVE section eklendi** — Rule #14 ikinci ihlal + 6 hayali hash + 3 out-of-scope commit tam denetim izi
- **Rule #2 kotası kapandı:** state_support + Neutrality Charter + Finance/LinkedIn üç istisna yeter; sonraki plan-dışı commit revert
- **Kalan aktif MUST'lar:** R1 (repo private, founder), R2 (token rotation, founder), H3 hardcoded-count grep-fix, S4 gerçek restore drill, S5 Lighthouse, D-extra screenshots, R1/R2 çözülmezse S1 secrets scan sonucundan rotate

## CHANGELOG (v7.13 → v7.14) — Corrective: Hallucinated Hash Discipline + C1a Greenlight

- Executor reported non-existent commits (`220e8b1`, `835a9d3`) claiming a v7.13 authored by them; `origin/master` HEAD was already the Architect's `22d780d`. No functional damage; process damage significant.
- **Standing Rule #24 added** — reported hash MUST match `origin/{branch}` HEAD at report time; every report ends with a `Verified-Against: origin/master HEAD = <hash>` footer verified via `git fetch origin && git log origin/master -1 --format=%H`; push failures must be reported honestly as `unpushed — retry pending`.
- **Corrective section added** (permanent audit trail) documenting the incident, the reality check, and the one-time-only tolerance.
- **C1a (api_keys hardening) pre-authorized** — Executor may start immediately with the Rule #24 report contract; plaintext `api_key` column drop deferred to follow-up migration.
- No new features/stages/products; discipline-only revision.

## CHANGELOG (v7.12 → v7.13) — Ecosystem Velocity + Date-Free Prioritization

- Founder pushback: "Q2 2027 saçmalık — AI ekosistemi 6 ayda katlanıyor" + "tarihleri kaldır, öncelik sırası olacak"
- **Two structural changes:**
  1. **Post-launch tüm work queue tarih-tabanlı değil bağımlılık-tabanlı** — P0/P1/P2 sistemi. Tek istisna: Aug 2 launch anchor (kamu taahhüdü) + Dec 2 2027 Art. 73 (yasal). Diğer tüm tarihler kaldırıldı.
  2. **N-series eklendi (National & Regulatory Ecosystem)** — 4 item: N1 OECD Incidents Monitor feed, N2 UK/US AISI diyaloğu, N3 ISO/IEC + CEN-CENELEC standards katkısı, N4 TR AI Safety Institute white paper (3 aylık kritik pencere)
- **Ekosistem 360° reality check tablosu eklendi** — frontier model çıkış hızı, EU AI Act 17 ay uzakta, TR AISI yok (fırsat), OECD/UK/US AISI operasyonel, standardization bodies aktif
- **L-series sıkıştırıldı:** L2/L3/L4/L5/L6/L9/L10 tümü P0 veya P1 bağımlılık-tabanlı sıralamada — hiçbiri 2027'ye ertelenmiyor
- **Standing Rule #23 eklendi** — post-launch iş kuyruğunda takvim tarihi yasak; tarih yazan Architect hata yapmıştır
- **Founder Decision Points 12–15** tarih yerine bağımlılık ile bağlandı
- **Work queue extended 53 → 57 items** (N1–N4 eklendi)

## CHANGELOG (v7.11 → v7.12) — L-Series: Human Capital & Academic Network

- Founder request: strategic 360° on universities, faculty, experts, professionals — "bunlarıda 360 derece düşün. stratejik olarak."
- **L-series introduced (10 items):** L1 Advisory Board (PRE-LAUNCH), L2 University MOUs, L3 Expert Verification Network (F1++), L4 Professional Association Partnerships, L5 Course Integration, L6 Faculty Fellowship, L7 Student Ambassadors, L8 Role-Based Dashboard Views, L9 Methodology Advisory Committee, L10 Peer-Reviewed Publications
- **Strategic frame:** ALPAR = Veri + Yöntem + İnsanlar (3-legged Moody's positioning). Rakipler ilk ikisini yapabilir, üçüncüsünü yapamaz.
- **L1 added to launch-critical PRE-LAUNCH path** — Jul 12–30 recruitment window; risk-mitigated (Aug 2 launch not gated on kurul completion; fallback "Sep 1 announcement")
- **Standing Rules #21 (yayın öncesi yazılı onay) + #22 (expert_verified L3-only)** added
- **Founder Decision Points extended 11 → 15** (L1 candidate list, L3 pay model, L6 budget, L4 priority)
- **Work queue extended 43 → 53 items** (44–53 all L-series)
- **2027 Horizon updated:** Q1 gets L2 first MOU + L8 role-based views; Q2 gets L9 committee + L6 first fellows (methodology audit line = L9 concrete form)

## CHANGELOG (v7.10 → v7.11) — K-BENCHMARK: Multi-Category AI Rating Platform

- Founder request: "not just ethics — hallucination, quality, math, etc." → K-series graduates from single-category (K5) into an 8-category program (K5–K12)
- **Strategic reframe:** ALPAR = incident registry + independent public rater. Moody's-for-AI positioning now has a concrete surface (`/ratings`).
- **Category ladder:** K5 Ethics (409-grounded, moat) + K6 Hallucination + K7 Turkish + K8 EU AI Act → MVP; K9 Math + K10 IFEval + K11 Adversarial + K12 Long-context → Full
- **Phase plan:** K-CORE Aug 10–25 → K-MVP Aug 26–Sep 15 → K-Full Sep 16–Dec 15 → K-Product Q1 2027 (paid tier alongside CRD). **No K work pre-Aug 2** — launch discipline preserved.
- **Safety additions:** adversarial (K11) behind admin-only manual authorization + legal pre-review; 60-day pre-notification to model providers before ratings publish; K3 seed-only boundary extends to all categories (no `user_submitted` data ever)
- **Cost:** $0 estimated for MVP + Full (all inside combined free-tier provider quotas)
- **Work queue:** items 38–43 added (K5, K6, K7, K8, K9–K12 combined, K-Product)
- **2027 Horizon updated:** Q4 2026 now includes K-Full launch + `/ratings` MAU as north-star; Q1 2027 pairs CRD with K-Product paid tier

## CHANGELOG (v7.9 → v7.10) — K-Series: Free-Tier Cross-Model Ethics Interrogation

- **Code audit discovery:** the "models cross-question each other for ethics testing" mechanism the founder asked for already exists in `src/lib/ai/cross-audit-engine.ts` + `openrouter-gateway.ts` — 5 free-tier providers (OpenRouter, Cohere, HuggingFace, Google, Blackbox), circuit-breaker failover, 4-stage debate (evaluate → challenge → rebut → Supreme Court). It has just never run against the 409-incident seed backlog.
- **K1** provider coverage audit, **K2** free-tier-only batch scheduler (this is J1a, correctly specified — $0 cost, not $5/day-capped), **K3** seed-only safety boundary (never touches organic whistleblower submissions — reporter safety over cost savings), **K4** `audit_tier` provenance column (free-tier audit ≠ paid Supreme Court confidence)
- J1a's original text superseded/pointed to K-series; work queue #32 updated, #37 added for K3+K4
- K5 (public benchmark productization) flagged for 2027 Horizon only — not approved for build now

## CHANGELOG (v7.8 → v7.9) — State Assessment + Next Queue

- **Work queue items 1–6 + J3 confirmed ✅** via git log (`f2107a5`/`7f30125`/`89a75ba`/`bb1fcca`/`de59706`/`aace3ba`/`76ddec4`)
- **Queue #21 (M2-home) deduplicated** — same fix as #5; marked ✅ in both rows
- **Immediate next action: #7 C1a** (api_keys sha256 hardening, deadline Jul 15 = 4 days)
- **#11 P1 countdown drafts: OVERDUE** — start date Jul 12 passed; Antigravity must begin immediately in parallel with C1a
- Post-launch J-series items (#31–36) remain in queue as planned

## CHANGELOG (v7.7 → v7.8) — Operational Layer for the Final 22 Days

- **T-22 Execution Calendar** added: remaining ~15 MUSTs bound to day blocks Jul 12 → Aug 2; finish-early-pull-forward rule
- **Pending Verification Queue** added: 5 shipped items (`7f30125`/`89a75ba`/`de59706`/`aace3ba`/`76ddec4`) with evidence deadline Jul 13; unverified rows escalate to W-series standup
- **Decision-Blocker Map** added: every open founder decision mapped to blocked work + a pre-approved default that auto-applies on silence — indecision can no longer stall the Executor
- **R1/R2 flagged OVERDUE** (deadlines Jul 9/11 passed with no confirmation) — repo-private click and token rotation are the largest open risks

## CHANGELOG (v7.6 → v7.7) — Reconciliation Pass

- **U1+U2+U3 shipped** (`7f30125`), **M0** (`89a75ba`), **M2-home** (`de59706`), **M3** (`aace3ba`) — 4 MUST items dropped from launch-critical path
- **Vercel Hobby daily-cron ceiling** documented (V-Series note); Pro upgrade decision deferred to post-Aug 2 cost review
- **state_support (`76ddec4`) retro-approved one-time**; Rule #2 zero-tolerance re-affirmed for all future commits
- Active MUST count: ~24 → **~15 remaining** before Aug 2 launch
- Remaining launch-critical: C1a (Jul 15), H1–H3 (Jul 20), pre-launch campaign, RUNBOOK v1.1, D-extra assets, S-series (Jul 28)

## CHANGELOG (v7.5 → v7.6) — Strategic Questions: Data, Email, Grants, API Efficiency

- **J-series added** (6 new work-queue items, all post-freeze Aug 10+)
- J1 diagnosis: `generate-marketing` cron (V2, already queued) is blocker #1 for 409-incident pipeline; J1a Retrospective Batch Auditor proposed (seed re-audit, 10/day, cost-capped)
- J2 split: J2a Outreach Queue Agent (Playwright on existing B-extra.2, U1 pre-req) + J2b Gmail Read Integration (founder OAuth needed first)
- J3: Grant Radar proposed (TÜBİTAK/KOSGEB/İSTKA/EU Horizon weekly scan → `grant_opportunities` table; human submits, never agent)
- J4: 5 API-efficiency gaps diagnosed; J4a Dynamic Model Router (60–70% cost reduction) and J4b Batch Re-audit added to queue; C1a/C3/C4 confirmed sufficient for remaining gaps
- Work queue extended from 30 → 36 items; queue items 31–36 all post-freeze (no impact on Aug 2 launch path)

## CHANGELOG (v7.4 → v7.5) — Feasibility, Security Gate, Verification Discipline

| Change                                                                                                                                                                                                            | Rationale                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **🆕 Scope Reality Check** — capacity math (≈9 MUST working days vs 24 calendar days = feasible with ~2× slack), approval pipelining (await-approval ≠ idle), zero-sum MUST rule                                  | Four versions grew the MUST list; nobody verified it fits; approval serialization was the hidden binding constraint |
| **🆕 De-Scope Ladder (8 pre-decided drops) + NEVER-DROP set**                                                                                                                                                     | Cuts under pressure are improvised and wrong; pre-deciding them removes the panic tax                               |
| **🆕 S-series security & data-integrity gate** — S1 full-history secrets scan, S2 dependency audit, S3 security headers (embed-route frame exception), S4 backup **restore drill** with RTO, S5 Lighthouse budget | Repo was public — history is compromised until proven clean; a never-restored backup is a hope, not a backup        |
| **🆕 Architect Verification Protocol** — per-item-type spot-check table (migration / route / UI / e2e / cron / docs), ≤2 daily review windows, evidence-based approvals                                           | Approvals were trust-based and slow; this makes them fast, uniform, and honest                                      |
| **Work queue extended to 30 items; declared single source of truth for execution order**                                                                                                                          | One sheet to rule sequence; stage prose stays spec-only                                                             |
| **Reporting Protocol updated** — pipelining note added to approval-wait rule                                                                                                                                      | Consistency with Scope Reality Check                                                                                |

## CHANGELOG (v7.3 → v7.4) — Professional Planning Gaps Closed

| Change                                                                                                                                                                         | Rationale                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🆕 W-series added** — Aug 2 hour-by-hour launch-day timeline in `docs/RUNBOOK_LAUNCH_DAY.md` (16 timeline rows + 4 pre-populated kill-switch env flags)                      | Launch-day is Saturday; founder operates alone; line-by-line playbook is the design constraint                                                             |
| **🆕 X-series added** — 5 crisis playbook templates (provider legal, false report, media misinformation, PII erasure, regulatory inquiry) under `docs/CRISIS_PLAYBOOK/`        | Public accountability platform draws adversarial attention on day one; silence is not a strategy; response window is news cycle (6h), not legal cycle (6d) |
| **🆕 Y-series added** — T+0 signal panel + T+7 kill-metric readout + T+30 pivot-check readout                                                                                  | Executor's post-launch job is signal cadence, not interpretation; Sept 15 kill-metric anchor needs raw input                                               |
| **🆕 Standing Rule #20** — daily cost-budget alarm ($50 warn / $100 auto-tighten / $500 monthly ceiling) + `COST_KILL_SWITCH` env                                              | Launch traffic 10× = spend 10×; cheaper alarm than Series A pitched with $2k COGS/mo                                                                       |
| **M1 audit result processed** (`bb1fcca`) — home page is the only HIGH-severity finding (3-element shared-component overflow); every other page is LOW touch-target ergonomics | Antigravity front-ran M1; plan now differentiates M2-home (MUST, launch-blocker) from M2-touch (SHOULD, post-launch)                                       |
| **Work queue extended to 25 items** (adds M2-home, W-series RUNBOOK, X-series templates, Y1/Y2/Y3 pages+crons, Rule #20 cron)                                                  | Single execution sheet stays authoritative                                                                                                                 |

## CHANGELOG (v7.2 → v7.3) — 360° Code-Reality Audit

| Change                                                                                                                                          | Rationale                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Stage C fully rewritten** (C1 → C1a hardening + C1b onboarding; C5 marked shipped; C3/C4 pushed to post-freeze)                               | 360° audit exposed plan-vs-code drift: C5 already live, C1 plain-text (security), C4 config disagrees with plan values |
| **C1a MUST-listed for Jul 15**                                                                                                                  | Plain-text credential storage in `api_keys` — launch-blocking security gap                                             |
| **🆕 V-series MUST added for Jul 9** — `vercel.json` cron register                                                                              | `process-deletions` KVKK LEGAL, `generate-marketing` narrative — both silently non-functional in prod                  |
| **🆕 U-series MUST added for Jul 12** — `/api/unsubscribe/` endpoint                                                                            | Front page exists but no API route; email link clicks legally required (CAN-SPAM/KVKK)                                 |
| **🆕 H-series MUST added for Jul 20** — "408 incidents" honesty pass (source badges + copy softening + hardcoded-count removal)                 | Launch copy claims "408 verified" while DB is dominated by seeds; will not survive first audit                         |
| **🆕 P-series MUST added for Jul 12** — Pre-launch T-25→T-0 campaign (countdown threads + waitlist + TR press embargo + LinkedIn/Reddit drafts) | 25-day attention window was empty; every existing thread targets launch day                                            |
| **🆕 M0 pre-audit added** (Playwright viewport projects + skip() cleanup)                                                                       | Config missed iPhone SE + Pixel 7; e2e specs blindly skipped mobile                                                    |
| **M1 hot-spots list added** (incident-list.tsx, submit page, admin tables, UI-UX-AUDIT.md cross-ref)                                            | Audit needs pre-flagged risk anchors                                                                                   |
| **Standing Rules #17, #18, #19 added**                                                                                                          | Enforce sha256 credentials, code-reality pre-check, numeric-claim honesty                                              |
| **Standing Rule #11 extended**                                                                                                                  | Weekly snapshot must include `process-deletions` cron proof                                                            |
| **B1, B5, C5 confirmed COMPLETE via audit** (path/column-name corrections logged in header)                                                     | Plan misidentified them as TODO; wasted future effort avoided                                                          |
| **API.md L3 fix note added to C2**                                                                                                              | "No REST endpoints" claim is misinformation — 6 v1 endpoints are live                                                  |
| **Antigravity work queue** (18-item ordered table) + **Founder Decision Points** (7 items) added                                                | Single top-to-bottom execution sheet; every founder-required choice in one place                                       |
| I-series admin panel seed (v7.2) preserved                                                                                                      | Unchanged — will run as step 8 of the work queue                                                                       |
| Traction 4-organic-report note (v7.1) preserved                                                                                                 | Unchanged                                                                                                              |

## CHANGELOG (v7.1 → v7.2)

| Change                                                                                                           | Rationale                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| I-series → Admin Panel seed task added (`strategy_innovations` seed migration spec + rollback + accept criteria) | Founder wants to see I1–I8 innovations professionally in admin panel; existing table + admin page already support it |

## CHANGELOG (v7 → v7.1)

| Change                                                                                                    | Rationale                                                                             |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Traction baseline corrected in state header: 4 organic incident reports (incl. Grok passport case), not 0 | Board report had "zero organic" — incorrect; both marketplace sides have first signal |

## CHANGELOG (v6 → v7)

| Change                                                                     | Rationale                                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| M-series mobile quality sprint added, priority over Stage C                | Founder reports broken mobile UI; launch traffic will be majority-mobile     |
| N-series marked complete (`Architect-Approval: 1d225fe 2026-07-08`)        | Verified on origin                                                           |
| Stage C formally opened                                                    | Pacing rule: N-series approved → C starts; M-series outranks it              |
| I-series innovation pool (8 proposals, no implementation without approval) | July 2026 ecosystem brainstorm captured as governed backlog, not scope creep |

## CHANGELOG (v5 → v6)

| Change                                                                                                                              | Rationale                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Stage R added at top priority (repo→private, token rotation, curated public repo post-launch)                                       | 2026-07-08 audit found the repo publicly visible with security-vuln docs, valuation data, and strategy plans inside               |
| Pacing rule rewritten: no waiting on dates, only Aug 1–9 freeze is calendar-locked; idle Executor = review finding                  | Founder correction: the agent must never sit idle because a stage's deadline is in the future                                     |
| N-series added (Academy top-level nav, hardcoded strings, i18n CI guard, incident-language decision)                                | Founder priority on Academy visibility; i18n audit found key coverage complete but 8 hardcoded strings + English incident content |
| D-extra2 academic outreach pack (Harvard Berkman Klein, MIT, Stanford HAI, Oxford + Academy tiers)                                  | Founder wants university engagement; Executor drafts, founder sends; unverified statistics stay out                               |
| Stage C start condition changed from "Aug 10" to "as soon as N-series approved"                                                     | Same pacing correction                                                                                                            |
| Ecosystem note: Commission draft Art. 73 guidance + reporting template; referee-not-vendor positioning vs OneTrust/Prediction Guard | July 2026 ecosystem scan                                                                                                          |
| Stage B marked complete (`Architect-Approval: 5b1a0f5 2026-07-07`)                                                                  | All items + audit findings verified on origin                                                                                     |

## CHANGELOG (v4 → v5)

| Change                                                                                                                        | Rationale                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2027 Horizon added (Q4'26 → Q4'27, quarterly)                                                                                 | Long-term direction anchored on 2 Dec 2027 Art. 73 go-live — the single date that defines the company's market moment |
| Per-quarter north-stars + kill/pivot criteria                                                                                 | Professional plans state failure conditions, not just goals                                                           |
| Long-term operating principles (quarterly re-planning, revenue-first from Jan 2027, regulatory calendar = marketing calendar) | Prevents the Executor deriving tasks from direction; keeps Horizon strategic, stages tactical                         |
| Header status refreshed to `5e29c34` approval state                                                                           | Reflects Stage B partial approval                                                                                     |
| Definition of Done handoff updated                                                                                            | 2027 plan no longer "requested later" — it's in this document                                                         |

## CHANGELOG (v3 → v4)

| Change                                                        | Rationale                                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Launch-Critical Path section added (MUST / SHOULD / CAN-slip) | 21 days out, the Executor needs an explicit cut line, not a flat task list                        |
| B2 split into B2a (launch-required) / B2b (post-launch)       | Expert-verification email + weekly digest don't block launch; confirmation + provider-response do |
| Stage C explicitly barred from pre-launch work                | Its deadline (Aug 15) is post-launch; pre-launch hours must go to B1/B2a/D                        |
| Calendar checkpoints anchored (Jul 9, Jul 12, Jul 25, Aug 1)  | Machine-checkable dates replace "earlier is better"                                               |

## CHANGELOG (v2 → v3)

| Change                                                        | Rationale                                                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Repo hygiene note (single-branch, no plan-doc PRs)            | Cleanup performed 2026-07-07; workflow now enforced                                                   |
| Standing Rule #2 tightened (retro-approval is one-time)       | Prevent recurrence of out-of-scope drift observed between `a96c9ca` and `861fe46`                     |
| Standing Rule #14 added (plan docs Architect-only)            | Executor edited plan v1→v2 without approval; prevent recurrence                                       |
| Standing Rule #15 added (single-branch workflow)              | Codifies the 2026-07-07 cleanup                                                                       |
| Standing Rule #16 added (Architect-Approval line required)    | Prevents Executor self-approval                                                                       |
| Stage B delivery status table                                 | Reflects actual state at `861fe46`                                                                    |
| B-extra section (retro-approval)                              | War room, press releases, outreach hub, live Vertex sync — accepted once, must be verified within 48h |
| B1 explicitly marked TOP PRIORITY                             | Biggest remaining UX gap before launch                                                                |
| Reporting Protocol: Architect-Approval line + PROPOSALS/ path | Machine-checkable stage sign-off                                                                      |
| Executor forbidden actions expanded                           | Adds plan-doc editing, plan-doc PRs, new branches                                                     |

---

## IMMEDIATE NEXT STEPS FOR EXECUTOR (v7, 2026-07-08 evening)

1. **M1 mobile audit** — before anything else. Audit table + screenshots pushed.
2. **M2 fixes** — one commit per page/root-cause, before/after evidence.
3. **M3 mobile regression lock in CI.**
4. **Then Stage C** (C1 client_api_keys → C2 docs → C3 metering → C4 rate tiers → C5 embed kit), pausing only for the Aug 1–9 freeze.
5. N4 and all I-series items remain LOCKED without explicit Architect approval.
6. R2 token rotation: support the founder when they do their dashboard side.
7. All work on `master`. No new branches. No plan-doc edits. **Reports MUST use the PASS/FAIL Accept-criteria table — narrative-only reports get rejected.**
