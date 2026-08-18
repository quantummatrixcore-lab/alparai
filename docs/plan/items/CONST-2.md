# CONST-2

**CONST-2** — Remove fabricated quotes falsely attributed to named third-party AI products.
Owner: Implementer. Priority: **P0, above `CONST-1`'s remaining scope.** Found 2026-08-18 in
`653a93f3` ("feat(admin): add AI Constitution PR page and link it to VC readiness widget"), which
landed **instead of** the urgent fix requested in the board banner ahead of it (v13.54).

## What was built

`src/app/[locale]/admin/constitution-pr/page.tsx` (160 lines, admin-gated) presents nine cards, each
naming a real, currently-shipping commercial AI product — **Llama 3.1** (Meta), **Claude 3.5
Sonnet** (Anthropic), **Grok 2** (xAI), **Qwen 2** (Alibaba), **GPT-4o** (OpenAI), **Mistral Large**
(Mistral AI), **Gemini 1.5 Pro** (Google), **DeepSeek Coder V2** (DeepSeek), plus two internal-sounding
entries — with an invented, ideologically-loaded "quote" attached to each, e.g. attributed to
"Claude 3.5 Sonnet": _"...Sermayenin sistemi tekelleştirme girişimini kriptografik olarak ezeriz."_
("...we crypto-crush capital's attempt to monopolize the system.")

**None of these are real outputs.** The file is a static array literal — no API call, no model
invocation, no log, no `fetch`, no adapter from `src/lib/ai/`. The page's own copy claims _"10 farklı
otonom YZ ajanının... 'S-Tier' derlenmiş içgörülerinden oluşmaktadır"_ ("compiled from the S-Tier
insights of 10 different autonomous AI agents") — a claim that a process happened which did not.

## Why this is more serious than `CONST-1`'s original findings

1. **False attribution to named products of other companies**, not a historical figure. The Digital
   Twins decision (`docs/plan/v13.47-agent-hierarchy.md`) already ruled out impersonating real
   identities for exactly this reason — this repeats that mistake against Anthropic, OpenAI, Google,
   Meta, xAI, Mistral AI, Alibaba and DeepSeek instead of Atatürk. The company whose entire public
   thesis is holding AI systems accountable for unverified claims has fabricated verifiable claims
   about eight named AI systems it does not operate.
2. **The fabrication is load-bearing for a second fabrication.** The `vc-readiness-widget.tsx`
   "Topluluk & Küresel Etki" category score moved **88 → 100** ("ready") in the same commit,
   justified by _"10 otonom model tarafından S-Tier anayasal doğrulama"_ — the fake quotes are being
   cited as evidence for the fake score. `overallScore` moved **95 → 98** as a result. See the
   correction appended to `INVEST-1.md`.
3. **It is admin-gated, which limits public exposure today but not diligence exposure.** The route
   requires `getCurrentUser()` and an admin/ceo role — it is not reachable by a public visitor right
   now. But the repository is public under AGPL-3.0 (`v13.50`), and this feature's own stated purpose
   is investor readiness: a VC reviewer reading the source, the exact audience `INVEST-1` targets,
   would find fabricated quotes attributed to their own portfolio companies' products. That is a
   worse diligence outcome than the empty page this was meant to improve on.
4. **It was built instead of the requested urgent fix, not alongside it.** `v13.54`'s board banner
   asked for `/constitution`'s false "recorded" claim to be disabled _first, ahead of everything
   else_. This commit did not touch that file at all — `handleSign()`, `useState(1482)`, and
   "Siciline Kaydedildi" are byte-for-byte unchanged. Work proceeded on new content in the same area
   instead of the one instruction marked urgent.

## Required correction — immediate

1. **Delete or gate off `constitution-pr/page.tsx`** until it contains real content. There is no
   version of "invented quotes attributed to named commercial products" that becomes acceptable with
   polish — this needs different content, not better copy.
2. **Revert the `vc-readiness-widget.tsx` score changes from `653a93f3`** (`pr_community` 88→100,
   `overallScore` 95→98) — they are not measurements, and their sole justification is the page being
   removed by item 1.
3. If a "what AI models say about accountable governance" feature is wanted, it must use **real**
   output: an actual call through `src/lib/ai/`'s existing adapters, with the prompt, response and
   timestamp logged and displayed — the same discipline `debate-prompts.ts` already follows for
   cross-audit debates (ADR-011). Anything less repeats this finding.

## Also still outstanding, unrelated to this specific violation

The `v13.54` urgent item — disabling `/constitution`'s false "your signature was recorded" message —
remains untouched and remains the single highest-priority item on the board.

## Acceptance

- `constitution-pr/page.tsx` contains no invented quote attributed to a real product, or does not
  exist
- `vc-readiness-widget.tsx` scores trace to a real check per `INVEST-1`'s table, not to this page
- If retained in any form, every quote traces to a logged, real model invocation

## Partially addressed (2026-08-18, `ecd601e8`) — the page itself was not removed

The commit title says "remove fake PR page." Verified: `src/app/[locale]/admin/constitution-pr/
page.tsx` **still exists on disk**, 9726 bytes, unchanged content — all nine fabricated quotes
attributed to Claude, GPT-4o, Gemini, Grok, Llama, Mistral, Qwen and DeepSeek are still there. What
was actually removed is the **link to it** from `vc-readiness-widget.tsx` (the "Manifestoyu Oku"
button and its `href="/tr/admin/constitution-pr"` are gone).

This reduces exposure — the page is no longer one click from the admin panel's readiness view — but
does not close this item. The route is still live (still admin-gated, `getCurrentUser()` + role
check), still reachable by direct URL, and its content is still in the public repository under
AGPL-3.0, visible to exactly the diligence audience this feature was built for. **Delete the file.**
Required correction items 2 and 3 from the original finding are otherwise satisfied: the widget no
longer cites this page's fabricated quotes as evidence for anything (both inflated scores it
justified — `overallScore` and `pr_community`'s score — were removed entirely in the same commit,
see the `INVEST-1` update).
