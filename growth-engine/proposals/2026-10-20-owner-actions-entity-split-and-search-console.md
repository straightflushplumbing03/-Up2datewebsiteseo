# Proposal — owner actions, 2026-10-20

Level 3 (identity / external property / access). **Proposed only — not executed.**

## P-A. Resolve the entity split (ISSUE-014 / ISSUE-018)

**Observed (2026-10-20, `entity_consistency` exit 1):**

| Host | HTTP | Status |
|---|---|---|
| `straightflushplumbingoc.com` | 200 | ok (canonical) |
| `straight-flush-plumbing-7fb7cf71.base44.app` | 200 | **indexable duplicate** |
| `straightflushplumb8.wixsite.com` | 200 | **indexable duplicate** |
| `flush-pro-flow.base44.app` | 404 | ok (gone) |

**Why it matters:** three indexable hosts describing the same business split brand
signals and can cause AI answer engines and directories to attribute information to
the wrong entity.

**Proposed owner action:** on each external host, either remove the site, set a
site-wide `noindex`, or redirect to `https://straightflushplumbingoc.com/`.
**We cannot do this** — they are external properties, and ground rule 9 forbids us
from touching identity/business profiles. Do not edit the external property from
this repo; the check exists to *report*, not to fix.

## P-B. Connect Google Search Console (P-002)

**Observed:** no `GOOGLE_SEARCH_CONSOLE_*` secret in the sandbox; GSC is not
connected. Impressions, clicks, query mix, coverage, and the **Generative AI
performance report** are all `unverified` — never `0`.

**New supporting evidence (2026-10-20):** Google's official guide
*"Optimizing your website for generative AI features on Google Search"*
(https://developers.google.com/search/docs/fundamentals/ai-optimization-guide,
fetched 2026-10-20, HTTP 200) states: *"To measure how your content is performing in
generative AI features on Google Search and Discover, use the Generative AI
performance report in Search Console."* GSC access is therefore now the **single
highest-value** unblock for this engine — it is the only first-party measurement of
AI-feature visibility Google provides.

**Proposed owner action:** grant the engine read access to GSC (OAuth or a service
account with the property added), then add `GOOGLE_SEARCH_CONSOLE_*` credentials as
an OpenHands secret. GA4 and GBP would follow the same pattern.

**Impact:** High. **Risk:** L3 (credentials/access) — proposal only.
