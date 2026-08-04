# Item 122 — SSRF Guard in Social-Intelligence Action Evidence

Date: 2026-07-18 · Implemented by: Antigravity

## Delivered

1. **SSRF Guard Helpers** refactored to `src/lib/security/ssrf.ts` (removed from `use server` export):
   - `isSafeUrl(urlStr)`: Resolves hostnames to IP addresses using Node's `dns` module, verifies scheme is `https:` only, and rejects local/private loopback/IP ranges including IPv6 (`::1`, `fe80::`, `fd00::`) and CGNAT (`100.64.0.0/10`).
   - `fetchWithSsrfGuard(urlStr, options)`: Prevents automatic redirect following, manually resolves and validates each redirect target against `isSafeUrl`, enforces a 2MB size cap, and limits execution time to 8000ms.
2. **Scraper Integration**:
   - `fetchContentFromUrl` modified to routing all requests (YouTube oEmbed, api.fxtwitter.com, and General URL scraping) through `fetchWithSsrfGuard`.
3. **Unit Tests**:
   - `src/actions/social-intelligence.test.ts` validates:
     - Allow public HTTPS URLs.
     - Reject non-HTTPS HTTP schemes.
     - Reject `localhost` and `127.0.0.1`.
     - Reject private IP addresses (IPv4, IPv6 local/private, CGNAT).
     - Reject link-local metadata addresses (`169.254.169.254`).
     - Reject DNS resolution redirecting to private ranges.

## Verification

- Unit tests passed successfully:
  ```
  npx vitest run src/actions/social-intelligence.test.ts
  Test Files  1 passed (1)
       Tests  6 passed (6)
  ```
- Linter and typechecks are clean for the modified files.
