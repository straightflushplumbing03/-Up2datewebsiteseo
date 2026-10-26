# Technical / Indexing + Reviews Audit — Response

**Date:** 2026-10-25 (America/Los_Angeles)
**Trigger:** External audit ("Technical SEO and indexing" + "Reviews and
reputation") supplied by the owner. The audit tool could not retrieve
`robots.txt` or `sitemap.xml`, so those rows were "Not confirmed"; it also
flagged an ambiguous combined review claim.
**Verifier:** OpenHands agent, working from a fresh clone of the production repo.
**Branch:** `intelligence-hq/site-2026-10-25-reviews-clarity`.
**Approval scope:** Level 1 (research/reporting) + Level 2 (one copy fix + PR).

> Confirmed problems are separated from unverified concerns. A row is only
> marked OK when it was re-verified live in this run.

---

## 1. Technical checklist — findings

Every row below was tested against the **live** site on 2026-10-25, plus the
repo. The audit's own tool could not fetch robots/sitemap; direct fetches work.

| Checklist item | Audit finding | Verified result (2026-10-25) |
|---|---|---|
| Sitemap | Not confirmed | **OK** — `/sitemap.xml` live **HTTP 200**, `application/xml`, 89 URLs; byte-set **identical** to the repo; all 89 return **200**. |
| Robots directives | Not confirmed | **OK** — `/robots.txt` live **HTTP 200**, identical to repo; `Allow: /` for `*`; no important path blocked; AI crawlers explicitly allowed; `Sitemap:` declared. |
| Canonical URLs | Not confirmed | **OK** — 0 canonical anomalies on indexable pages; every indexable page self-canonical; 0 sitemap URLs whose canonical points elsewhere. |
| 5xx errors | Historical | **Not reproducible** — all 89 sitemap URLs return **200** with a Googlebot UA; no 5xx seen. Earlier 5xx was during the Cloudflare *Under Attack* window (ISSUE-001, resolved 2026-10-11). |
| Mobile usability | Not fully tested | **Not tested here** — needs PageSpeed Insights / real device; see "Not verifiable from here". |
| LocalBusiness structured data | Not confirmed | **OK** — `Plumber` JSON-LD valid on the homepage and every page; 0 invalid JSON-LD; 0 pages with zero structured data. `aggregateRating` is **correctly absent** (removed under ISSUE-002). |
| Homepage / service-page indexing | Appears in search | **OK** — homepage + all priority service/city pages are indexable (no stray `noindex`); 0 indexable pages wrongly noindexed. |

Additional invariants re-run clean: broken internal links **0**, orphan pages
**1** (`guides/index.html`, addressed by open PR #83), duplicate titles on
indexable pages **0**, pages with ≠1 H1 **0**, missing meta description **0**,
missing image alt **0**.

### Duplicate URL note (the audit's "duplicate or unindexed URLs")
There are two URL families, and they are **intentional**, not accidental dupes:

- **Root `*.html` stubs are `noindex, nofollow`** and canonical to the real
  page (e.g. `/leak-detection.html` → canonical `/services/leak-detection.html`).
- **Extensionless URLs resolve 200** (`/leak-detection`, `/cities/laguna-niguel`,
  `/services/leak-detection`, `/guides/`). The `.html` form is what the sitemap
  and canonicals use, so Google is told which URL is canonical.

## 2. Reviews and reputation — what the site actually claims

Two displays exist and they are **not** equally strong:

| Where | Text | Assessment |
|---|---|---|
| Footer badge (every page) | `★★★★★ 5/5 on Google` · `★★★★★ 4.8/5 on Yelp` | **No count** — ratings only. Matches `llms.txt`. |
| Homepage `#reviews` | "Rated 4.8 Stars on Yelp"; "74 reviews and counting"; "74 reviews on Yelp" | Count is Yelp-scoped and labelled. |
| Contact page | ~~"74+ Reviews" [Google] · [Yelp]~~ → **"Read our reviews" [Google] · [Yelp]** | **Fixed this run** — the old label could read as "74+ reviews across both platforms". |

The combined count is **not** on any other page. `terms-of-service.html` and
`privacy-policy.html` say only "Google and Yelp" (no number).

### The specific fix applied
The audit's own recommendation: *"If you cannot keep the numbers synchronized,
omit the count from your website rather than displaying a misleading one."*
`contact.html` now shows **"Read our reviews"** with the Google and Yelp links
and **no count**. The homepage's Yelp-specific "74 reviews" was **left as-is**:
it is explicitly attributed to Yelp, and the number cannot be independently
re-checked from here (Yelp returns 403 to this egress). Changing an
attributed, platform-specific figure we cannot verify would be a guess.

### Governing policy (why nothing else was touched)
`growth-engine/APPROVED_CLAIMS.md` puts **any review count or rating not matching
the live Google/Yelp profiles** in RESTRICTED, and **invented review counts** in
FORBIDDEN. No owner confirmation of a review count is recorded in the repo, and
no live count could be fetched (Yelp 403; Google share link returned no count).
So the safe action is to **remove an ambiguous count**, not to assert a new one.

### Owner-only actions (not applied)
These need the owner's Google/Yelp logins and are Level 3:
1. Confirm the live Google rating, count, and most-recent review date.
2. Confirm the live Yelp rating and count.
3. Respond to every unanswered review.
4. Re-sync the on-site numbers **only after** step 1–2; until then the
   count-free wording is the honest option.
5. Consider whether the footer's `5/5` and `4.8/5` badges should show the
   current figures or drop the decimal claim.

## 3. Not verifiable from here (blockers, recorded as such — never as zero)

- **Google Search Console / PageSpeed Insights / real-device mobile**: no
  credentials on this host. URL Inspection, indexing status, Core Web Vitals,
  and the "smartphone 5xx" report need GSC access. Record as UNMEASURED.
- **Live review counts**: Yelp returns **HTTP 403** to this egress IP; the
  Google `share.google` link returns 200 but exposes no count in the HTML.
- **Google-selected canonical**: only observable in GSC.

## 4. Result

One copy change (ambiguous review count removed on `contact.html`) plus its
`md/` + `llms-full.txt` mirrors. Everything else on the technical checklist
re-verified OK. No structured data, NAP, or schema change. No merge — PR for
owner review.
