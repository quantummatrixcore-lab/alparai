# TRANS-1 — the public transpare

- **Board id:** 343
- **Status:** pending
- **Priority:** P0
- **Owner:** Founder
- **Closed by:** —

## Record

**TRANS-1 (new, v13.30) — the public transparency report publishes a registered-user count.** `/tr/transparency` renders eleven live figures; `src/app/[locale]/transparency/page.tsx:67` counts `public.users` directly. **Nothing here is fabricated** — every number is a live query, so this is a scoping question, not an honesty defect, and it must be handled as one. It was deliberate, not accidental: added in `f7becfa5` (2026-06-08) with the original transparency feature and restructured in `4244bf7b`. The argument for removing it is that "registered users" is a **growth-funnel metric, not an accountability metric**: the other ten figures (incidents reported, published, pending moderation, provider response rate, providers tracked, takedown requests) all describe the public-interest dataset, while this one describes the company. A transparency report about AI incidents has no reason to carry the operator's signup count, and publishing it invites readers to judge the dataset by our traction instead of by its contents. **That scoping argument must be the stated reason.** Removing the figure merely because it is small — with no principle behind it — would be precisely the behaviour we score providers for, on the one page where that would be most visible. **Acceptance:** Founder rules; if removed, the registered-user figure is dropped from the public card while every incident and provider metric stays untouched, and the page keeps its full count of accountability data
