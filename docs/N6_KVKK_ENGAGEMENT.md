# N6 — KVKK Kurulu Engagement (Draft)

**Date**: 2026-07-12  
**Status**: Draft (not yet submitted)

## Objective

Establish formal communication with the Turkish Personal Data Protection Authority (KVKK / Kişisel Verileri Koruma Kurulu) regarding ALPAR AI's data processing activities and VERBIS registration.

## VERBIS Registration Status

| Item                         | Status                                             |
| ---------------------------- | -------------------------------------------------- |
| Data Controller Registration | Pending (to be completed before formal engagement) |
| Data Processing Inventory    | See below                                          |
| Legal Entity                 | ALPAR AI (individual operator — Ercüment Erden)    |

## Data Processing Inventory

| Processing Activity | Legal Basis                   | Data Categories                                  | Retention              |
| ------------------- | ----------------------------- | ------------------------------------------------ | ---------------------- |
| Incident submission | Consent / Legitimate interest | Email (hash only), incident details (PII-masked) | 10 years               |
| User registration   | Contract performance          | Email, name, OAuth profile                       | Until account deletion |
| Cookie analytics    | Consent                       | Anonymous page views (Plausible)                 | 26 months              |
| Email notifications | Consent                       | Email address                                    | Until opt-out          |

## PII Protection Measures

- **PII Guardian**: All user-submitted free-text is masked at insert time (`src/lib/pii/guardian.ts`).
- **Email hashing**: Anonymized before storage (SHA-256 with salt).
- **No raw IP logging**: Plausible Analytics operates without IP storage.
- **Data minimization**: Only essential fields collected; all optional fields explicitly labeled.

## Proposed Engagement

1. **VERBIS Registration**: Complete DRC (Data Controller Registry) entry.
2. **KVKK Information Request**: Voluntary notification of ALPAR AI's data processing activities.
3. **KVKK-Kurul Görüşü**: Request informal opinion on incident registry as "public interest" processing.
4. **Collaboration**: Offer anonymized incident data for KVKK's AI investigations (Grok, ChatGPT, etc.).

## Action Items

- [ ] Complete VERBIS registration at https://verbis.kvkk.gov.tr
- [ ] Draft formal information letter to KVKK Kurulu
- [ ] Prepare PII Guardian audit documentation
- [ ] Define data retention/deletion procedures
