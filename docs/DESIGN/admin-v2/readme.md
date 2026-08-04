# ALPAR AI — Admin Visual Overhaul v2 Design System

This document establishes the official visual design specs and system tokens for the **ALPAR AI Admin Console (v2)**. These specs are optimized for dark slate and emerald branding, structured for a 12-column Bento-grid system, and fully localized for English and Turkish.

---

## 1. Core Visual Tokens

### Colors

- **Obsidian Dark (Primary BG):** `#060A0F` — Absolute deep slate-black background.
- **Slate Gray (Card Fills / Secondary BG):** `#0E1622` — Frosted glass container fill (60% opacity with backdrop-blur).
- **Emerald Neon (Primary Brand Accent):** `#00FF88` — High-luminous accent for key CTAs, active status, and positive trend highlights.
- **Tech Blue (Info / Secondary Accent):** `#00D2FF` — Used for neutral data streams, informational tooltips, and secondary highlights.
- **Amber Warning (Warning):** `#FFD000` — For pending status, medium severity alerts, and warning thresholds (>60%).
- **Crimson Alert (Danger):** `#FF3B30` — For critical incidents, failed states, and danger thresholds (>80%).
- **Text Primary (High Emphasis):** `#F3F4F6` (Cool Gray 100) — Dominant text color.
- **Text Secondary (Medium Emphasis):** `#9CA3AF` (Cool Gray 400) — Sub-headers, descriptors, labels.
- **Text Muted (Low Emphasis):** `#6B7280` (Cool Gray 500) — Telemetry labels, system timestamps.

### Typography (Space Grotesk)

- **Display Bold:** `font-family: 'Space Grotesk', sans-serif; font-weight: 700;`
- **Mono Data:** `font-family: 'Space Grotesk', monospace; font-weight: 500;` (used for numeric logs and telemetry to emulate monospaced alignment).

---

## 2. Layout & Bento Grid Architecture

All screens conform to a modular **12-column grid** on Desktop, transitioning to a single-column stack on Mobile:

- **Gutters:** 24px (1.5rem)
- **Radius:** Softly Technical (`0.5rem` / `rounded-lg` for containers, `0.25rem` / `rounded-sm` for buttons and input fields).
- **Elevation:** Depth is achieved via `backdrop-filter: blur(20px)` and a `1px` border of `rgba(255, 255, 255, 0.05)` rather than drop shadows.

---

## 3. Screen Inventory

The following 10 admin screens have detailed design specifications:

1. [Admin Overview Dashboard](file:///d:/Alparai/docs/DESIGN/admin-v2/overview.md) — Main system control center.
2. [Ecosystem News Queue](file:///d:/Alparai/docs/DESIGN/admin-v2/ecosystem.md) — Verification queue for external feeds.
3. [Innovations Management](file:///d:/Alparai/docs/DESIGN/admin-v2/innovations.md) — Curation page for state-support and innovations.
4. [Incident Moderation Queue](file:///d:/Alparai/docs/DESIGN/admin-v2/moderation.md) — Incident lifecycle and triage cockpit.
5. [User Roles & RBAC Management](file:///d:/Alparai/docs/DESIGN/admin-v2/users.md) — User moderation and advisor promote/demote.
6. [Billing & API Usage](file:///d:/Alparai/docs/DESIGN/admin-v2/billing.md) — Costs monitoring and quota tracker.
7. [Third-Party Catalog & Capacity](file:///d:/Alparai/docs/DESIGN/admin-v2/resources.md) — Vendor matrix and live database storage metrics.
8. [Launch Signal & Trust Metrics](file:///d:/Alparai/docs/DESIGN/admin-v2/launch-signal.md) — Pre-launch checklist and live audit signals.
9. [K-Benchmark Matrix](file:///d:/Alparai/docs/DESIGN/admin-v2/k-benchmark.md) — Provider assessment and scoring setup.
10. [DSAR Requests & Privacy Logs](file:///d:/Alparai/docs/DESIGN/admin-v2/dsar.md) — GDPR/KVKK compliance logs and deletion triggers.
