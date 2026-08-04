# Screen 8: Launch Signal & Trust Metrics (`/admin/launch-signal`)

## 1. Overview

The launch control center tracking the pre-launch checklist, DORA metrics, test-suite status, API latency, and compliance checklists.

- **English Title:** Launch Signal & Compliance
- **Turkish Title:** Lansman Sinyali ve Uyumluluk

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` showing the master launch progress bar (e.g. `92.4% Ready`).
- **Top Row (Span 4 each):** 3 metrics:
  1. Automated Test Suite (Green tick / Red cross + test count)
  2. Average API Latency (Milliseconds, tech blue)
  3. DORA Deploy Frequency (Deploys/day, Mono Data)
- **Main Section (Span 12 Bento Grid):**
  - **Bento Tile 1 (Span 6):** Technical checklist (Supabase RLS status, PII guardian regex test status, OAuth redirect config).
  - **Bento Tile 2 (Span 6):** Business & Legal checklist (KVKK text localization TR/EN, Terms of Service, PR campaign readiness).

---

## 3. UI Specifications & Styling

- **Launch Progress Gauge:** Ring-style circular gauge with a glowing Emerald path.
- **Checklist Items:** Simple bullet points with custom checkbox indicators:
  - Checked: `#00FF88` (green tick).
  - Pending: `#FFD000` (amber warning icon).
- **Typography:**
  - Metric values: Mono Data (Size 28px, Color `#00FF88` / `#00D2FF`).
  - Checklist item labels: Display Bold (Size 14px, Color `#F3F4F6`).
