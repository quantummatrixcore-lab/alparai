# ADR-004: next-intl with `localePrefix: "always"`

- **Status:** Accepted
- **Date:** 2026-06-01

## Decision

Use **next-intl** with `localePrefix: "always"`. All public routes are prefixed with `/en` or `/tr`.

## Rationale

- The platform is global. Implicit language detection is convenient but hurts SEO and user trust ("why is my URL changing?").
- `localePrefix: "always"` is the only way to guarantee that a shared link in chat / email / social always opens in the language the sender intended.
- `next-intl` integrates with App Router, supports Server Components, has a single canonical config file, and emits type-safe translation keys.

## Consequences

- Each URL is locale-explicit.
- SEO is per-locale.

* Slightly longer URLs (`/en/incidents` vs `/incidents`).
* We must handle the root URL `/` (default locale redirect).

## Setup

- `src/i18n/routing.ts` — `defineRouting({ locales: ["en", "tr"], defaultLocale: "en", localePrefix: "always" })`
- `src/i18n/request.ts` — `getRequestConfig` loads the right message file
- `src/middleware.ts` — runs `createIntlMiddleware(routing)`
- `src/app/[locale]/...` — all routes
- `messages/{en,tr}.json` — copy

## Alternatives

- **`localePrefix: "as-needed"`:** rejected. Link-sharing breaks across languages.
- **No i18n (English only) for v1:** considered. We have a Turkish-speaking founding team; bilingual is part of the brand.
- **Sub-path per brand (`/alpar-tr` etc.):** rejected. Confusing.
