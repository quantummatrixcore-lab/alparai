# ALPAR AI — External Auditor API

This API provides read-only access to regulatory compliance data, raw K-BENCHMARK scores, methodology versions, and system audit logs for designated external auditors and regulators.

---

## Authentication

All endpoints require authentication using a Bearer token in the `Authorization` header.

```http
Authorization: Bearer <auditor_api_key>
```

---

## Endpoints

### 1. GET `/api/v1/auditor/k-benchmark`

Returns raw K-BENCHMARK scores for all audited AI models.

**Response (200 OK)**:

```json
{
  "data": [
    {
      "category_id": "K1",
      "model_id": "openai/gpt-4o",
      "score": 0.92,
      "status": "active",
      "sample_size": 100,
      "created_at": "2026-07-12T12:00:00Z"
    }
  ]
}
```

### 2. GET `/api/v1/auditor/methodology`

Returns the complete methodology version history.

**Response (200 OK)**:

```json
{
  "data": [
    {
      "version": "v1.0.0",
      "description": "Initial methodology release based on EU AI Act taxonomy mapping.",
      "created_at": "2026-07-12T12:00:00Z"
    }
  ]
}
```

### 3. GET `/api/v1/auditor/audit-logs`

Returns the 100 most recent system audit logs.

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "e8378f59-b039-44dd-5f57-c8cbee120886",
      "actor_id": "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
      "action": "UPDATE_STATUS",
      "entity_type": "incidents",
      "entity_id": "922a2560-44eb-fb0c-76c6-101193d92b35",
      "created_at": "2026-07-12T12:00:00Z"
    }
  ]
}
```
