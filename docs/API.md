# ALPAR AI — API Reference

All mutations go through Next.js Server Actions. REST API v1 is exposed for external developers and enterprise consumers under `/api/v1/...`.

## Authentication

Authentication uses Supabase Auth (Google OAuth + Magic Link). Session cookies are managed automatically by the `@supabase/ssr` middleware.

## Rate Limiting

All endpoints are rate-limited via Upstash Redis (sliding window).

| Endpoint              | Limit | Window |
| --------------------- | ----- | ------ |
| Incident submission   | 5     | 1 hour |
| Suggestion submission | 10    | 1 day  |
| Auth sign-in          | 10    | 15 min |
| API general           | 100   | 1 min  |

## Error Codes

| Code                | Description                         |
| ------------------- | ----------------------------------- |
| `UNAUTHORIZED`      | Authentication required             |
| `FORBIDDEN`         | Insufficient permissions            |
| `VALIDATION_ERROR`  | Input validation failed             |
| `RATE_LIMITED`      | Rate limit exceeded                 |
| `NOT_FOUND`         | Resource not found                  |
| `INTERNAL_ERROR`    | Unexpected server error             |
| `PII_DETECTED`      | Personal data detected and redacted |
| `FILE_TOO_LARGE`    | Upload exceeds 10MB limit           |
| `INVALID_FILE_TYPE` | Unsupported file format             |
| `DUPLICATE_VOTE`    | User already voted                  |

---

## Incidents

### `submitIncident(prevState, formData)`

**Auth:** Required (user)
**Rate Limit:** `incident_submission` (5/hour)
**PII:** Title and description are masked via PII Guardian

**FormData fields:**

| Field               | Type     | Required | Description                                                                                                         |
| ------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `title`             | string   | Yes      | 8-200 chars                                                                                                         |
| `description`       | string   | Yes      | 20-10000 chars                                                                                                      |
| `category`          | enum     | Yes      | hallucination, bias, privacy, security, misinformation, harassment, manipulation, inaccessibility, copyright, other |
| `severity`          | enum     | Yes      | low, medium, high, critical                                                                                         |
| `provider_id`       | uuid     | No       | AI provider ID                                                                                                      |
| `model_id`          | uuid     | No       | AI model ID                                                                                                         |
| `incident_date`     | date     | No       | YYYY-MM-DD                                                                                                          |
| `is_anonymous`      | checkbox | No       | Default: off                                                                                                        |
| `consent_truth`     | checkbox | Yes      | Truthfulness confirmation                                                                                           |
| `consent_anonymous` | checkbox | Yes      | Anonymous publication consent                                                                                       |
| `consent_age`       | checkbox | Yes      | Age 18+ confirmation                                                                                                |
| `consent_terms`     | checkbox | Yes      | ToS acceptance                                                                                                      |

**Returns:** `{ ok: boolean; error?: string; formError?: string; fieldErrors?: Record<string, string[]>; incidentId?: string }`

### `voteOnIncident({ incidentId, value })`

**Auth:** Required
**Parameters:** `incidentId: string`, `value: 1 | -1 | 0`
**Behavior:** Upserts vote. `value: 0` or same value removes vote.
**Returns:** `{ ok: boolean; error?: string }`

---

## Authentication

### `signInWithGoogle(next?)`

**Auth:** None
**Rate Limit:** `auth_signin` (10/15min)
**Parameters:** `next: string` (redirect URL after auth, default: `/profile`)
**Returns:** `{ ok: boolean; error?: string; url?: string }`

### `signInWithMagicLink(email)`

**Auth:** None
**Parameters:** `email: string`
**Returns:** `{ ok: boolean; error?: string }`

### `signOut()`

**Auth:** Required
**Side effects:** Clears session, redirects to `/`

### `getMe()`

**Auth:** Optional
**Returns:** `{ ok: boolean; user: { id, email, fullName, avatarUrl, role } | null }`

---

## Administration

### `moderateIncident({ incidentId, decision, moderationNote? })`

**Auth:** Moderator/Admin
**Parameters:**

- `incidentId: string`
- `decision: "approve" | "reject"`
- `moderationNote?: string` (max 2000 chars)

**Returns:** `{ ok: boolean; error?: string }`

### `reviewTakedown({ id, decision })`

**Auth:** Moderator/Admin
**Parameters:** `id: string`, `decision: "approve" | "reject"`
**Returns:** `{ ok: boolean; error?: string }`

### `setUserRole({ userId, role })`

**Auth:** Moderator/Admin
**Parameters:** `userId: string`, `role: "user" | "moderator" | "admin"`
**Returns:** `{ ok: boolean; error?: string }`

---

## Contact

### `submitContact(prevState, formData)`

**Auth:** None
**FormData fields:** `name`, `email`, `subject`, `message`, `category`
**Side effects:** Sends email via Resend (if API key configured)
**Returns:** `{ ok: boolean; error?: string; formError?: string; fieldErrors?: Record<string, string[]> }`

---

## Suggestions

### `submitSuggestion(prevState, formData)`

**Auth:** Required
**FormData fields:** `title` (8-200 chars), `description` (20-5000 chars), `category`
**Returns:** `{ ok: boolean; error?: string; fieldErrors?: Record<string, string[]> }`

### `upvoteSuggestion(suggestionId)`

**Auth:** Required
**Behavior:** Toggles vote (upvote if not voted, remove if already voted)
**Returns:** `{ ok: boolean; error?: string }`

---

## Takedown Requests

### `submitTakedownRequest(input)`

**Auth:** None
**Parameters:**

- `target_url: string` (URL)
- `reason: string` (2-100 chars)
- `details: string` (20-4000 chars)
- `requester_name: string` (2-100 chars)
- `requester_email: string` (email)
- `identity_proof_url: string` (URL)
- `organization?: string`
- `country?: string`

**Returns:** `{ ok: boolean; error?: string; message?: string }`

### `submitTakedown(input)`

**Auth:** Optional
**Parameters:** `incidentId`, `reason`, `details`, `contactEmail`
**Returns:** `{ ok: boolean; error?: string; message?: string }`

---

## Search

### `searchIncidents(query, limit?)`

**Auth:** None
**Parameters:** `query: string` (min 2 chars), `limit: number` (default: 20)
**Returns:** `{ ok: boolean; results: SearchResult[]; error?: string }`

---

## Data Export

### `exportIncidentsCSV()`

**Auth:** Admin only
**Returns:** `{ ok: boolean; csv?: string; error?: string }`

### `exportAuditLogCSV()`

**Auth:** Admin only
**Returns:** `{ ok: boolean; csv?: string; error?: string }`

---

## REST API v1 Reference

External developers and partners can query published incidents programmatically via the REST API endpoints.

### Authentication

REST API requests must include the API key in the `Authorization` header as a Bearer token.

```http
Authorization: Bearer <your_api_key>
```

API keys can be managed inside the **Admin Panel > API Keys** dashboard. External keys are cryptographically hardened and validated using SHA-256 hashes.

---

### `GET /api/v1/incidents`

Fetch a list of published incidents.

**Rate Limits (Sliding Window):**

- **Free Tier:** 100 requests / minute
- **Developer Tier:** 1,000 requests / minute
- **Enterprise Tier:** 10,000 requests / minute

#### Query Parameters

| Parameter      | Type    | Required | Description                                                                                |
| :------------- | :------ | :------- | :----------------------------------------------------------------------------------------- |
| `limit`        | integer | No       | Maximum number of records to return (1-100). Default is `20`.                              |
| `category`     | string  | No       | Filter by incident category (e.g. `hallucination`, `bias`, `security`, etc.).              |
| `severity`     | string  | No       | Filter by severity level (`low`, `medium`, `high`, `critical`).                            |
| `eu_risk`      | string  | No       | Filter by EU AI Act risk category (e.g. `unacceptable`, `high-risk`, etc.).                |
| `eu_class`     | string  | No       | Filter by EU AI Act serious incident class (e.g. `death/health`, `fundamental-rights`).    |
| `eu_high_risk` | string  | No       | Filter by EU AI Act Annex III high-risk system category (e.g. `biometrics`, `employment`). |
| `eu_deadline`  | integer | No       | Filter by reporting deadline in days (`2`, `10`, `15`).                                    |
| `provider`     | string  | No       | Filter by provider slug (e.g. `openai`, `anthropic`).                                      |
| `model`        | string  | No       | Filter by model name (case-insensitive partial match).                                     |

#### Response Format

Returns a JSON object containing the data array and query metadata.

**Response Example (200 OK):**

```json
{
  "data": [
    {
      "id": "c7a82dfc-a49e-4e45-98db-fa16cd18a999",
      "title": "Model hallucinated incorrect medical advice",
      "description": "The AI provided an invalid dosage recommendation for acetaminophen...",
      "severity": "high",
      "category": "hallucination",
      "eu_act_risk_category": "high-risk",
      "eu_act_serious_incident_class": "death/health",
      "eu_act_high_risk_system_category": "services",
      "eu_act_reporting_deadline_days": 10,
      "is_anonymous": false,
      "incident_date": "2026-07-10",
      "views": 42,
      "upvotes": 12,
      "provider": {
        "name": "OpenAI",
        "slug": "openai"
      },
      "model": "GPT-4o",
      "truth_score": 0.85,
      "confidence": 0.92,
      "verification_level": "expert",
      "expert_fix": "System prompt was adjusted to restrict medical dosage recommendations.",
      "created_at": "2026-07-10T14:22:15Z"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 20,
    "tier": "developer",
    "generated_at": "2026-07-11T16:30:00Z"
  }
}
```
