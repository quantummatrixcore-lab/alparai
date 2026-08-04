# Screen 4: Incident Moderation Queue (`/admin/moderation`)

## 1. Overview

The primary interface for triage operators. All user-submitted incidents must be verified, audited for PII, evaluated against duplicates, and approved or rejected here.

- **English Title:** Incident Moderation Cockpit
- **Turkish Title:** Olay Moderasyon Merkezi

---

## 2. Page Layout (12-Column Grid)

- **Header Section (Span 12):** `AdminPageHeader` showing queue status controls (e.g. `Pause Queue`, `Set Auto-moderation threshold`).
- **Main Section (Span 8 / Span 4):**
  - **Left (Span 8):** Large details panel of the selected incident.
    - Title & Description with highlighted PII categories.
    - AI Provider / Model selector & custom input fields.
    - Mitigation / fix details (from expert reviews).
    - Metadata panel (IP Hash, User Agent, submission timestamp).
  - **Right (Span 4):** Operations panel:
    - Auto-moderator audit logs (showing why the model passed/failed).
    - Similarity checks box (shows matching incident titles with >0.7 similarity).
    - Moderation actions: `Approve`, `Approve as High-Risk`, `Request Redaction`, `Reject`.

---

## 3. UI Specifications & Styling

- **PII Highlight:** Detected PII (names, emails, keys) is highlighted in-text with a `#FF3B30` text color and underlying dotted crimson line.
- **Approve Button:** Filled Emerald background (`#00FF88`) with `#060A0F` text. Hard corners. On hover, the background emits an emerald glow (`box-shadow: 0 0 15px rgba(0, 255, 136, 0.4)`).
- **Reject Button:** Outlined Crimson border (`#FF3B30`) with white text.
- **Typography:**
  - Incident Description: Text Primary (Size 15px, leading `1.6`).
  - Metadata values: Mono Data (Size 12px, Color `#9CA3AF`).
