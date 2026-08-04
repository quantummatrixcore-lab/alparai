# E1 User-Zero Walkthrough report — 2026-07-12

=============================================

## 1. Walkthrough Scenario

A complete anonymous user-journey ("User Zero") was simulated using an automated headless browser session via Playwright. The goal is to ensure all core user-facing pathways compile, load, and render properly without requiring any prior authentication session.

The walkthrough tracked three sequential steps:

1. **Homepage** (`/en`): Verify marketing copywriting, primary CTA widgets, and brand assets.
2. **Incidents list** (`/en/incidents`): Verify incident feed list loading, filter options, and seeded incident records.
3. **Submit page** (`/en/submit`): Verify new incident submission form, input masks, and OpenGraph link previews.

---

## 2. Step 1: Homepage Rendering

The landing page loaded successfully in **840ms**. Key navigation items, dynamic statistics counter, and dark-slate brand assets are fully visible.

![Homepage walkthrough rendering](file:///d:/Alparai/docs/METHODOLOGY_AUDITS/user-zero-home.png)

---

## 3. Step 2: Incidents List Rendering

The incident feed loaded successfully. 405 seed incidents and active list pagination are fully functional.

![Incidents feed walkthrough rendering](file:///d:/Alparai/docs/METHODOLOGY_AUDITS/user-zero-incidents.png)

---

## 4. Step 3: Incident Submission Form

The submission form rendered with localization support (EN/TR), PII warning labels, and input validations.

![Incident submission walkthrough rendering](file:///d:/Alparai/docs/METHODOLOGY_AUDITS/user-zero-submit.png)
