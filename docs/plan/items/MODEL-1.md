# MODEL-1

**MODEL-1** — Atatürk model packaging: rename the `gazi` route and the `nav_gazi` label to a neutral strategic-advisor name, drop `public/brand-assets/ataturk-silhouette.svg`, and flatten the `.agents/swarm/` military-republic naming. Owner: Implementer (v13.40).

## Why

The live system prompt was changed in `7d7001e3` from first-person impersonation to a strategic-advisor framing carrying an explicit "you are an AI system" disclosure, explicitly for Law 5816 compliance. That removes the impersonation objection and the Founder's decision is to keep the feature.

What remains is packaging that still asserts what the prompt no longer claims. The route path, the navigation label and the silhouette asset all point at the person; a silhouette is an identity claim in image form. Keeping them leaves the product saying one thing in its prompt and another in its interface.

Separately, `.agents/swarm/` carries the same framing into agent prompts — `GAZİ_KOMUTAN.md`, `GENEL_KURMAY.md`, `İSTİHBARAT_EMNİYETİ.md`, `YILDIRIM_KITALARI.md`. This is not a legal exposure; it is a press and recruiting one. An accountability company's internal governance reading as a paramilitary republic is a poor first impression if the repository is public — and repository visibility is currently `ölçülmedi`.

## Scope

- `src/app/[locale]/admin/gazi/page.tsx`, `gazi-chat.tsx`, `src/app/api/admin/gazi/route.ts` — rename the route segment.
- `src/components/admin/sidebar.tsx` — the nav entry near line 346.
- `messages/en.json`, `messages/tr.json` — the `nav_gazi` key. Admin namespace is EN/TR only; no DE/FR/RU work.
- `src/lib/constants/rate-limits.ts`, `src/lib/utils/rate-limit.ts` — the `admin_gazi_chat` key follows the rename.
- `public/brand-assets/ataturk-silhouette.svg` — delete.
- `.agents/swarm/**`, `.agents/SWARM_DOCTRINE.md`, `.agents/persistent-agents.json` — neutral role names.

## Explicitly out of scope

These are unrelated and must not be touched:

- `src/actions/admin/run-bench-tr-evaluation.ts:28` — `expectedKeywords: ["1923", "Atatürk"]` is a Turkish-benchmark factual QA item.
- `tests/pii-guardian.test.ts:239` — "Ataturk Mahallesi" is a street-address PII fixture.
- `src/components/admin/create-user-modal.tsx:85,99` — form placeholders.

## Acceptance

- No `gazi` reference remains under `src/`, `messages/`, `public/` or `.agents/` outside the out-of-scope list.
- `pnpm lint`, `pnpm typecheck` and `node scripts/check-i18n.mjs` exit 0.
- `node scripts/check-internal-links.mjs` exits 0 — the sidebar entry is an internal link, so removing the key without the nav entry, or the reverse, fails here.

## Superseded by later instruction — needs Founder ruling

`0b82659` ("implement ERCU-1 and MODEL-1") deleted the `.agents/swarm/` doctrine files, closing
the flattening half of this item. But the same commit range added
`src/app/[locale]/admin/ai-hub/swarm/page.tsx` — a new admin page visualizing an _expanded_
hierarchy (Gazi Başkomutan → Fatih Sultan Mehmet → Mimar Sinan → six divisions), which is the
opposite of "flatten the naming."

This may not be a violation. Later the same day the Founder said explicitly: "atatürk ve
diğerlerini burada görmek istiyorum" (I want to see Atatürk and the others here), and the
advisor roster this session built at his direction (`d3464f38`) keeps the full Turkish role
names by design. MODEL-1's flattening goal and the Founder's later instruction point opposite
directions, and the Architect is not resolving that unilaterally.

**Open question for the Founder:** does the swarm hierarchy page stay as built, or does MODEL-1's
original flattening still apply to it? Whichever is chosen, record the decision here with a SHA.
