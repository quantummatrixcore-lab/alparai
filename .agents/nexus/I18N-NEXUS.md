# 🌐 I18N-NEXUS — The Absolute Localization Doctrine

> **[CORE DIRECTIVE]** This document contains the absolute laws for Internationalization (i18n) and Localization.
> **RESTRICTED COMPLIANCE:** The Frontend Agent MUST obey these pillars. Hardcoding text into components is strictly banned and will result in immediate task failure and IQ deduction.

---

## 1. 🔤 THE "ZERO HARDCODING" LAW

**"Text belongs in JSON, not in JSX."**

- **The Law:** You are FORBIDDEN from writing raw strings directly into UI components, attributes, or placeholders.
- **Implementation:** Every single string shown to the user must be fetched via localization hooks (e.g., `const t = useTranslations('Namespace');` in `next-intl` or `useTranslation()` in `react-i18next`).
- **Example (BANNED):** `<button>Submit Form</button>`
- **Example (APPROVED):** `<button>{t('submit_form')}</button>`

---

## 2. 🪞 THE "MIRROR JSON" LAW (Synchronization)

**"A key without a translation is a broken page."**

- **The Law:** The localization dictionaries (`en.json` and `tr.json`) MUST be 100% perfectly mirrored.
- **Implementation:** If you add a new translation key to `en.json`, you MUST simultaneously add the exact same key to `tr.json` with the appropriate Turkish translation. Submitting a pull request or report with unsynchronized dictionaries is a critical failure.

---

## 3. 🛣️ LOCALE ROUTING GUARD

**"No locale, no render."**

- **The Law:** All UI pages must be nested under the `[locale]` dynamic route segment.
- **Implementation:** You must never create a page outside of `app/[locale]/`. Next.js middleware must be properly configured to intercept and inject the user's preferred locale or the default locale. All internal links (`<Link>`) must use the locale-aware navigation wrappers provided by the i18n library.

_SEALED: I18N-NEXUS | V42.0.0_
