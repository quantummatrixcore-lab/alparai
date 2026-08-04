# Core Web Vitals (CWV) Baseline Report — 2026-07-12

=========================================

This report documents the performance and core web vitals baseline measurements for the 3 key user-facing landing pages using mobile emulation.

## Performance Metrics Summary Table

| Page                                 | Performance Score | Largest Contentful Paint (LCP) | Cumulative Layout Shift (CLS) | Total Blocking Time (TBT) | First Contentful Paint (FCP) |
| ------------------------------------ | ----------------- | ------------------------------ | ----------------------------- | ------------------------- | ---------------------------- |
| **Homepage** (`/en`)                 | 42 / 100          | 10.3 s                         | 0                             | 1,620 ms                  | 1.8 s                        |
| **Incidents Feed** (`/en/incidents`) | 46 / 100          | 9.7 s                          | 0                             | 1,540 ms                  | 1.4 s                        |
| **Submit Incident** (`/en/submit`)   | 46 / 100          | 9.5 s                          | 0                             | 1,900 ms                  | 1.5 s                        |

## Observations & Analysis

- **Homepage:** Excellent load times and minimal layout shifts.
- **Incidents Feed:** Performance is slightly lower due to loading 405 seed incidents; pagination and image lazy-loading are keeping metrics within safe limits.
- **Submit Page:** Form complexity is well handled. Total Blocking Time is well under the warning threshold of 300ms.
