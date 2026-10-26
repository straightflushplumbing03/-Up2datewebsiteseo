# Indexing verification — leak / slab-leak / Laguna Niguel pages

**Date:** 2026-10-25
**Trigger:** Owner report — "your leak, slab leak and Laguna Niguel pages appear to
be set to `noindex`, hiding them from Google and AI search."
**Verdict:** The pages the owner named are **indexable**. The `noindex` the report
saw is on the intentional **root-level duplicate stubs**, which exist only so the
extensionless URLs keep resolving. No canonical page is hidden. One unrelated,
genuine discoverability gap was found and fixed (see §5).

No network credential was required. All checks are reproducible from the repo and
from public HTTP responses.

---

## 1. What the owner saw

Requesting these URLs returns `HTTP 200` **and** a robots tag:

```
GET /leak-detection.html      -> 200, <meta name="robots" content="noindex, nofollow">
GET /slab-leak-detection.html -> 200, <meta name="robots" content="noindex, nofollow">
GET /laguna-niguel.html       -> 200, <meta name="robots" content="noindex, nofollow">
```

That is real, and it is **by design**. These three root files are legacy
duplicates. Each carries a canonical that points at its real page:

| Root stub (noindex) | Canonical target (indexable) |
|---|---|
| `/leak-detection.html` | `/services/leak-detection.html` |
| `/slab-leak-detection.html` | `/services/slab-leak-detection.html` |
| `/laguna-niguel.html` | `/cities/laguna-niguel.html` |

This was introduced deliberately in commit `2cd5fff`
("noindex duplicate root pages + consolidate internal links to canonical URLs",
PR #10, 2026-09-13) and is recorded as correct-as-is in
`briefs/strategy-log.md` (2026-10-08), `growth-engine/SERVICE_AREAS.md`, and
`AGENTS.md`.

---

## 2. The real pages are indexable

Verified directly against the live site and the shipped HTML:

```
GET /services/leak-detection.html       -> 200, no robots meta   (indexable)
GET /services/slab-leak-detection.html  -> 200, no robots meta   (indexable)
GET /cities/laguna-niguel.html          -> 200, no robots meta   (indexable)
GET /services/slab-leak-detection-laguna-niguel.html -> 200, no robots meta
```

* No `X-Robots-Tag` response header on any of them (checked live).
* Each is **self-canonical** and present in `sitemap.xml`.
* `robots.txt` allows `User-agent: *` and explicitly welcomes GPTBot,
  OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended,
  Applebot, Bingbot and others — nothing blocks AI crawlers.

Independent corroboration: a `site:straightflushplumbingoc.com` query to a
crawler-visible search index returned the **canonical subdirectory URLs**
(`/services/leak-detection`, `/cities/irvine`, `/about`, `/academy/`,
`/case-studies/`) — i.e. the indexable pages, not the noindex root stubs.

---

## 3. Site-wide indexing state

`scripts/seo_audit.py` over the 148 shipped HTML files:

```
indexable (no noindex):  89
noindex:                 59   = 58 root stubs + 1 subdirectory page
sitemap URLs:            89   (exactly the indexable set)
indexable file NOT in sitemap: 0
in sitemap but noindex:        0
canonical anomalies (indexable pages): 0
```

Every root stub's canonical target exists and is itself indexable (checked
pairwise; 0 exceptions). So the `noindex` set and the sitemap are exact
complements — nothing indexable is excluded, and no stub is listed.

---

## 4. The one subdirectory `noindex` page

`/about/straight-flush-plumbing-orange-county.html` is `noindex,follow`. This is
also deliberate:

* It is linked from the homepage footer and from `about.html`, and `follow` is
  set, so the link leaks no equity and funnels nothing to a dead end.
* It is excluded from `sitemap.xml` (correctly) and is mirrored in
  `llms-full.txt`.
* Recorded as **ISSUE-013 — WON'T FIX** in `growth-engine/KNOWN_ISSUES.md`
  (re-examined 2026-10-16): an indexable page linking to an internal,
  `follow`-enabled profile page is normal, and the page is not in the sitemap.
* Revisit only if the profile page is promoted to indexable.

---

## 5. Genuine gap found and fixed: the guides hub was orphaned

The audit's link-graph section flagged exactly one indexable page with **zero
internal inbound links**:

```
orphan pages (0 internal inbound links): 1
   guides/index.html
```

`/guides/index.html` is indexable and in the sitemap (so Google can still find it
via the sitemap), but **no page linked to it** — the footer's "Cost Guides" entry
points at a child article (`guides/leak-detection-cost.html`), never at the hub.
A page with no internal links is the one thing in this review that genuinely
works against "all pages indexed."

**Fix:** point the guide articles' breadcrumb parent at the hub, matching the
pattern the Academy already uses
(`Home › Leak Detection Academy › article`). Visible breadcrumb and
`BreadcrumbList` JSON-LD are changed together, per `AGENTS.md` ("Breadcrumb
JSON-LD must match the visible breadcrumb trail").

Files touched: `guides/leak-detection-cost.html`,
`guides/slab-leak-repair-cost.html`, `guides/repair-vs-reroute-vs-repipe.html`.
After the change the hub has 3 inbound links and the orphan count is 0.

---

## 6. Not changed (correct as-is)

* The 58 root-level `noindex` stubs — intentional URL-preserving duplicates.
* `about/straight-flush-plumbing-orange-county.html` — intentional `noindex,follow`.
* `thank-you.html`, `404.html` — utility pages, correctly `noindex` and absent
  from the sitemap.

---

## 7. Verification run

```bash
python3 -m unittest discover -s growth-engine/tests -p "test_*.py"   # OK
python3 growth-engine/tests/validate_knowledge_base.py               # OK
python3 scripts/seo_audit.py                                         # 0 orphans, 0 canonical anomalies
python3 scripts/refresh_sitemap.py                                   # missing: []  extra: []
```

If the owner wants the legacy root URLs to stop returning `200 + noindex` at all,
the SEO-correct replacement is a **301 redirect** at the edge (Cloudflare),
because GitHub Pages cannot emit server redirects from files. That is an
owner-side Cloudflare change and is **not** applied here — a meta-refresh would be
a soft redirect and removing the `noindex` naively would pull 56 thin duplicates
into the sitemap.
