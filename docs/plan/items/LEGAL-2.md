# LEGAL-2

**LEGAL-2** — Publish a DMCA notice-and-takedown policy and a content-moderation policy. Owner:
Implementer. Priority: P0 (v13.45).

## Why P0

ALPAR hosts third-party allegations about named companies. Under the EU Digital Services Act a
published notice-and-action procedure is part of what separates a platform with a safe harbour
from one without. The takedown _flow_ exists in code (`src/actions/takedown.ts`,
`src/actions/appeal.ts`); the _published policy_ describing it does not.

This is cheap, and it is the kind of gap that only matters on the day it matters.

## Scope

- `/legal/dmca` — notice format, designated contact, counter-notice procedure, timelines.
- `/legal/moderation` — what gets published, what gets rejected, who decides, how to appeal.
  Describe the real process in `src/actions/admin/moderation.ts`, not an aspirational one.
- Both linked from the footer alongside the existing privacy, terms and cookie pages.
- Five languages.

## Acceptance

Both routes render in all five locales; `node scripts/check-internal-links.mjs` exits 0; the
described appeal path matches the code, including the fact that no moderator UI currently
resolves appeals (open item).
