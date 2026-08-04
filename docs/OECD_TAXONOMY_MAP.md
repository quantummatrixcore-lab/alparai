# ALPAR AI — OECD AI Taxonomy Map

This document defines how ALPAR AI incident data maps to the **OECD Framework for the Classification of AI Systems**. This ensures alignment with international AI governance standards.

---

## 🗺️ OECD Taxonomy Mapping Definition

The OECD framework classifies AI systems along five key dimensions:

### 1. People & Planet (Context and Impact)

- **ALPAR Incident Field:** `location_country` & `category`
- **Mapping:**
  - `harassment` / `manipulation` / `bias` -> **Impact on Human Rights & Well-being**
  - `privacy` / `security` -> **Impact on Security & Privacy**
  - `inaccessibility` -> **Societal and Economic Context**

### 2. Business Model (Application Domain)

- **ALPAR Incident Field:** `category` & `ai_provider_id` (sectors derived from provider profiles)
- **Mapping:**
  - `hallucination` (medical) -> **Healthcare & Life Sciences**
  - `hallucination` (financial) -> **Finance & Insurance**
  - `bias` (recruitment) -> **Employment & Human Resources**

### 3. AI System (Technology Type)

- **ALPAR Incident Field:** `ai_model_id` (referenced model metadata)
- **Mapping:**
  - LLMs (GPT-4o, Claude 3.5, Gemini Pro) -> **Generative AI / Large Language Models (Natural Language Processing)**
  - Image generators (Imagen, Midjourney) -> **Computer Vision / Text-to-Image Systems**

### 4. Data & Input (Data Characteristics)

- **ALPAR Incident Field:** `category`
- **Mapping:**
  - `copyright` / `privacy` -> **Personal Data & Intellectual Property Concerns**
  - `security` (prompt injection inputs) -> **Adversarial Input Data**

### 5. Action & Output (System Behavior)

- **ALPAR Incident Field:** `severity` & `cross_audit_truth_score`
- **Mapping:**
  - `critical` / `high` severity failures -> **High-severity autonomous actions / Incorrect outputs**
  - `low` / `medium` severity failures -> **Minor informational or conversational drifts**

---

## 📡 OECD Feed Output Format

The API endpoint `/api/v1/oecd/feed` exposes published incidents formatted as an OECD-compatible JSON schema feed.

```json
{
  "feed_format": "ALPAR-OECD-v1",
  "generated_at": "2026-07-12T05:20:00Z",
  "incidents": [
    {
      "incident_id": "uuid",
      "title": "Cleaned title",
      "oecd_classification": {
        "people_planet": "Human Rights / Privacy / Safety",
        "business_model": "Derived domain",
        "ai_system": "Model details",
        "data_input": "Data type",
        "action_output": "System failure severity"
      },
      "severity": "high",
      "incident_date": "YYYY-MM-DD",
      "created_at": "ISO-8601"
    }
  ]
}
```
