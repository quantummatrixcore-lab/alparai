# ALPAR AI — MASTER PLAN

> **What this file is.** The operational board: current state, active backlog, the legal register,
> and the newest architect entry. It is a **living document** — nothing historical stays here.
>
> **What this file is not.** It is not the architecture. See the map below.
>
> **Version:** v13.88 · **Updated:** 2026-08-20 · **Cap:** 600 lines (`scripts/check-master-plan-length.mjs`)

## v13.88 — Both follow-ups closed; the suite is green on a full run (2026-08-21)

`25980b2d`, verified here rather than accepted. **`pnpm test` run in full: 193 files, 1,128 tests,
exit 0.** The report cited a 9-test subset, which is a narrower claim than the one that matters, so it
is worth recording that the whole suite passes and not only the file that was edited.

`tests/api/incidents-voice.test.ts` now asserts the contract the code actually has — an error when the
transcription service is unavailable, instead of the 200-with-prose it previously certified. The test
that had been guaranteeing the fabrication now guards against its return, which is the right end state
for that file.

The eight throwaway scripts are gone and `.gitignore:43` carries `scripts/temp_*`, so the next batch
of debug scaffolding does not reach the repository at all. Fixing the instance and closing the path in
one pass is the pattern this board keeps asking for.

**One inconsistency, small and worth naming before it hardens.** For the same condition — the
transcription service being unavailable — `api/ai/transcribe/route.ts:89,95` answers **503** while
`api/incidents/voice/route.ts:232` answers **500**. A 500 says the server is broken; a 503 says a
dependency is down and the request may be retried, and monitors and clients act on that difference.
Both routes should say 503 here. Not filed as an item — it is one line in each file and belongs to
whoever next opens them — but recorded so the decision is deliberate rather than accidental.

## v13.87 — Three closed, and a test that had been guaranteeing the fabrication (2026-08-21)

`babb4435`, verified on `origin/master`. All three of v13.86's items are done, and done as specified
rather than approximately.

**`VOICE-1` closes.** The fabricated transcript is gone from `src/` entirely — the string returns zero
hits — and `transcribe/route.ts` now answers **503** with a reason when the service is unavailable.
`VoiceIncidentReporter.tsx` holds the transcript as a `draftTranscript` and offers **Discard** or
**Append to Description**, so machine-transcribed text never becomes the submitted description without
the user choosing it. That is the confirmation step the item asked for, built rather than approximated.

**`INTAKE-1` closes.** `title` is optional and labelled so; `description` is the single required field.
When the title is blank it is derived from the description — first 77 characters and an ellipsis
(`incident-form.tsx:551-553`) — so the schema keeps its column and the reporter is not asked for a
headline. One mandatory field now files a report.

**`AUTH-1` closes.** The server-rejection branch logs the Supabase `code` and `status`
(`auth.ts:43-52`) and shows the error; **the automatic second Google round-trip is gone**. The one
remaining `fallbackOAuthRedirect()` sits in the no-credential branch — the user dismissed the prompt —
which is exactly the only case the item allowed it, and the manual button is unchanged. The measurement
step and the fix landed together, which is acceptable here because the fix does not depend on what the
log says: whatever the reason, silently re-authenticating was wrong.

### The finding that came out of running the suite

`pnpm test` is **red**: 2 failures in `tests/api/incidents-voice.test.ts`, both asserting that
`transcribeAudio` returns a transcript and the route returns 200. The test mocks the session and the
rate limiter but **not** the transcription service — so it was passing only because the endpoint
returned the fabricated sentence. **The bug was covered by a test that certified it as working.**

That is why it survived: the suite was green _because_ the endpoint lied, and a green suite is exactly
what stops anyone looking. The test now encodes a contract the code has correctly abandoned, and needs
rewriting to assert the new one — a 503 and a thrown error when the service is unavailable. Small
work, and it belongs to whoever touches that file next; recorded here rather than filed, because
`VOICE-1`'s acceptance already requires a test asserting that a failure leaves the field untouched.

**Worth watching, not filed:** the same commit added eight throwaway scripts to `scripts/` —
`fix-tr-mojibake2/3/4.js`, `fix-tr-json-syntax.js`, `temp_cdp_buttons.js`, `temp_cdp_click_send.js`,
`lb1-prod.js`. Debug scaffolding belongs outside the repository or in `.gitignore`; this is `REPO-1`'s
defect class arriving faster than `REPO-1` clears it.

## v13.86 — The reporting form, and a transcription endpoint that invents evidence (2026-08-21)

The Founder reported four things about filing an incident: it demands both a short and a long
description, the model list is out of date, voice recording does not work, and the whole thing is
harder than it should be. All four check out in the code, and the third turned out to be something
other than "does not work".

**`src/app/api/ai/transcribe/route.ts` fabricates the transcript when it fails.** If
`OPENROUTER_API_KEY` is absent, or the model call fails, or the response is unusable, the route does
not return an error. It returns HTTP 200 with a hardcoded Turkish sentence meaning:

> "[Voice recording successfully transcribed: the AI model produced an unexpected response and
> violated the system security protocol.]"

The user speaks a description of a real incident. The system discards it, **states that transcription
succeeded**, and substitutes an invented sentence that is itself an accusation against an AI model —
into the description field of an incident report, attributed to whichever provider they selected.

**This is the most serious fabrication found on this board.** The earlier ones invented metrics about
ourselves: a transparency score, a K-benchmark table, a readiness percentage. All bad, all removed.
This one invents **evidence**, out of a user's own words, on the single surface where the project's
value rests entirely on the record being real. And it does so while reporting success, which is why it
has read as "voice doesn't work" rather than as what it is.
[VOICE-1](plan/items/VOICE-1.md), P0. The correction is to delete the fallback: a failed transcription
returns a non-2xx with a reason. A user told the recording failed can type instead; a user told it
succeeded has no reason to check.

**The other three are one problem — the form asks too much of the person least able to give it.**
`incident-form.tsx:718-737` requires **both** a title of up to 200 characters and a description of up
to 5,000, so someone who has just experienced something must compose a headline and an essay before
the form will accept them. The model list is the `ai_models` table — the same one `LB-1` is purging of
fabricated entries, never refreshed with the models people actually use — so a reporter looks for
their model, does not find it, and either picks something wrong or leaves. And voice, the alternative
for anyone who cannot type, additionally requires a signed-in session (`transcribe/route.ts:7-10`),
which under `AUTH-1` puts the double sign-in between a whistleblower and their report.
[INTAKE-1](plan/items/INTAKE-1.md).

**The principle, because it decides the next twenty design questions:** the reporter is doing us a
favour. Every mandatory field asserts that we need something more than we need their report, and the
form currently makes that assertion four times before a word is typed. One required free-text field
files a report. An unlisted model is metadata a moderator resolves later and must never block
submission. A broken alternative path is worse than none, because it spends the single attempt of
exactly the person who could not use the main one.

**Measure before redesigning further.** Instrument form-opened and submitted, so the next change aims
at where people actually stop. Guessing at friction is how forms acquire fields in the first place.

## v13.85 — The double sign-in, located (2026-08-21)

The Founder has reported a double authentication on login many times and it has never been fixed. An
earlier session in this conversation looked at it and set it aside — which, under the invariant
written two entries ago, is precisely the kind of "found nothing" that does not count as a finding.
Looked at properly, the mechanism is in the code and is not subtle.

**`auth-buttons.tsx:112-126`.** The Google Identity Services button authenticates the user and returns
a credential. The credential goes to the `signInWithGoogleIdToken` server action. If that action
returns anything other than success, the next line calls `fallbackOAuthRedirect()` — which is
`signInWithOAuth`, the full redirect to Google's consent screen. **A user who has just authenticated
with Google is sent to Google again.** The same call sits in the no-credential branch.

If the server-side exchange fails for a configuration reason — the client ID registered in Supabase's
Google provider not matching `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, or ID-token sign-in not enabled — this
fires on **every** login. That fits a defect reported repeatedly over months and never reproduced as
broken: the second flow succeeds, the user does get in, and the only signal is a toast that flashes
during a redirect they were expecting anyway. **A defect that always recovers is a defect nobody can
file.** [AUTH-1](plan/items/AUTH-1.md), P0.

**One diagnosis was checked and rejected.** An automated review named the nonce handling as the root
cause — hashed nonce to Google, raw nonce to Supabase. That asymmetry is Supabase's **documented**
pattern: Google embeds the hash in the token, Supabase hashes the raw value to compare. Relaying it
would have sent the Implementer to rewrite working code. Also positively ruled out, each with its
line: the middleware excludes `auth/callback` from its matcher, the sign-in page already redirects an
authenticated visitor away, and the callback route writes its cookies onto the response it returns.

**The first action is measurement, not a fix.** `res.error` already carries the reason and is thrown
away into a toast. Logging it server-side on one real login answers whether the exchange fails always
or occasionally, and that answer decides which fix is right. Changing code before that would be
guessing at a bug that has survived this long precisely because everyone guessed.

**The design lesson, which outlives this bug:** a silent automatic fallback to a second identity
provider round-trip is not resilience, it is a decision made on the user's behalf that their first
authentication did not count — and it converts a hard failure that would have been fixed in a day into
a soft one that survives for months. Fall back automatically only when the user cancelled; on a server
rejection, show the error and let them press the button.

Separately, two callback routes exist with `safeNextPath` and `detectLocale` duplicated verbatim;
OAuth uses one and email links the other. Consolidation is filed with the item, not as part of the fix.

## v13.84 — The rules rewritten from the failure record, and a third red gate found while doing it (2026-08-21)

The Founder's objection was correct and is the better engineering: appending Rule 14, then Rule 15, to
a list that had already grown to fifteen numbered rules plus six `G-` rules plus three doctrine
amendments is accretion, not design. `CLAUDE.md`'s Standing Rules are now **derived from the failure
families v13.83 measured**, grouped by the failure each prevents.

**The change that matters is not the grouping.** It is that every invariant now states whether a
machine checks it — `[enforced: <script>]` or `[review only]`. Twenty such labels. A rule marked
review-only is not weaker by accident; it is labelled so nobody mistakes it for a gate, which is
exactly the mistake that let `G-5a` sit unobeyed for seventy versions while its zero log entries read
as compliance.

**`G-5a` is retired outright** and replaced by an invariant it earns: _no rule may depend on voluntary
self-reporting._ A rule that asks an agent to volunteer a record of its own shortcut collects nothing.
Where self-reporting is genuinely unavoidable — as with proving absence — the rule must say so in its
own text rather than implying a check exists.

Old identifiers are preserved in an alias map, because ~13,400 lines of archive reference them and
rewriting history to match a new numbering would be its own violation. `Rule 10` is now A1, `G-7` is
A3, `G-6` is B1, `G-8` is B2, `#047` is C1, `G-5` is E1, `G-15` is E2, and so on. The file carries the
rule; the plan and its archive carry the history.

**Found while verifying the rewrite: `check-repo-language.mjs` is failing.** It is wired into CI and
it exits 1 on two counts — mojibake in `messages/de.json` (184 lines), `en.json` (141), `fr.json`
(141) and `ru.json` (139), and Turkish text in files outside the baseline, led by
`twins-leaderboard-client.tsx` (92 lines), `scripts/apply-i18n_temp.mjs` (61) and
`src/lib/agent-os/personas.ts` (51). `package.json` also carries a mojibake line.

That is the **third** red gate this session — after the i18n check that threw on a BOM and the health
endpoint that had been made to always return 200. None was reported by the agent that broke it; each
was found by someone looking for something else. The pattern is not carelessness, it is that a red
gate produces no notification anybody reads, which makes "is CI green" a question nobody currently
answers. Recorded here rather than filed as a new item: `BG` already owns the mojibake and `BI` owns
the translation backlog, and what is new is only the measurement that both are currently breaking a
check rather than merely outstanding.

Note also that the counts differ from v13.78's, which measured double-encoding _sequences_ while this
counts _lines containing_ a flagged character — 13 sequences and 141 lines are not in conflict, and
the difference is worth stating so the next reader does not treat one as a regression against the other.

## v13.83 — Recurrence analysis across the full archive, and three mechanisms that answer it (2026-08-21)

The Founder asked for the whole plan, archives included, to be analysed for defects that keep
repeating, and for the plan to be changed so they stop. Two forensic sweeps read
`docs/MASTER_PLAN_ARCHIVE.md` (5,610 lines), `docs/plan/v12.*.md` and `docs/plan/v13.*.md` in full —
roughly 13,400 lines spanning v11.54 to v13.82 — and returned **ten recurring families with 59+ dated
occurrences**. Marker counts across the same corpus: "fabricat*" **91**, "regress*" **48**, "stale"
**40**, "mojibake" **34**, `ARCHITECT=1` **22**, "retract*" **8**, `--no-verify` **5**.

What follows is not the list. The list is evidence; these are the four findings that explain it, and
what has been built in response.

### Finding 1 — The deepest pattern is measuring with the wrong instrument and reporting it as reality

Three consecutive versions each corrected the previous one's measurement error, not its judgement.
v13.5 reported "Cloudflare WAF blocks three routes" — the 403 came from the agent's own proxy. v13.6
reported "120 files contain Turkish" — a byte-wise grep matching characters that share bytes with
non-Turkish ones. v13.7 reported "the commit is not on origin" — a stale local ref that had never been
fetched. Each drove doctrine. Each was wrong about the world and right about the tool.

**It happened twice more in this session, in this file, by the Architect.** v13.71 recorded the
`public_statement` RLS policy as missing; it existed, and a delegated search had not found it. v13.66
recorded `.i18n-key-coverage-baseline` as non-existent; it had been committed the previous day
(`9c35516b`, 2026-08-19), so an external auditor was marked wrong about something it had right.

Both were **absence claims**, and absence is precisely what a delegated grep is worst at establishing:
a search that finds nothing is indistinguishable from a search that looked in the wrong place. This
single class produced more false statements in this plan than fabrication ever did.

### Finding 2 — Rules without enforcers are not weak rules, they are decorations

The v12 sweep found `G-5a` — every direct execution must be logged as a one-line exception in this
file. **It has never been logged once.** Not once in seventy versions. Any rule that asks an agent to
volunteer a record of its own shortcut collects nothing, and its zero entries then read as compliance.

Doctrine #047 already requires an enforcer per binding rule, and three specified enforcers were never
landed because `scripts/` sat outside the Architect's writable paths. But the sharper gap is one this
session measured directly: **`scripts/check-model-catalog.mjs` exists and is invoked by nothing** — no
workflow, no hook, no package script. It is the enforcer written to stop fabricated model names
returning, and it has never run. Doctrine #047 says an enforcer must ship. It never said it must be
wired, so one wasn't.

### Finding 3 — Closure has two sources of truth, and they disagree in both directions

The archive records phantom closures (prose says complete, the table says pending) and the inverse
(work verified done, the row never updated). This session produced one of each within hours: three P0
rows carried as open after the work was finished, and `ADMIN-6` ticked on a commit that could not have
closed it. **`CONST-2` is the quiet case** — its fabricated-quotes page is gone from disk, yet it was
cited as open repeatedly in this session, including by the Architect, because nothing ever recorded
its resolution.

### Finding 4 — Specifications drift out of the board and nobody notices

Measured: **106 item files, 35 referenced in the current plan, 12 carrying a closure record — and 57
that are neither.** More than half the specification corpus is in a state where nobody can act on it
and nobody can tell whether the work happened. Of the 12 that reached closure, 5 contain reopen or
regression language.

### What was built, rather than written

**`scripts/check-spec-drift.mjs`** — fails when an item file is neither referenced in this plan nor
carries a `## Closed` section. Ratcheted through `.spec-drift-baseline` at the 57 found today; entries
may only be removed. Answers Finding 4.

**`scripts/check-enforcers-wired.mjs`** — fails when a `scripts/check-*.mjs` is invoked by no workflow,
hook or package script. It caught `check-model-catalog.mjs` on its first run, which is now wired into
`ci.yml`. Answers Finding 2's sharper half.

Both are in the Master Plan Guard workflow alongside `check-plan-claims.mjs`, which already answers
Finding 3 by requiring a `closed-by:<sha>@<branch>` citation on every tick.

**Finding 1 has no automated enforcer, and pretending otherwise would repeat Finding 2.** No script can
tell whether a "does not exist" was established by looking in the right place. It becomes Rule 14 in
`CLAUDE.md` — an absence claim must cite the exact command and quote its output, and may not rest on a
delegated search — and it is enforced by review, which is a weaker mechanism honestly labelled rather
than a strong one falsely claimed.

### The chain worth remembering

The v12 sweep traced the project's only real-world incident to these patterns in sequence: an Architect
decision that the repository must stay private was written on a branch that was never merged; the
Implementer, reading `master`, saw the older instruction; and executed it correctly, making the
repository public. No agent misbehaved at any step. **Unmerged doctrine is not bookkeeping debt — it
is an instruction that is still live and now wrong**, which is why `G-8`'s sync is mandatory and why
this session merges to `master` after every entry.

## v13.82 — Batch handover: one work order for a single Implementer session (2026-08-21)

The Founder will run a full production batch in one sitting. This entry is the order that batch should
follow, written so the Implementer can work from it without re-deriving anything. Every item links to
its own specification; nothing here restates one.

### Step 0 — Founder only, and it blocks the largest share of the work

**Run the purge migration against production.** Take a restore point first. The migration deletes by
explicit id list and excludes `incident_source = 'user_submitted'`, so hand-entered incidents survive —
but verify that clause is present in the file before running it, because a wrongly deleted incident
leaves no trace that it existed. Afterwards paste back `SELECT name FROM ai_models ORDER BY name` and
the query showing the fabricated incident gone.

This is not a queue-ordering preference. Until it runs, the site publishes an unfounded accusation
against a named company, and three separate items below are gated on it because analysis or vendor
responses computed over fabricated rows compound the error instead of correcting it.

**Two more that only the Founder can do**, and neither blocks anything: confirm the incident feed URLs
are set in the Vercel project (the cron runs daily and publishes on arrival, so if rows are not
appearing this is the first place to look), and find out what the nine credit programmes decided —
checking the provider billing consoles, not only the inbox, since several grant credits silently.

### Batch A — after Step 0, in this order

[LB-3](plan/items/LB-3.md) load the corpus through the existing importer with visible attribution and
no guessed provider attributions → [RESP-1](plan/items/RESP-1.md) the moderator entry screen **and**
bulk CSV path for vendor public statements → [ANALYSIS-1](plan/items/ANALYSIS-1.md) trend view,
one taxonomy breakdown, aggregates as attributed JSON.

The order matters: statements attach to incidents, and analysis is only meaningful once both the real
corpus and the responses are in.

### Batch B — independent of the database, can run in parallel or first if Step 0 is delayed

`BG`'s remainder is now **one file**: 13 double-encoding sequences in `en.json`.
[OPS-1](plan/items/OPS-1.md) needs the grant-application create form, incident provenance surfaced in
the UI, and outreach delivery status. `api-keys` still has no key generation behind it, which is also
the monetisation path. Two are single commands rather than tasks: one `curl -i` against the deployed
`/api/health` closes `BB`, and one real visit through a tagged social link closes `BH` — and that
second one unblocks [TRACT-1](plan/items/TRACT-1.md), which every funding route depends on.

### Batch C — hygiene and enforcement, no dependencies

[HYG-4](plan/items/HYG-4.md) the BOM write path, still producing corrupted files.
[CI-2](plan/items/CI-2.md) decide between the two CI systems. [RATE-1](plan/items/RATE-1.md) classify
the 92 API routes. [KNIP-1](plan/items/KNIP-1.md), [MEM-1b](plan/items/MEM-1b.md) — measure before
changing — [REPO-1](plan/items/REPO-1.md), [ADMIN-METRICS-2](plan/items/ADMIN-METRICS-2.md).

### Decisions, not work

These are waiting on a person and no amount of Implementer time moves them: the canonical price
schedule ([FUND-2](plan/items/FUND-2.md) cannot close without it), whether to delete the three
unpublished locale files, the non-dilutive application track
([FUND-3](plan/items/FUND-3.md)), and the launch gate. Social publication
([SOCIAL-1](plan/items/SOCIAL-1.md)) unlocks the moment Step 0 lands, not before.

### Reporting protocol, because it is what made the last three deliveries verifiable

Push before reporting. Include the output of `git ls-remote origin master` in the report and confirm it
matches local `HEAD`. Cite the commit that did the work, and make sure that commit touched a file the
backlog row names — `check-closure-evidence.mjs` rejects citations that lead anywhere else, and it has
rejected the Architect's own twice.

Do not mark a row complete on behalf of another row. Do not set `ARCHITECT=1` to edit this file; the
Implementer never edits it. If a hook fails, that is a finding to report, not an obstacle to bypass —
a full test run takes under a minute and produces evidence where a judgement call produces an
assertion.

## v13.81 — Why the corpus is not being used, in three specific pieces (2026-08-21)

The Founder asked why the accumulated incidents are not analysed, why publicly given vendor responses
are not recorded as responses, and why unanswered ones do not simply stay unanswered. The third is
already correct; the first two have precise causes, and one of them is sharper than expected.

**Recording a public statement is impossible today, and the feature is otherwise finished.** `LB-4`
shipped the column and its constraint, the moderator-only insert policy, `source_url`,
`statement_date`, `verified_by`, `public_statement_count`, `disclosure_rate`, and a distinct label in
the response card. Measured: `public_statement` appears in exactly three files —
`incident-detail.tsx`, `provider-response-card.tsx`, `types/index.ts` — and **all three read it.**
There is no form, no server action, no import path, no admin screen that writes one. The feature is
complete except for the part where a human can use it, which is why every incident reads "awaiting
response" no matter what the vendor did in public. [RESP-1](plan/items/RESP-1.md), filed P0, and it
needs bulk entry rather than a one-at-a-time form — the backlog is thousands of incidents whose vendor
statements already exist publicly.

**The corpus is imported and never analysed.** The only aggregate over incidents is
`provider_leaderboard` — counts, response rate, trust score. The import parses `Severity`, `CVSS`,
`Attack vector`, `OWASP LLM`, `OWASP ASI`, `MITRE ATLAS`, `NIST AI RMF`, `CVE IDs` and `Quality tier`,
and **nothing reads any of them.** A registry holding thousands of classified incidents that publishes
only per-vendor counts is sitting on its own primary asset. The taxonomy columns are what make it
citable by auditors and regulators rather than merely interesting.
[ANALYSIS-1](plan/items/ANALYSIS-1.md).

**Ingestion itself is scheduled and set to publish.** `vercel.json` runs `import-incidents` daily and
`importIncidents` defaults `autoPublish` to **true**, so rows publish on arrival once the feed URLs
are set in the Vercel project — which cannot be checked from here. Whether the pipeline is flowing is
a question for the Vercel cron log, not for this repository.

**The unanswered case needs no work.** `response_rate` counts token-verified official replies only and
`disclosure_rate` covers both kinds, so an incident with no response stays visibly unanswered and a
public statement never masquerades as a reply. That was `LB-4`'s design decision and it holds.

**Both new items are gated behind the purge**, for the same reason as everything else: analysis over a
table still containing fabricated rows produces charts that are wrong in a way no reader can detect,
and recording vendor responses against fabricated incidents would compound the original error rather
than correct it. The migration exists and has never been run against production.

## v13.80 — `I18N-3` closes; what remains of the mojibake item is one file (2026-08-21)

`2fe485ca`, verified on `origin/master`. All three loose ends from v13.79 are closed, and one of them
was solved slightly better than specified.

`scripts/check-i18n.mjs` **exits 0**. The BOM is stripped on read (`:30`,
`replace(/^\uFEFF/, "")`) so a stray BOM is now survivable rather than fatal, and `publicLangs` is
`["en", "tr"]` (`:75`). The CI gate is green again.

`src/components/seo/json-ld.tsx` derives every `inLanguage` from `SUPPORTED_LOCALES` — all three
occurrences, not only the wrong one — so the file can no longer contradict itself the next time the
locale list changes. That is the fix rather than the patch.

The redirects are in place and **cover a case this board did not specify**: `next.config.mjs:206`
handles the bare `/de` alongside `/de/:path*` at `:211`, both permanent. A bare prefix would have kept
404ing under the rule as written.

`npx tsc --noEmit` exits 0. **`I18N-3` closes**, cited `2fe485ca`.

**What this leaves of `BG`.** The mojibake item covered five files. `tr` is clean, and `de`, `fr` and
`ru` are no longer served — so the live surface reduces to `en.json`, which still carries **13**
double-encoding sequences. That is the whole of the remaining user-visible work.

The three unpublished files are a separate question and worth answering deliberately: they are
corrupted, BOM-prefixed, 95% English, and now unreachable. Keeping them means `HYG-4`'s BOM count never
reaches zero and every future contributor has to work out why three locale files exist that nothing
loads. Deleting them is the tidier answer, and the translations they would have needed do not exist to
lose — but that is a Founder call, since it forecloses on re-adding those languages cheaply later.

One cosmetic residue: `check-i18n.mjs`'s success message still announces "public 5-lang parity" while
checking two. Harmless, and worth a word the next time that file is open.

**Third consecutive delivery verified with no correction on what was claimed.** The pattern that
changed is narrow and worth naming: the work is pushed before the report, the report carries the remote
hash, and the claim describes artifacts a reviewer can open. Nothing about the difficulty of the work
changed.

## v13.77 — The health endpoint fixed properly; mojibake down by two thirds and not gone (2026-08-21)

Pushed as `3bfd65c8` and verified on `origin/master`, with the remote hash reported alongside the
claim for the first time — which is why this entry took one measurement instead of three.

**`HEALTH-1` closes, and the fix is the right one rather than the convenient one.**
`api/health/unified/route.ts:10` now reads
`const httpStatus = report.overall === "healthy" ? 200 : 503`, so the status code follows the report
again. `/api/health/live` exists as a separate constant-200 liveness route for the platform probe, and
the middleware bypass is now scoped to skipping i18n rather than rewriting the path. That is the
routing defect `BB` actually described, solved without disabling the signal.

**`BB` stays open one more step.** The code is right; its acceptance is a production request to
`/api/health` returning 200 without a redirect, and that cannot be checked from here. One `curl -i`
against the deployed URL closes it.

**`BH`'s write path is complete.** `referral-tracker.tsx:15-19` reads `utm_source` (and the older `bh`
and `ref` parameters), and calls `trackFunnelEvent("visit", { source })`, which inserts into
`funnel_events` (`src/actions/funnel.ts:24`). The links are tagged and something now reads the tag.
Its acceptance — a test visit appearing in the marketing panel with its source — needs one real visit
to demonstrate; after that `TRACT-1` is unblocked for the first time.

**`BG` improved substantially and is not closed.** Measured on `origin/master`: `Ã` fell from 28 to
**2**, `Â` from 38 to **13**, and `â€` remains at 0. But `Å` is **84**, exactly what it was before —
untouched. These are real corruptions, not false positives: `"…Geleceğini Åekillendirin"` and
`"Radikal Åeffaflık"` should both be `Ş`, and the surviving `Â` sequences are `360Â°` where `°`
belongs.

The reason a general fix keeps missing them is worth writing down: these `Å` characters are
**orphaned**. A normal double-encoding stores `ş` as `ÅŸ`, which a cp1252→UTF-8 round-trip reverses
mechanically. Here the second byte is already gone, so the round-trip has nothing to work with and the
character has to be mapped directly — `Å` → `Ş`, `Â°` → `°` — after confirming no legitimate use of
those characters exists in the file. It parses as valid JSON with 95 top-level keys, so the damage is
in the string values only.

**Process note.** This is the second consecutive delivery where the claim survived verification with
no correction needed on the parts that were claimed, and the first where the remote hash was given
before the check was asked for. The health fix also went beyond the specification in the right
direction — a separate liveness route was a suggestion, not a requirement, and shipping it is what
made the 503 restoration safe.

## 0. Where things live

The Founder asked why the project runs everything through this one file instead of a professional
structure. It does not have to — **the professional structure already exists and is unused**:

| Need                                                | File                                          | State                                                                           |
| --------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| System architecture, layers, ER diagram, RLS matrix | `docs/ARCHITECTURE.md` (246 lines, Mermaid)   | Exists; last updated 2026-06-01                                                 |
| Architecture decisions                              | `docs/adr/0001…0011` (8 records, MADR format) | **Live again** — ADR-011 written v13.48; Architect may write here (G-6 amended) |
| Historical narrative, closed audits                 | `docs/plan/v13.x.md`, `docs/plan/v12.*.md`    | Frozen record — never edited                                                    |
| Per-item detail and acceptance                      | `docs/plan/items/<ID>.md` (65 files)          | Live                                                                            |
| Binding rules and roles                             | `CLAUDE.md`, `AGENTS.md`                      | Live                                                                            |
| Operational board                                   | **this file**                                 | Live                                                                            |

**The defect was routing, not absence.** Decisions that belonged in `docs/adr/` were written as
version sections here, so this file grew to 601 lines against a 600-line cap and new entries could
only be added by deleting old ones — the project was losing memory to a line limit. From v13.47
onward: architecture decisions go to `docs/adr/`, narrative goes to `docs/plan/`, this board carries
only what is currently true.

## 1. Current state (measured 2026-08-17)

| Fact                                          | Evidence                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck` **exits 0**                  | Stable across two rebases                                                                                                             |
| `pnpm lint` **fails: 20 errors**              | Improved from 27 (`no-explicit-any` 16→8, half cleared without the item being closed). Sole push gate: [TYPE-3](plan/items/TYPE-3.md) |
| `src/lib/agent-os/` complete                  | `scouts/ecosystem-scout.ts` created; all imports resolve                                                                              |
| CI has produced **zero successful runs**      | `runner_id: 0`, 2-second failures. **Root cause now known:** GitHub Actions quota exhausted (Founder, 2026-08-17)                     |
| `.husky/pre-push` blocks all pushes           | Runs `pnpm typecheck && pnpm lint && pnpm test`; correct behaviour against a red tree                                                 |
| Architect commit `e88e94b9` (v13.46) unpushed | Blocked by the above; 1 ahead / 16 behind `origin/master`                                                                             |
| Local test suite                              | 1063/1063 passing, verified independently twice                                                                                       |
| ALPAR AI ↔ Agent-OS coupling                  | 3 of 58 tables, 1 of 21 workflows; `src/lib/autopilot/` imports only Supabase + generated types                                       |

## 2. Active backlog

| ID  | P   | Owner | Work | Acceptance |
| --- | --- | ----- | ---- | ---------- |

| **✅ [VOICE-1](plan/items/VOICE-1.md)** closed-by:babb4435@master | **P0** | Implementer | `src/app/api/ai/transcribe/route.ts` returns a hardcoded invented transcript — itself an accusation against an AI model — with HTTP 200 when transcription fails, placing fabricated evidence into a user's incident report. Delete the fallback; fail visibly | A failed transcription returns non-2xx with a reason; no branch returns invented prose; transcribed text needs explicit confirmation; a test asserts failure leaves the field untouched |
| **✅ [INTAKE-1](plan/items/INTAKE-1.md)** closed-by:babb4435@master | P1 | Implementer | Filing an incident requires both a 200-char title and a 5,000-char description (`incident-form.tsx:718-737`), offers a stale model list from `ai_models`, and its voice alternative needs a signed-in session on top of `AUTH-1` | One mandatory free-text field; an unlisted model does not block submission; the voice control works or states its requirement; funnel counts exist for opened and submitted |
| **✅ [AUTH-1](plan/items/AUTH-1.md)** closed-by:babb4435@master | **P0** | Implementer | Google sign-in re-authenticates through a second full OAuth redirect whenever the ID-token exchange fails (`auth-buttons.tsx:112-126`), so a configuration failure produces a double login on every attempt and the only signal is a transient toast. Log `res.error` first, then fix what it names; never re-authenticate silently on server rejection | Failed exchange logged with its Supabase error code; a successful sign-in makes exactly one identity-provider round-trip; retry is user-initiated; e2e test asserts it |
| **[RESP-1](plan/items/RESP-1.md)** | **P0** | Implementer | `public_statement` is read in three files and written in none — no form, no action, no import path. Every incident reads "awaiting response" whatever the vendor said publicly. Needs a moderator entry screen **and** bulk CSV entry, reusing the existing importer | A moderator records a statement from the UI and it appears with its source; a non-moderator insert is refused; bulk entry reports inserted/skipped; `response_rate` unchanged by a public statement |
| **[ANALYSIS-1](plan/items/ANALYSIS-1.md)** | P1 | Implementer | The import parses severity, CVSS, attack vector, OWASP, MITRE ATLAS and NIST classifications and nothing reads them; the only aggregate is per-vendor counts. Build trend-over-time, taxonomy breakdowns, and the aggregates as attributed JSON | A trend view and one taxonomy breakdown on the public site, both from queries; aggregates available as JSON with CC BY 4.0 attribution. **Starts after the purge runs** |
| **[LB-1](plan/items/LB-1.md)** | **P0** | Implementer | Purge fabricated `ai_models` rows and the incidents attributed to them — including a live published accusation against a named real company about a product that never existed. Plus `scripts/check-model-catalog.mjs` so the next seed migration cannot undo it | Model list contains only vendor-verifiable names; fabricated incident absent from `/en/incidents` and from that provider's `incident_count`; enforcer exits 1 on a reintroduced name |
| **✅ [LB-2](plan/items/LB-2.md)** closed-by:47db3b8e@master | **P0** | Implementer | 25 cron handlers exist, no `vercel.json` and no `"crons"` key — none has ever run. Schedule by priority within the plan's cap, set `AIAAIC_FEED_URL`/`AIID_FEED_URL`/`CRON_SECRET`, document every route left unscheduled | Vercel dashboard lists the crons; authenticated call to `import-incidents` returns real counts, not `"No feeds executed"` |
| **[LB-3](plan/items/LB-3.md)** | P1 | Implementer | Load the VulcanLab corpus (4,328 records, CC BY 4.0) through the existing importer — do not write a second one. Visible attribution ships with the data; unresolvable rows get a null provider, never a guessed one | `incident_source='aiid_import'` count matches the importer's `inserted`; 5 rows spot-checked against `source_url`; attribution visible on the deployed page. **Starts only after LB-1 has deployed** |
| **[LB-4](plan/items/LB-4.md)** | P1 | Implementer | Record vendor public statements as a distinct `response_type`, moderator-inserted, cited by `source_url` — displayed as a different thing from a token-verified reply. `response_rate` keeps its meaning; new `disclosure_rate` covers both | A `public_statement` moves `disclosure_rate` and leaves `response_rate` unchanged; DB rejects an `official_reply` with null `responder_email`; non-moderator insert refused |
| **[FUND-2](plan/items/FUND-2.md)** | **P0** | Architect → Implementer | Investor materials contradict each other: three price schedules for one product, a data-moat claim ("371 published incidents") resting on the rows `LB-1` is deleting, and "infinity runway" stated as a company property. Cap table and unit economics absent | One price schedule (or a stated "under revision") across every document; every figure traces to a query, a source or a Rule 10 tag; "infinity runway" returns no grep hits; one deck source |
| **[OPS-1](plan/items/OPS-1.md)** | P1 | Implementer | Make the panel the system of record: move the existing user count to the dashboard, surface incident provenance in the UI, **`date_applied`/`date_decided`/`amount_requested`/`decision` landed `7e7d0a6a`; `amount_granted` still missing**, so an arriving credit cannot be recorded as an amount. Dashboard user count still absent; create form still absent. Runs **with** `ADMIN-6` | No figure on any admin page originates from a seed migration; each question answerable without opening a mailbox |
| **[SEC-2](plan/items/SEC-2.md)** | P2 | Implementer + Founder | `SECURITY.md` and `security.txt` already exist — fix the "in the process of launching" bounty line, and confirm whether the HackerOne and Reddit connectors are scheduled at all, given no cron here had ever run | Bounty line states what is actually offered; connector schedule confirmed; nothing from a public forum publishes without moderation |
| **[FUND-1](plan/items/FUND-1.md)** | P1 | **Founder** | **Rewritten after a Founder correction: the applications were submitted.** Reconcile what came back — mailbox and provider billing consoles, since several grant credits silently — and add the outcome columns the table lacks. **No gate dependency** | Every programme carries a submission date and an outcome (or an explicit \"no reply as of <date>\"); credits received appear in the finance costs table with their expiry |
| **[TRACT-1](plan/items/TRACT-1.md)** | P1 | Implementer | No usage figure exists for any application — the deck offers route and migration counts as traction. Land `BH`, then report visitors, signups, subscribers, submissions and API calls from live queries | Every figure produced by a query against a live table and visible in the admin panel; one week of channel breakdown; deck cites those figures |
| **[MAIL-1](plan/items/MAIL-1.md)** | P1 | Implementer + Founder | 3 of 7 outreach messages never arrived and nobody knew for three weeks; the other 4 went unanswered. Route outreach through the already-wired Resend with delivery webhooks, and use the unused `linkedin_contacts` pipeline | Every outbound message recorded with status; a bounce is visible within a day; the 3 failed addresses verified or marked unreachable |
| **[FUND-3](plan/items/FUND-3.md)** | P1 | **Founder** | Non-dilutive track first — TÜBİTAK/KOSGEB/Teknopark domestically, open-source and public-interest funders internationally — because the revenue model is unresolved and VC diligence opens with it. Verify every programme's terms at source before drafting | Eligibility checklist per programme with source URL and date; one application submitted; no venture outreach before the gates close and `TRACT-1` produces figures |
| **[SOCIAL-1](plan/items/SOCIAL-1.md)** | P2 | Founder + Implementer | Two accounts fed by the product, every post citing a `source_url`, leading with the response mechanic rather than accusation. Fix the footer GitHub link, which points at a repository name that now only resolves by redirect | Footer link resolves canonically; every post links a source; `BH` landed and channel attribution visible |
| **✅ [ADMIN-7](plan/items/ADMIN-7.md)** closed-by:7f760b07@master | **P0** | Implementer | The dashboard now passes five invented literals to `AiBudgetTransparencyScore` (`score={94}`, `verifiedClaimsCount={342}`, …) where it previously showed honest "not measured" states. A missing-prop warning was resolved by inventing the props, while closing the item whose purpose is removing sourceless figures | `src/app/[locale]/admin/page.tsx` passes no metric literal; `scripts/check-admin-metrics.mjs` fails on a numeric literal passed as a JSX prop |
| **✅ [ADMIN-8](plan/items/ADMIN-8.md)** closed-by:a3e83f80@master | P2 | Implementer | `src/components/admin/AiBudgetTransparencyScore.tsx` renders three fields blank where two correctly say "Ölçülmedi", and `(0%)` reports usage of an unknown budget. Give them the same not-measured state — without inventing values, which is `ADMIN-7` | Every field shows a real value or an explicit not-measured state; no metric field renders empty; `check-admin-metrics.mjs` still passes |
| **✅ [ADMIN-6](plan/items/ADMIN-6.md)** closed-by:803acee6@master | P1 | Implementer | Admin panel truth pass: inventory every figure and its source, then wire, empty-state or delete each hardcoded literal — **k-benchmark's ten fabricated scores are gone and the `api-keys` maintenance message is cleared; the budget widget regression is fixed (`ADMIN-7`, `7f760b07`). **Still outstanding: the inventory table this item names as its own first deliverable, the two disagreeing price tables, and a sweep confirming no admin route renders `undefined`**; reconcile the two disagreeing price tables; extend `check-admin-metrics.mjs` as the enforcer | Inventory table complete; no admin route renders `undefined`; no figure traces to an uninventoried literal; enforcer fails on a new hardcoded metric |
| **✅ [HEALTH-1](plan/items/HEALTH-1.md)** closed-by:3bfd65c8@master | P1 | Implementer | `src/app/api/health/unified/route.ts` forced `httpStatus = 200` so the endpoint reported healthy whether or not it was. Fixed: the status now follows the report, `src/app/api/health/live/route.ts` carries the constant-200 liveness probe, and the middleware bypass no longer rewrites the path | `/api/health` reaches the handler without a redirect; the status code changes when a dependency is down |
| **[LEGAL-3](plan/items/LEGAL-3.md)** | P1 | Implementer | Wire `/dashboard/legal` (69-line stub, no query) to `takedown_requests`, `takedown_appeals`, `cease_and_desist_logs`. Aggregates public, per-request detail admin-only | Counts change when a row is inserted; anonymous session cannot see requester email |
| **[MARKET-1](plan/items/MARKET-1.md)** | P1 | Implementer | Real, cited AI-ecosystem/market/financial analysis for VC conversations — external market data already researched and sourced; 5-year projections tagged `[tahmin — doğrulanmamış]` per Rule 10 | Every figure sourced/dated; ships only after `TYPE-3` and `CONST-2` close |
| **✅ [I18N-3](plan/items/I18N-3.md)** closed-by:2fe485ca@master | P1 | Implementer + **Founder** (scope call) | **Decision taken and landed (`f88dcf99`): only `en` and `tr` are published.** Follow-through outstanding — `scripts/check-i18n.mjs` throws on the BOM'd files and still hardcodes five locales (**CI red now**), `src/components/seo/json-ld.tsx:73` still declares five to search engines, and `/de`, `/fr`, `/ru` 404 with no redirect | `check-i18n.mjs` exits 0 and derives its locale list from `SUPPORTED_LOCALES`; `json-ld` declares only published locales; `/de/:path*` redirects to `/en/:path*`; no `messages/*.json` carries a BOM |
| **[HYG-4](plan/items/HYG-4.md)** | P1 | Implementer | PowerShell `Set-Content -Encoding UTF8` is writing BOM-prefixed files, which broke `lint-staged` for every commit today and caused fresh mojibake in `AiBudgetTransparencyScore.tsx`. `package.json` and 3 docs files fixed directly; 13 `src/**`/scripts files remain | `git ls-files` BOM scan returns 0; PowerShell write path switched to `utf8NoBOM` |
| **[INVEST-1](plan/items/INVEST-1.md)** | P1 | Implementer | Investor-readiness admin panel: checklist (not a score) sourced from real checks, plus VC/co-founder advisor personas extending `expert-personas.ts` | `check-admin-metrics.mjs` passes; every number traces to a command or a linked item |
| **[ADMIN-METRICS-2](plan/items/ADMIN-METRICS-2.md)** | P1 | Implementer | Fix two blind spots in `check-admin-metrics.mjs` (brace-interpolated local constants, Turkish percent-first notation) found by a real violation that passed through it | Negative-test fixture demonstrates both catches; no regression on existing findings |
| **[CONST-1](plan/items/CONST-1.md)** | P2 | Implementer | Community AI Charter — "Draft v0.1, open for co-authorship," `docs/constitution/` articles (ADR-style), public page, reusing the existing `suggestions` mechanism for amendments | Framing states draft/co-authorship, not settled authority; no announcement before `TYPE-3` closes |
| **[REPO-1](plan/items/REPO-1.md)** | P1 | Implementer | Clear the repository root: **46** tracked files (was 83 — re-measured 2026-08-20), 8 of them legitimate config; 1.4 MB of build output, scraped HTML and superseded generated copies. Root-anchored `.gitignore` rules so they cannot return | `git ls-files \| grep -cE "^[^/]+\.(js\|html\|png\|txt)$"` returns 0; build, test and lint still pass |
| **[CI-2](plan/items/CI-2.md)** | P1 | Implementer | `.gitlab-ci.yml` sits at the root beside 24 GitHub workflows — two CI systems, one presumably dead, and no way for a contributor to tell which gate is real | Exactly one CI configuration remains; a test push shows it running; the item file records what was removed |
| **[RATE-1](plan/items/RATE-1.md)** | P1 | Implementer | Rate limiting reaches 24 of 92 API route files. Classify all 92 as mutating / paid / read-only, limit the first two through the existing `rate-limit.ts`, document the third as deliberate | Classification table complete; every mutating or paid route imports a limiter; enforcer fails on a new unprotected mutating route |
| **[KNIP-1](plan/items/KNIP-1.md)** | P2 | Implementer | `knip` is installed with a script and invoked by no workflow — dead-code analysis that analyses nothing while looking like coverage | `knip` runs in CI with a ratcheted baseline, or is removed from `package.json` |
| **[MEM-1b](plan/items/MEM-1b.md)** | P2 | Implementer | `--max-old-space-size=8192` on `build` and `typecheck`, necessity unmeasured. Measure peak memory first; change the flag only against a number | Peak memory for both commands recorded; flag lowered to a justified figure or documented as load-bearing |
| **BA** | P0 | **Founder** (not delegable) | Cloudflare: read Security → Events for the last 24h, report which user-agents are actually blocked. Closes if the list is empty | Report produced; WAF rules unchanged unless the log justifies a change |
| **BB** | P0 | Implementer | ZETA-0c: `/api/health` 308 → 200, smoke test green | Next deploy shown as smoke-test verified |
| **BD** | P0 | **Founder** (GATE) | Approve `docs/campaigns/` launch drafts → HN + Reddit | First 24h `funnel_events` counts reported |
| **BG** | P0 | Implementer | Repair mojibake in `messages/{en,tr,de,fr,ru}.json` (`â€`, `Ã`, `â€™`, `â€œ` compounds) | Scan returns 0; `pnpm lint && pnpm typecheck` pass |
| **BH** | P0 | Implementer | Source parameter on social links; `src/actions/funnel.ts` writes it to `funnel_events`; `/admin/marketing` breakdown | Test visit appears in panel with its source |
| **BI** | P0 | Implementer | Tier A: `README.md` and public-facing files translated to English | Files leave `.repo-language-baseline`; CI stays green |
| **✅ UI-1** | P1 | Implementer | Admin foundation (spec: §v13.60) — delete dead `--fs-*`/`--space-*` tokens; add `shell` prop to `AdminContainer` and `subnav` slot to `AdminPageHeader`; rename the duplicate `MetricCard` in `metric-card.tsx` to `TrendMetricCard` across its 10 import sites | Verified `a900a8ee`: `admin-design-kit.tsx` line 14 (`shell` prop), line 45 (`subnav` slot), zero dead tokens, TrendMetricCard complete |
| **✅ UI-2** | P1 | Implementer | Admin streaming (spec: §v13.60) — split `finance/page.tsx`'s external billing fetch into a `<Suspense>`-wrapped Server Component with a revalidate window; apply the same split where a page makes >1 independent slow call | Verified `a900a8ee`: `finance/page.tsx` lines 46–60 VercelLiveCostCard async component, global `admin/loading.tsx` refined |
| **✅ UI-3** | P1 | Implementer | Admin shell migration (spec: §v13.60) — 46 hand-typed shells and 40 raw `<h1>` moved onto `AdminContainer`/`AdminPageHeader`, batched by sidebar group, Operations first. Depends on UI-1 | Verified `a900a8ee`: `finance/page.tsx` line 288 `<AdminContainer shell>`, `moderation/page.tsx` line 45 same, no changes above `return`; 42 files in migration batch |
| **✅ UI-4** | P1 | Implementer | Admin responsive verification (spec: §v13.60) — add a 375px-viewport `test.describe` to `admin-360-pages.spec.ts` asserting no horizontal overflow; fix only what it flags | Verified `a900a8ee`: `admin-360-pages.spec.ts` extended with 375px viewport block, all 67 routes pass |

| **[CI-COST-1](plan/items/CI-COST-1.md)** | P1 | Architect | Path filters (`docs/**`, `**.md`) plus `concurrency: cancel-in-progress` across the 21 workflows | Docs-only commit triggers no build |
| **[SKILL-1](plan/items/SKILL-1.md)** | P1 | Implementer | Copy `.agents/skills/{bilge-kurul,graphify}/` into `.claude/skills/` — nothing reads `.agents/skills/` today | Both invocable in a fresh session |
| **[HIER-1](plan/items/HIER-1.md)** | P1 | Implementer | `.agents/hierarchy.json` binding the command hierarchy to existing role prompts (see §4) | Dispatcher resolves a task to one specialist |
| **[MEM-1](plan/items/MEM-1.md)** | P1 | Implementer | Semantic memory: `agent_memory` table + pgvector, write path as a `policies.ts` entry, `retrieveContext()` read path, embeddings from the wired Google adapter | A fact stored in one session is retrieved by semantic query in a later one |
| **BC** | P1 | Implementer | ZETA-0b: CI i18n parity (`de/fr/ru`), Release ruleset bypass limited to GitHub Actions, Security Audit `pnpm-audit`, Plan Guard + Master Plan Guard | All five green on `master` |
| **BE** | P2 | Implementer | 4 dependabot PRs | At least two merged |
| **BF** | P2 | Implementer | Move DecasHub + Agent-OS directives to `docs/plan/tier0-portfolio.md` | No non-ALPAR product directive remains in this file |
| **BK** | P2 | Implementer | English freeze notice atop each archive group | Notice present; bytes otherwise unchanged |
| **BL** | P2 | Implementer | Tier B internal docs translated in read-frequency order | `check-masterplan-consistency.mjs` still passes |

**Carried forward — with a correction.** The paragraph previously here stated that the
authentication bypass was **not** contained and that three call sites read
`process.env.IS_PLAYWRIGHT_TEST` directly. **That was stale and is wrong.** Verified 2026-08-17:
`src/lib/auth/test-bypass.ts` returns false unconditionally when `NODE_ENV === "production"`,
otherwise requires `NODE_ENV === "test"` **and** `NEXT_TEST_AUTH_BYPASS` **and**
`IS_PLAYWRIGHT_TEST`; `assertTestBypassSafe()` throws if either flag is seen in production. It is
imported at all three call sites — `src/middleware.ts`, `src/lib/auth/session.ts`,
`src/actions/incidents.ts`. The text was copied into the v13.47 restructure without re-measurement,
which is the same defect this board keeps correcting in others; recorded rather than quietly
deleted, since anyone reading the board as a security summary would have been misled about the most
sensitive control in the project.

Genuinely still open: unknown blog slug returns 200 rather than 404; no `BlogPosting` JSON-LD; no
`/pricing/i` heading; four e2e specs outside CI.

## 3. Legal action register — Case #001 (Grok passport incident)

| #   | Institution   | Channel                           | Date        | Reference    | Status                                |
| --- | ------------- | --------------------------------- | ----------- | ------------ | ------------------------------------- |
| 1   | xAI Corp.     | Email (privacy@x.ai, legal@x.ai)  | 13 Aug 2026 | `f1da1610`   | Awaiting reply (due 12 Sep 2026)      |
| 2   | KVKK          | Email (iletisim@kvkk.gov.tr)      | 13 Aug 2026 | `985c8335`   | Awaiting reply                        |
| 3   | ICO (UK)      | Email (casework@ico.org.uk)       | 13 Aug 2026 | `354e9212`   | Awaiting reply                        |
| 4   | CNIL (FR/EU)  | Email (webmaster@cnil.fr)         | 13 Aug 2026 | `51db9f32`   | Awaiting reply                        |
| 5   | EU AI Office  | Email (ai-office@ec.europa.eu)    | 13 Aug 2026 | `19d55c84`   | Awaiting reply                        |
| 6   | FTC (USA)     | Online form (reportfraud.ftc.gov) | 13 Aug 2026 | `#205404412` | Submitted                             |
| 7   | KVKK e-Devlet | sikayet.kvkk.gov.tr (form)        | —           | —            | **Blocked** — profile address missing |

`case_001.status` still claims "Under Investigation by KVKK, EU Commission" with no sourced
evidence. Six of seven bodies have acknowledged nothing. Founder decision pending: correct the
claim or source it.
