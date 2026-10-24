# Security Policy — ALPAR AI Enterprise & Sovereign Infrastructure

> **Last Updated:** 2026-10-24  
> **Status:** Active, Enacted & Cryptographically Enforced  
> **Security Contact:** security@alparai.com  
> **Canonical Policy:** https://alparai.com/SECURITY.md  
> **RFC 9116 File:** https://alparai.com/.well-known/security.txt  
> **Governing Standards:** RFC 9116, ISO/IEC 27037:2012, EU AI Act (Regulation (EU) 2024/1689 Art. 73)

---

## 1. Executive Security & Leadership Council

Security oversight, cryptographic keys, vulnerability disclosures, and forensic integrity within the ALPAR AI sovereign platform are governed by the Sovereign Executive Board pursuant to `AGENTS.md` (Article 4):

* **Founder & Chief Architect (CTO):** Ercüment Erden (`ercumenterden.com` | `ercument.erden@alparai.com` | `+90 (532) 440-83-89`)
* **Chair of Law & International Arbitration Board:** Prof. Dr. Musa Aygül (`musaaygul.com` — Head of Commercial Law Department, Selçuk University Faculty of Law)
* **Public Relations & Media Lead:** Ahmet Rıfat Albuz (`ahmetrifatalbuz.com`)

---

## 2. Defense in Depth Architecture

ALPAR AI implements strict defense-in-depth across the transport, application, runtime, and database tiers:

| Layer | Implementation / Specification |
| :--- | :--- |
| **Transport Security** | Strict HTTPS only, HSTS Preload: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| **Framing & Clickjacking** | `X-Frame-Options: DENY` combined with CSP `frame-ancestors 'none'` |
| **MIME Sniffing Protection** | `X-Content-Type-Options: nosniff` |
| **Referrer Privacy** | `Referrer-Policy: strict-origin-when-cross-origin` |
| **Permissions Policy** | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| **Content Security Policy (CSP)** | Granular source restrictions preventing unauthorized script injection and exfiltration |
| **Network Boundary** | **Port 22 Absolute Prohibition.** SSH Port 22 is disabled globally across all servers, cloud instances, and tunnels. Access is restricted to authenticated WireGuard Mesh networks and Zero-Trust identity tunnels. |

---

## 3. Epistemic Firewall & Runtime Boundary

The ALPAR AI Epistemic Firewall operates as an in-memory, zero-allocation runtime proxy intercepting inputs and outputs between users and AI model backends:

* **Zero-Allocation Latency:** Operates in-memory (RAM-only) without disk-write serialization, ensuring sub-millisecond overhead.
* **Deterministic Filtering:** Real-time semantic analysis halts jailbreak payloads, indirect prompt injections, and illicit data exfiltration before model execution.
* **Consensus Cross-Audit:** High-stakes outputs trigger automated multi-model consensus validation to identify and suppress synthetic hallucinations.

---

## 4. PII Guardian Engine (src/lib/pii/guardian.ts)

All inbound user-generated text, crash logs, and telemetry must pass through our deterministic PII Guardian engine prior to persistence:

* **Email:** RFC 5322 regex validation and tokenization.
* **Phone Numbers:** Turkish landline/GSM and international E.164 formats (10 to 15 digits).
* **Turkish National ID (TC Kimlik No):** Algorithmic verification via modulus-10 checksum validation.
* **Passports:** International and Republic of Türkiye passport patterns (`[A-Z]\d{8}`).
* **Financial Instruments:** IBAN validation (MOD-97 checksum) and credit/debit card identification (Luhn MOD-10 algorithm).
* **Network & Cloud Identifiers:** IP addresses (IPv4/IPv6), AWS/GCP/Azure internal resource endpoints.
* **API Keys & Credentials:** High-entropy string scanning targeting prefixes like `sk-`, `ghp_`, `AKIA`, `xai-`, and private key headers (`-----BEGIN PRIVATE KEY-----`).

*Guarantee: Any identified PII is tokenized or masked in volatile memory. Plaintext PII is never stored in persistent databases or log sinks.*

---

## 5. EU AI Act Article 73 & Mandatory Incident Reporting

In compliance with Regulation (EU) 2024/1689 (EU AI Act), ALPAR AI enforces statutory incident notification protocols:

* **Article 73 Timelines:**
  - **Critical Threats & Fatal Incidents:** Serious incidents resulting in death or critical bodily injury trigger statutory notification within **2 calendar days** of formal triage.
  - **Critical Disruption of Public Infrastructure:** Serious incidents causing widespread disruption to critical infrastructure are notified within **10 calendar days**.
  - **General Statutory Ceiling:** All other qualified serious algorithmic incidents are formally reported within **15 calendar days**.
* **Vendor Due Process (72-Hour Right of Reply):** Before any public actuarial rating downgrade, affected AI operators receive a 72-hour window to review forensic telemetric captures and submit counter-evidence or instant remediation proofs.

---

## 6. ISO/IEC 27037 Digital Forensic Chain of Custody & Legal Evidence

Every incident reported or audited on ALPAR AI is captured under ISO/IEC 27037 digital forensic evidence standards:

1. **Digital Evidence Integrity:**
   - Raw telemetric captures (prompts, completion tokens, latent embeddings, timestamps) are sealed with SHA-256 cryptographic hashes immediately upon receipt.
   - Evidence records cannot be mutated, retroactively edited, or purged without invalidating the cryptographic Merkle root.
2. **Admissibility under Turkish Law (HMK m. 199):**
   - Pursuant to Turkish Code of Civil Procedure (HMK) Article 199, cryptographically signed digital logs generated by ALPAR AI constitute admissible electronic documents (*elektronik senet/delil*) for commercial and administrative courts.
3. **W3C Verifiable Credentials & DIDs:**
   - Forensic certificates (`IncidentPassport`) are issued with decentralized identifiers, allowing third-party judicial and regulatory bodies to independently verify authenticity.

---

## 7. Rate Limiting & DoS Shield

| Endpoint / Operation | Rate Limit | Scope / Algorithm |
| :--- | :--- | :--- |
| **Incident Submission** | 5 / hour | Sliding window (`user_id:ip`) |
| **Community Feedback** | 10 / day | Sliding window (`user_id`) |
| **Authentication Flow** | 10 / 15 minutes | Sliding window (`ip`) |
| **Public REST API** | 100 / minute | Token bucket (`ip`) |
| **Takedown & Arbitration Appeals** | 3 / 24 hours | Sliding window (`ip:incident_id`) |

Enforced via distributed Edge rate limiting with automated IP jail routing upon anomaly detection.

---

## 8. RFC 9116 Security Policy & Contact

ALPAR AI maintains a machine-readable security policy compliant with RFC 9116 located at `/.well-known/security.txt`:

```text
Contact: mailto:security@alparai.com
Contact: mailto:ercument.erden@alparai.com
Expires: 2027-12-31T23:59:59.000Z
Encryption: https://alparai.com/pgp-key.asc
Preferred-Languages: en, tr
Canonical: https://alparai.com/.well-known/security.txt
Policy: https://alparai.com/SECURITY.md
Hiring: https://alparai.com/careers
Acknowledgments: https://alparai.com/security/hall-of-fame
```

---

## 9. Responsible Vulnerability Disclosure & Safe Harbor

We hold the global security and AI research community in the highest regard and actively support ethical vulnerability disclosure:

* **Reporting Channel:** Email reports to **security@alparai.com** (PGP public key available upon request).
* **SLA Timelines:**
  - Initial acknowledgement within **24 to 48 hours**.
  - Triage and impact assessment within **72 hours**.
  - Remediation patch deployment within **7 business days**.
* **Bug Bounty & Hall of Fame:** Valid, original, and reproducible security vulnerabilities are eligible for recognition in our Security Hall of Fame and commercial performance bounties.
* **Safe Harbor Guarantee:** ALPAR AI commits to initiate no legal or criminal action against researchers who discover and report vulnerabilities in good faith, provided they comply with responsible disclosure guidelines and refrain from data exfiltration, service disruption, or PII harvesting.
