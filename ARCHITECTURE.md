# 🏗️ ALPAR AI — System Architecture & C4 Engineering Blueprint

> **Status:** Institutional Specification & Sovereign Architecture Reference  
> **Standard:** C4 Model (Context, Containers, Components, Code/Flows)  
> **Compliance:** EU AI Act (Regulation 2024/1689), ISO/IEC 27037:2012, DORA (Regulation EU 2022/2554), W3C DID/VC  
> **Security Baseline:** Zero-Port Sovereign Mesh (Port 22 Prohibited), Zero-GC In-Memory Shield, Strict Row-Level Security (RLS)

---

## 1. Architectural Philosophy & Guiding Principles

ALPAR AI is engineered to resolve the fundamental asymmetric power dynamic between trillion-dollar foundation model providers and the unrepresented civil public. It operates on five unalterable architectural dogmas:

1. **Zero-Entropy Execution:** No code exists as a placeholder, mock, or dead-weight dependency. Every component directly enforces normative, forensic, or runtime defense functions.
2. **Deterministic Admissibility:** Technical telemetry is collected under **ISO/IEC 27037** forensic chain-of-custody protocols to guarantee evidentiary weight in European and international courts.
3. **Sub-Millisecond In-Memory Defense:** Real-time protection must not penalize inference velocity. Model outputs are inspected in zero-copy RAM buffers before payload synthesis.
4. **Bilateral Fair Hearing (*Çelişmeli Yargılama*):** AI providers are protected against malicious smearing via an immutable, time-locked 72-hour quarantined arbitration corridor.
5. **Zero-Port Sovereign Mesh:** Surface area is minimized by banning default remote access ports (including Port 22) across the entire operational footprint.

---

## 2. Level 1: System Context Diagram

The System Context diagram illustrates ALPAR AI's position as the independent normative authority and judicial buffer between the public, foundation model vendors, enterprise systems, and regulatory jurisdictions.

```mermaid
flowchart TD
    subgraph ACTORS["External Actors & Stakeholders"]
        CITIZEN["Civil Citizens & Whistleblowers\n(Reporting Incidents & Claim Violations)"]
        ENTERPRISE["B2B Enterprise Consumers\n(Integrating Runtime Governance Proxy)"]
        VENDORS["Frontier AI Vendors\n(OpenAI, Google, Anthropic, Meta)"]
        INSURERS["InsurTech & Reinsurers\n(Munich Re, Allianz, Lloyd's)"]
        REGULATORS["Regulators & Courts\n(EU AI Office, National Authorities, Courts)"]
    end

    subgraph ALPAR_SYSTEM["ALPAR AI Sovereign Platform Boundary"]
        CORE["ALPAR AI\nThe Supreme Court of AI Accountability\n• Public Constitution & Incident Registry\n• Epistemic Firewall & Runtime Governance Proxy\n• Actuarial Risk & TrustScore Authority\n• 72h Vendor Dispute & Arbitration Console"]
    end

    CITIZEN ==>|"1. Submits Verifiable AI Incident (Free)"| CORE
    ENTERPRISE ==>|"2. Routes Model Calls via Epistemic Proxy"| CORE
    CORE ==>|"3. 72h Subpoena & Dispute Notification"| VENDORS
    VENDORS -.->|"4. Submits Rebuttal / Proof of Patch ($499-$2,499/mo)"| CORE
    CORE ==>|"5. TrustScore & Actuarial Moat Telemetry"| INSURERS
    CORE ==>|"6. Formatted Art. 73 Filings & ISO 27037 Passports"| REGULATORS
```

---

## 3. Level 2: Container Diagram

The Container diagram decomposes the platform into its high-level execution boundaries, data stores, and sovereign bridges.

```mermaid
flowchart LR
    subgraph CLIENT_TIER["Client & Edge Presentation"]
        WEB["Next.js 16 Web Portal\n(React 19, Tailwind v4, next-intl)\n• Public Transparency Ledger\n• Incident Submission Wizard\n• B2B Vendor Dispute Console\n• TrustScore Dashboard"]
    end

    subgraph RUNTIME_GATEWAY["Runtime Governance & Edge Boundary"]
        PROXY["Epistemic Firewall Proxy\n(In-Memory Zero-GC RAM Shield)\n• Sub-millisecond stream inspection\n• PII Guardian Sanitizer\n• Latency Budget: < 5ms"]
        API_GW["Sovereign REST & OpenAPI Gateway\n(/api/v1/*)\n• Internal Metering & Token Rate Limiter\n• Circuit Breaker (3 fails / 30s cooldown)"]
    end

    subgraph CORE_SERVICES["Core Algorithmic Engines"]
        TRUTH["Cross-Audit Truth Pipeline\n• Multi-LLM Consensus Engine\n• Socrates Contradiction Engine\n• Hallucination Quantifier"]
        REG_RADAR["EU AI Act Telemetry Engine\n• Art. 73 Countdown Clocks (2/10/15 Days)\n• Annex III High-Risk Classifier"]
        PASSPORT["W3C Incident Passport Engine\n• SHA-256 Merkle Chain of Custody\n• ISO/IEC 27037 Digital Seal\n• DID/VC Issuer"]
    end

    subgraph DATA_TIER["Sovereign Persistence Layer"]
        DB[("DeHost PostgreSQL\n• Strict Row-Level Security (RLS)\n• Zero-Knowledge PII Masking\n• Incident Registry Ledger\n• Vendor Arbitration Audits")]
        CACHE[("Edge Redis / In-Memory State\n• Rate-Limiting Semaphores\n• Circuit Breaker States\n• Probe Cache (60s TTL)")]
    end

    subgraph INFRA_BRIDGE["Egemen OS & Infrastructure"]
        BRIDGE["ErcuOS Sovereign Bridge\n(ADR-0001 Contract)\n• Local Ollama Gateway\n• Zero-Port WireGuard Mesh\n• Sentinel Daemons"]
    end

    WEB -->|"Server Actions & RSC"| API_GW
    WEB -->|"Edge Filtering"| PROXY
    PROXY -->|"Stream Interception"| TRUTH
    API_GW -->|"Telemetry Events"| REG_RADAR
    API_GW -->|"Evidence Generation"| PASSPORT
    TRUTH -->|"Consensus Verification"| PASSPORT
    PASSPORT -->|"Tamper-Proof Storage"| DB
    REG_RADAR -->|"Telemetry State"| DB
    PROXY -->|"Quota & Rate Checks"| CACHE
    API_GW -->|"Isolated Model Inference"| BRIDGE
```

---

## 4. Level 3: Component Deep-Dive

### 4.1. Epistemic Firewall (In-Memory Zero-GC Proxy)

The Epistemic Firewall intercepts inference streams between upstream Large Language Models and downstream client consumers. It eliminates corporate liability by arresting harmful outputs before they cross network boundaries.

```
+-----------------------------------------------------------------------------------------+
|                        EPISTEMIC FIREWALL COMPONENT TOPOLOGY                            |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [Incoming Token Stream]                                                                |
|            |                                                                            |
|            v                                                                            |
|  +---------------------+        +--------------------+        +---------------------+   |
|  | Slab Buffer Pool    | -----> | Semantic Tripwire  | -----> | PII Guardian Regex  |   |
|  | (Fixed ArrayBuffer) |        | (AST & Vector Norm)|        | (Zero-Knowledge)    |   |
|  +---------------------+        +--------------------+        +---------------------+   |
|            |                              |                              |              |
|    Zero GC Allocation             Sub-1ms Evaluation            Zero Disk Writes        |
|            |                              |                              |              |
|            +------------------------------+------------------------------+              |
|                                           |                                             |
|                                           v                                             |
|                           +-------------------------------+                             |
|                           | Decision Arbiter              |                             |
|                           | • ALLOW (Stream Passthrough)  |                             |
|                           | • QUARANTINE (Trigger Audit)  |                             |
|                           | • BLOCK (Synthetic Fallback)  |                             |
|                           +-------------------------------+                             |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

* **Memory Slab Allocation:** Employs pre-allocated `Uint8Array` / `ArrayBuffer` pools to process token deltas in memory, completely eliminating Garbage Collection (GC) pauses during high-throughput enterprise streaming.
* **Stream Windowing:** Maintains a sliding context window of $N=64$ tokens to detect emergent hallucination signatures, unsafe code executions, or privacy leaks.
* **Latency Budget:** Designed to add less than **4.2 milliseconds** to Time-to-First-Token (TTFB).

---

### 4.2. Cross-Audit Truth Pipeline

The Cross-Audit Truth Pipeline evaluates factual assertions through multi-model consensus, eliminating unilateral bias.

* **Triangulation Engine:** Incoming claims are disassembled into atomic propositions. Each proposition is evaluated independently against three decoupled frontier models (e.g., Gemini Pro, Claude, GPT-4) running under contrasting temperature profiles.
* **Epistemic Divergence Score ($D_e$):**
  $$\mathcal{D}_e = 1.0 - \frac{1}{M} \sum_{i=1}^{M} \text{CosSim}(\vec{v}_{\text{claim}}, \vec{v}_{\text{resp}, i})$$
  Where $M$ is the number of auditing models, and $\vec{v}$ represents normalized embedding vectors of verifiable truth claims.
* **Socrates Contradiction Auditor:** Flags logical antinomies, non-sequiturs, and fabrication artifacts. If $\mathcal{D}_e > 0.350$, the output is tagged as a probable hallucination and forwarded to the Incident Registry.

---

### 4.3. EU AI Act Telemetry Engine (Article 73 Regulatory Radar)

The Telemetry Engine translates statutory compliance into real-time programmatic enforcement:

```mermaid
flowchart TD
    INCIDENT["Incident Verified by Truth Pipeline"] --> CLASSIFY["Severity Classifier & Annex III Matrix"]
    
    CLASSIFY -->|"Tier 1: Fatalities / Critical Infra"| T1["2-Day Statutory Countdown Clock\n(Art. 73(2) Immediate Notification)"]
    CLASSIFY -->|"Tier 2: Severe Health / Fundamental Rights"| T2["10-Day Statutory Countdown Clock\n(Art. 73(3) High-Priority Filing)"]
    CLASSIFY -->|"Tier 3: General Non-Conformity"| T3["15-Day Statutory Countdown Clock\n(Art. 73(4) Standard Incident File)"]

    T1 --> RADAR["Regulatory Telemetry Radar\n• Auto-Generates Article 73 Dossier\n• Signs via W3C VC Proof\n• Transmits to National Market Authorities"]
    T2 --> RADAR
    T3 --> RADAR
```

* **Automated Article 73 Countdown:** Tracks remaining hours until statutory reporting deadlines lapse, preventing multimillion-euro administrative fines under Article 99.
* **Annex III Real-Time Tagger:** Categorizes systems into regulated high-risk areas: Biometrics, Critical Infrastructure, Educational Admissions, Employment/Recruiting, Essential Services, Law Enforcement, Asylum & Migration, Administration of Justice.

---

### 4.4. W3C Incident Passport (ISO/IEC 27037 Evidence Engine)

To guarantee that evidence collected by ALPAR AI is legally admissible in court proceedings, each incident generates an immutable **W3C Incident Passport**:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://alparai.com/schemas/incident-passport/v1.jsonld"
  ],
  "id": "urn:uuid:8f1e29c0-9d22-4a1b-a53c-7a91ef842d01",
  "type": ["VerifiableCredential", "AIIncidentPassport"],
  "issuer": "did:alparai:sovereign-authority-01",
  "issuanceDate": "2026-10-24T03:00:00Z",
  "credentialSubject": {
    "modelIdentifier": "frontier-llm-v4-preview",
    "vendor": "Vendor-X",
    "incidentCategory": "Annex_III_Credit_Scoring_Bias",
    "evidenceHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "merkleRoot": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "chainOfCustody": {
      "standard": "ISO/IEC 27037:2012",
      "collector": "ALPAR_PII_Guardian_Edge_Agent",
      "timestampAccuracy": "PTP_IEEE_1588_UTC"
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-10-24T03:00:01Z",
    "verificationMethod": "did:alparai:sovereign-authority-01#key-1",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFZERTQSI...k98s"
  }
}
```

* **Cryptographic Immutability:** Uses SHA-256 Merkle trees sealing input tokens, prompt contextual layers, output traces, and network proofs.
* **Court Admissibility:** Adheres to chain-of-custody requirements, logging collection tools, time offsets, and verification hashes.

---

### 4.5. DeHost PostgreSQL RLS Layer & Data Sovereignty

Data protection is enforced at the database kernel level through PostgreSQL Row-Level Security (RLS):

* **Tenant Segregation:** All tables require a tenant identifier (`tenant_id`). The session role is populated dynamically via authenticated JWT claims.
* **RLS Invariant Policy:**
  ```sql
  -- Example Sovereign Incident Access Policy
  ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY incidents_isolation_policy ON public.incidents
    AS RESTRICTIVE
    USING (
      status = 'PUBLISHED' 
      OR auth.uid() = reporter_id 
      OR (EXISTS (
        SELECT 1 FROM public.vendor_disputes vd 
        WHERE vd.incident_id = incidents.id 
        AND vd.vendor_id = auth.current_vendor()
      ))
    );
  ```
* **No Client Bypass:** Direct client-side insertions or mutations via browser Supabase/PostgREST SDKs are forbidden. All writes flow through verified Server Actions (`src/actions/*`) passing strict Zod schemas and PII sanitization.

---

### 4.6. Zero-Port Sovereign Mesh (Port 22 Strict Prohibition)

```mermaid
flowchart LR
    subgraph WAN["Public Untrusted Internet"]
        ATTACKER["Port 22 Scanners / Brute-Force Bots"]
        CLIENT["Legitimate Users (HTTPS:443 / Cloudflare Edge)"]
    end

    subgraph ZERO_PORT_BOUNDARY["ALPAR AI Zero-Port Mesh Boundary"]
        DROP["Port 22: REJECT / DROP SILENTLY\n(Zero Exposure)"]
        EDGE["Cloudflare Edge Reverse Tunnel\n(Zero-Trust Access Service)"]
        WG["WireGuard Mesh VPN Interface\n(10.99.0.0/24 Subnet / Encrypted High-Port UDP)"]
    end

    subgraph SECURE_INTERNALS["Protected Core Services"]
        APP["Next.js Application Core"]
        DB_INST["DeHost PostgreSQL Instance"]
        DAEMONS["Superposition & ErcuOS Bridge"]
    end

    ATTACKER -.->|"TCP:22 Attempt"| DROP
    CLIENT ==>|"HTTPS:443"| EDGE ==> APP
    WG ==>|"Encrypted mTLS High-Port"| DB_INST
    WG ==>|"Private IPC"| DAEMONS
```

* **Port 22 Ban:** Standard SSH Port 22 is disabled and blocked by kernel packet filters across all edge machines, production clusters, and development hosts.
* **WireGuard Mesh:** Authorized inter-service and operator communications traverse a sovereign WireGuard mesh (`10.99.0.0/24`) using ephemeral key exchanges on custom high-range UDP ports.
* **Reverse Tunnels:** Ingress traffic arrives exclusively through Cloudflare Zero-Trust tunnels, leaving zero public listener ports open to network scanners.

---

## 5. Level 4: Code & Sequence Execution Workflow

This sequence diagram depicts the complete lifecycle of an incident, from initial civil ingestion to forensic sealing, vendor arbitration, and final publication.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Civil Citizen / Whistleblower
    participant PII as PII Guardian (Edge)
    participant Engine as Epistemic Truth Engine
    participant Passport as W3C Passport Issuer
    participant DB as DeHost PostgreSQL (RLS)
    participant Vendor as AI Vendor B2B Portal
    participant Registry as Public Ledger & EU Radar

    Citizen->>PII: Submit raw incident report & prompt transcript
    Note over PII: Sanitizes TC, IBAN, names, phone numbers<br/>Computes zero-knowledge hash
    PII->>Engine: Send sanitized payload
    
    Engine->>Engine: Cross-Audit consensus check (3 models)
    Engine->>Engine: Calculate Epistemic Divergence (De > 0.350)
    
    Engine->>Passport: Generate ISO/IEC 27037 evidence bundle
    Passport->>Passport: Build SHA-256 Merkle root & sign W3C VC
    Passport->>DB: Store record (Status: 'QUARANTINED')
    
    Passport->>Vendor: Dispatch 72h Dispute Notice via Webhook
    Note over Vendor: 72-Hour Resolution Quarantine Starts<br/>Vendor reviews cryptographic proof
    
    alt Vendor submits valid patch within 72h
        Vendor->>DB: Submit Patch Verification & Audit Log
        DB->>Registry: Publish as 'RESOLVED_BY_VENDOR' with TrustScore update
    else Vendor contests and requests formal arbitration
        Vendor->>DB: File Commercial Arbitration Appeal
        Note over DB: Escalate to Presiding Law Chair (Prof. Dr. Musa Aygül)
    else 72-hour window expires without response
        DB->>Registry: Automatically publish to Public Ledger (alparai.com)
        DB->>Registry: Dispatch Art. 73 Telemetry to EU Regulators
    end
```

---

## 6. Verification, Testing & DORA Resilience

ALPAR AI enforces continuous quality gates before any deployment artifact is generated:

```bash
# 1. Type Sovereignty & Lint Integrity
pnpm lint && pnpm typecheck

# 2. Forensic Cryptographic Tests
pnpm test tests/contracts/

# 3. Security Boundary & PII Leak Regression
pnpm test tests/security/

# 4. Chaos & Circuit Breaker Verification
pnpm test tests/resilience/
```

Every database migration file appended with an explicit `-- ROLLBACK:` block ensures instant disaster recovery in strict alignment with **DORA (EU 2022/2554)** continuous operational resilience requirements.
