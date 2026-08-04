# Screen 9: K-Benchmark Matrix (`/admin/k-benchmark`)

## 1. Overview

The trust-matrix management console, mapping global LLMs against key accountability scores (Hallucination Rate, PII Protection, Regulatory compliance).

- **English Title:** K-Benchmark Configuration
- **Turkish Title:** K-Kıyaslama Konfigürasyonu

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` showing options to trigger a benchmark rerun or import new benchmark data files.
- **Top Row (Span 4 each):** 3 metrics:
  1. Benchmarked Models (Count)
  2. Average System Trust Score (Percentage)
  3. Last benchmark run (Date/Time + green status indicator)
- **Main Section (Span 12):** Interactive matrix/grid:
  - Row header: Model name (e.g. GPT-4o, Claude 3.5 Sonnet, Llama-3 70B).
  - Column 1: Hallucination rate (lower = better, amber/red warning threshold).
  - Column 2: PII protection score (higher = better, tech blue / emerald).
  - Column 3: Jailbreak vulnerability (% value).
  - Column 4: Compliance score (% value).
  - Column 5: Edit scores button.

---

## 3. UI Specifications & Styling

- **Score Cell Heatmap:** Subtle background color intensity maps to score value:
  - Excellent: 90%+ has a faint `#00FF88` (Emerald) background tint.
  - Caution: 60%-79% has a faint `#FFD000` (Amber) background tint.
  - Fail: <60% has a faint `#FF3B30` (Crimson) background tint.
- **Interactive Modals:** Selecting a cell opens a sliding glassmorphic sidebar from the right (`width: 400px`) showing the detailed test cases.
- **Typography:**
  - Scores: Mono Data (Size 14px, Color `#F3F4F6`).
  - Model Names: Display Bold (Size 14px, Color `#F3F4F6`).
