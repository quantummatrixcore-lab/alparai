# Screen 3: Innovations Management (`/admin/innovations`)

## 1. Overview

Curation space to track, review, and classify state-sponsored AI programs, R&D grants, and regulatory innovations across global jurisdictions.

- **English Title:** AI Innovations & Governance
- **Turkish Title:** Yapay Zeka Yenilikleri ve Yönetişim

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` with filters for `Country/Jurisdiction`, `Funding Tier`, and `Taxonomy Stage`.
- **Top Row (Span 4 each):** 3 metrics:
  1. Monitored Programs (Total count)
  2. Public Funding Tracked (Total currency value, e.g. `$2.4B` in emerald green)
  3. Active Policies (Count + trend delta)
- **Main Section (Span 8 / Span 4):**
  - **Left (Span 8):** Multi-select interactive list of innovation initiatives, showing funding amount, parent organization, and status.
  - **Right (Span 4):** Sidebar creation/edit form for entering new policy records (conforming to the validation schemas).

---

## 3. UI Specifications & Styling

- **Input Fields:** Semi-transparent input boxes (`background: rgba(255, 255, 255, 0.02)`) with a `1px` bottom border of `rgba(255, 255, 255, 0.1)`. On focus, the border turns to Emerald `#00FF88` with a subtle glow.
- **Funding Amount Tag:** Mono Data (Size 14px, Color `#00FF88` with a faint `rgba(0, 255, 136, 0.1)` background chip).
- **Typography:**
  - Initiative Title: Display Bold (Size 16px).
  - Description: Text Secondary (Size 14px).
