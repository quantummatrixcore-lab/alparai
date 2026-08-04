# Screen 6: Billing & API Usage (`/admin/billing`)

## 1. Overview

Financial control panel for monitoring live API usage, monthly subscription costs, model invocation token counts, and overall platform R&D spend.

- **English Title:** Costs & Usage Dashboard
- **Turkish Title:** Maliyet ve Kullanım Paneli

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` showing billing cycle indicators and export buttons.
- **Top Row (Span 3 each):** 4 metric indicators:
  1. Monthly Spend (Estimated USD, emerald colored)
  2. Free Tier DB capacity (Used % gauge)
  3. Total Tokens Used (Count)
  4. Resend email monthly quota (Used % gauge)
- **Middle Row (Span 8 / Span 4):**
  - **Left (Span 8):** Multi-model cost breakdown chart (Stacked bar chart in Recharts, comparing OpenRouter / Vertex / Hugging Face).
  - **Right (Span 4):** Vendor subscription status panel (GitHub Copilot, Resend, Vercel plans).
- **Bottom Row (Span 12):** Detailed API logs billing table.

---

## 3. UI Specifications & Styling

- **Spend Value:** Mono Data (Size 28px, Color `#00FF88` with a subtle glow).
- **Stacked Bar Chart:** Colors use the brand gradient scheme:
  - OpenRouter: `#a855f7` (Neon Purple)
  - Vertex AI: `#00D2FF` (Tech Blue)
  - Hugging Face: `#FFD000` (Amber Warning)
- **Typography:**
  - Token counts: Mono Data (Size 14px).
  - Telemetry logs: Mono Data (Size 12px, Color `#9CA3AF`).
