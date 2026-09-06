# Security Policy & Vulnerability Disclosure

## Supported Versions

We actively support and provide security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The ALPAR AI team takes security and privacy seriously. If you discover a security vulnerability, we appreciate your cooperation in disclosing it to us responsibly.

### How to Report

Please report security issues via email to our dedicated security contact:

* 🔒 **Primary Security Contact:** [security@alparai.com](mailto:security@alparai.com)
* 🛡️ **Encrypted Whistleblower Contact:** [ihbar@alparai.com](mailto:ihbar@alparai.com)

**Please do NOT open public GitHub issues or discussions for undisclosed security vulnerabilities.**

### What to Include
* Type of vulnerability (e.g., XSS, CSRF, RCE, Authentication bypass, PII leakage).
* Detailed step-by-step instructions or proof-of-concept (PoC) to reproduce the issue.
* Impact assessment: what an attacker could achieve by exploiting the issue.
* Any potential remediation steps you have identified.

### Our Commitment
* **Acknowledgment:** We will acknowledge receipt of your report within **48 hours**.
* **Triage & Status:** We will confirm the vulnerability and provide status updates within **7 business days**.
* **Remediation:** Once verified, we will release a security patch promptly and credit you in our security release notes (unless you prefer anonymity).

## Built-In Security Architecture
* **Strict Transport Security (HSTS):** Enforced with preload headers across all subdomains.
* **Content Security Policy (CSP):** Strict allowlist, frame-ancestors 'none', and zero inline script evaluation.
* **Row-Level Security (RLS):** Supabase PostgreSQL RLS enforced across 100% of data tables.
* **Zero-PII Guardian:** Server-side Luhn algorithm and regex pattern filters eliminate PII before database storage.
* **EU AI Act Alignment:** Compliant with EU Regulation 2024/1689 security and data governance standards.
