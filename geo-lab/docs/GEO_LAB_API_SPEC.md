# GEO Lab API Specification

Versioned, read-first HTTP API exposed by the GEO Intelligence Lab for
consumers such as **AI Headquarters**.

- **Base path:** `/api/v1`
- **Current version:** `v1`
- **Content type:** `application/json`
- **Transport:** HTTPS only in production. Plain HTTP is acceptable only on
  localhost during development.

This document is the contract. The Lab implements it; Headquarters builds
against it. Change a field here first, then the code, then the consumer.

---

## Authentication

Every request needs a scoped API key in an `Authorization` header:

```
Authorization: Bearer geolab_<prefix>.<secret>
```

Keys are minted server-side:

```bash
npm run apikey -- create --name "AI Headquarters" \
  --scopes read:health,read:visibility,read:competitors,read:citations,read:geo,read:reports,read:opportunities
```

The secret is printed **once**. Only a SHA-256 hash and a public prefix are
stored, so a database leak yields no usable credential. Comparison is
timing-safe, so a wrong key cannot be found by timing.

### Scopes

| Scope | Grants |
|---|---|
| `read:health` | `GET /health` |
| `read:visibility` | `GET /visibility`, `GET /visibility/history` |
| `read:competitors` | `GET /competitors` |
| `read:citations` | `GET /citations` |
| `read:geo` | `GET /geo` |
| `read:reports` | `GET /reports` |
| `read:opportunities` | `GET /opportunities` |
| `write:jobs` | `POST /jobs`, `GET /jobs` |

A key holds a subset. Requesting an endpoint outside that subset is `403`,
never a silent empty result.

---

## Response envelope

Every successful response has the same shape, so a consumer parses it once:

```json
{
  "data": "<object or array>",
  "meta": {
    "generatedAt": "2026-11-09T15:23:41.289Z",
    "source": "geo-lab",
    "version": "v1",
    "count": 21,
    "pagination": { "limit": 50, "offset": 0, "total": 21, "hasMore": false },
    "window": "-30 days"
  }
}
```

| Field | Meaning |
|---|---|
| `generatedAt` | Server time the query ran. Use it to judge freshness. |
| `source` | Always `geo-lab`. Present so a consumer never guesses the origin. |
| `version` | API version that produced the payload. |
| `count` | Rows in `data`. |
| `pagination` | Present on list endpoints. `hasMore` drives the next call. |
| `window` | The time window applied, echoed back for provenance. |

`meta` may carry endpoint-specific provenance (`note`, `rateDefinition`,
`priorityMarket`). Treat unknown keys as informational.

### Errors

```json
{ "error": "Insufficient scope.", "detail": "This key does not hold read:citations." }
```

| Status | Meaning |
|---|---|
| `400` | Malformed request (bad JSON, unknown job kind, missing field). |
| `401` | Missing, malformed, unknown, revoked or expired key. |
| `403` | Valid key, missing scope. |
| `429` | Rate limit exceeded. Honour `Retry-After`. |
| `500` | Server error. Safe to retry with backoff. |

`401` returns the same message for an unknown key and a wrong secret, so the
endpoint cannot be used to enumerate keys.

---

## Rate limiting

Default **120 requests per minute per key** (`GEO_LAB_API_RATE_LIMIT`).

Counters live in the request log, not in process memory, so the limit holds
across restarts and across processes. Every response carries:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 117
```

A `429` also carries `Retry-After` in seconds.

---

## Pagination

List endpoints accept `limit` (default `50`, clamped to `500`) and `offset`
(default `0`). Follow `meta.pagination.hasMore` rather than guessing when to
stop.

---

## Endpoints

### `GET /health`

Scope: `read:health`. Connection health and data freshness.

```json
{
  "data": {
    "status": "ok",
    "company": { "name": "Straight Flush Plumbing & Leak Detection", "website": "https://straightflushplumbingoc.com" },
    "api": { "keys": { "total": 3, "active": 3 }, "requests24h": 27, "errors24h": 7, "lastRequestAt": "2026-11-09 15:24:04" },
    "data": { "lastRunAt": null, "lastVisibilityAt": "2026-11-06 12:39:12", "lastCrawlAt": "2026-11-09T12:35:20.044Z" },
    "counts": { "pages": 153, "visibilityResults": 21, "competitors": 298, "opportunities": 31 }
  }
}
```

`lastVisibilityAt` is what tells a consumer whether the Lab is measuring or
merely running. A stale timestamp is reported as stale; it is never hidden.

---

### `GET /visibility`

Scope: `read:visibility`. One row per (query, platform) observation.

Query parameters: `platform`, `city`, `service`, `testType`, `since`, `runId`,
`limit`, `offset`.

```json
{
  "id": 13, "runId": 5, "observedAt": "2026-11-06 12:22:01",
  "query": "Straight Flush Plumbing & Leak Detection Laguna Niguel",
  "platform": "tavily_search", "testType": "conventional_proxy",
  "status": "cited", "rank": 1,
  "mentioned": true, "recommended": true,
  "answerExcerpt": null,
  "citedUrls": ["https://straightflushplumbingoc.com/services/water-heater-repair-laguna-niguel.html"],
  "competitors": ["efficientplumbing.com"],
  "city": null, "service": null, "confidence": "medium"
}
```

`mentioned`, `recommended` and `citedUrls` are **three different signals** and
must not be collapsed into one "visibility" number:

- `mentioned` — the business appeared in the answer at all.
- `recommended` — the business appeared in the top 3.
- `citedUrls` — a URL was cited as a source. Our own domain may be absent here
  even when we are mentioned, and vice versa.

---

### `GET /visibility/history`

Scope: `read:visibility`. Aggregated over time.

Query parameters: `since` (default `-30 days`), `groupBy` (`day` | `city` |
`service` | `platform`), `limit`.

```json
{
  "day": "2026-11-06", "observations": 21, "mentions": 1, "recommendations": 1, "citations": 1,
  "mentionRate": 4.8, "recommendationRate": 4.8, "citationRate": 4.8, "avgRank": 1
}
```

With `groupBy=city`, the key is `dimension` instead of `day`.

Rates are the percent of observations in the group, computed from stored test
results. `meta.rateDefinition` states this in the payload. They are internal
measurements, **not** platform-reported figures.

---

### `GET /competitors`

Scope: `read:competitors`. Query parameters: `city`, `since`, `limit`, `offset`.

```json
{
  "id": 12, "domain": "efficientplumbing.com", "name": "Efficient Plumbing",
  "tier": "primary", "homeCity": "Laguna Niguel",
  "appearances": 9, "observations": 9, "shareOfVoice": 12.5,
  "lastPlatform": "tavily_search", "lastSeenAt": "2026-11-06 12:39:25"
}
```

`shareOfVoice` is the competitor's appearances as a percent of all observed
appearances in the window. A competitor never observed reports `0` rather than
an estimate.

---

### `GET /citations`

Scope: `read:citations`. Query parameters: `since`, `include`
(`sources,actions`), `limit`, `offset`.

```json
{
  "data": {
    "sources": [
      { "domain": "yelp.com", "citations": 80, "ownedCitations": 0,
        "firstSeenAt": "2026-11-06 12:20:08", "lastSeenAt": "2026-11-06 12:39:23" }
    ],
    "sourcesTotal": 43,
    "actions": [
      { "id": 1, "domain": "yelp.com", "timesCitedWhenWeLost": 80,
        "action": "Claim and complete the profile", "status": "open",
        "engines": ["tavily_search"], "exampleUrls": [], "updatedAt": "2026-11-06 12:40:00" }
    ]
  }
}
```

`sources` are domains that appeared as sources in stored answers.
`ownedCitations` counts appearances of our own domain. A citation here means
"this URL was in the source list", nothing stronger.

---

### `GET /geo`

Scope: `read:geo`. Geographic visibility. Parameters: `since` (default
`-90 days`), `limit`.

```json
{
  "city": "Laguna Niguel", "priority": true, "observations": 6,
  "mentions": 1, "recommendations": 1, "mentionRate": 16.7, "recommendationRate": 16.7,
  "avgRank": 1, "platforms": 1, "lastObservedAt": "2026-11-06 12:39:18"
}
```

`meta.priorityMarket` names the initial priority market (Laguna Niguel).
Cities with no stored observations are **omitted**, not reported as zero:
"never measured" and "measured and not visible" are different facts. New
South Orange County cities appear here automatically once measured.

---

### `GET /reports`

Scope: `read:reports`. Parameters: `id`, `period`, `limit`, `offset`.

Without `id`, returns a list with bodies omitted and `bodyAvailableAt` set.
With `?id=<n>`, returns that report including `body` in full.

---

### `GET /opportunities`

Scope: `read:opportunities`. Parameters: `status` (default `open`, or `all`),
`geoLayer`, `limit`, `offset`.

```json
{
  "id": 5, "identifiedAt": "2026-11-06 13:00:00",
  "title": "Slab leak section lacks a direct answer",
  "problem": "...", "evidence": "...",
  "url": "https://straightflushplumbingoc.com/services/slab-leak-repair.html",
  "section": "What is a slab leak?", "geoLayer": "extractability",
  "expectedBenefit": "Higher extraction likelihood", "difficulty": "low",
  "impact": 4, "effort": 2, "priority": 8,
  "proposedSolution": "...", "status": "open", "implementedAt": null, "result": null
}
```

---

### `POST /jobs`

Scope: `write:jobs`. Ask the Lab to perform work.

```json
{ "kind": "audit_city", "params": { "city": "Laguna Niguel" }, "requestedBy": "AI Headquarters" }
```

Allowed kinds:

| Kind | Behaviour |
|---|---|
| `ai_recommendation_test` | Runs automatically |
| `audit_city` | Runs automatically |
| `research_competitor` | Runs automatically |
| `analyze_citation_source` | Runs automatically |
| `recheck_service_category` | Runs automatically |
| `generate_visibility_report` | Runs automatically |
| `publish` | **Requires owner approval** |
| `deploy` | **Requires owner approval** |
| `rollback` | **Requires owner approval** |
| `spend` | **Requires owner approval** |

Response:

```json
{
  "jobId": "job_9f3c1a7b2d4e5f60", "kind": "audit_city",
  "status": "queued", "requiresApproval": false,
  "message": "Queued. Read-only job; no approval required."
}
```

A production-affecting kind returns `status: "pending_approval"` and is **not
executed**. Approval happens in the Lab by an owner. This endpoint cannot be
used to change production, publish externally, or spend money.

An unknown kind is `400` — there is no passthrough.

### `GET /jobs`

Scope: `write:jobs`. Parameters: `status`, `limit`, `offset`. Returns the job
queue with `status`, `approvedBy`, `result`, `error`.

---

## Data provenance rules

These are enforced in code, not just documented:

1. **No fabricated values.** Every number is computed from a stored row. An
   unmeasured thing is `null` or absent, never `0`.
2. **Rates are defined in the payload.** `meta.rateDefinition` says how a rate
   was computed, so it is never mistaken for a platform figure.
3. **Signals stay separate.** Mention, recommendation and citation are distinct
   fields. Nothing sums them into a single score.
4. **Heuristic scores are labelled.** GEO layer scores are internal diagnostic
   heuristics, not measured probabilities of citation.
5. **Timestamps are server-side** and in UTC.
