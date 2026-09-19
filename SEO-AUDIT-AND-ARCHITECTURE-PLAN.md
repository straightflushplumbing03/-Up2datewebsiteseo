# Straight Flush Plumbing & Leak Detection — SEO + AI Authority Audit & Architecture Plan

**Status:** STOPPED AFTER AUDIT + ARCHITECTURE, per instruction.
**Reason for stopping:** An existing SEO/content system was found (`SEO-AI-SF` / "SFGE"). Per your
direction, the correct move is to **extend it, not build a parallel system**. No site content was
changed and no pages were created.

- Audit date: 2026-09-19
- Live site: https://straightflushplumbingoc.com/
- Production source: `github.com/straightflushplumbing03/-Up2datewebsiteseo` @ `main` = `2cd5fff`
- Existing SEO system: `github.com/straightflushplumbing03/SEO-AI-SF` (SFGE)

---

## 1. Critical context: where the code actually lives

The designated workspace directory `/workspace/project/-Up2datewebsiteseo` **is an empty git
repository** — no commits, no remote, no files. The real project lives elsewhere:

| Location | State |
|---|---|
| `/workspace/project/-Up2datewebsiteseo` | Empty. `No commits yet`, no remote configured. |
| `straightflushplumbing03/-Up2datewebsiteseo` | **Production source.** 301 files, 64+ pages, Pages enabled, `CNAME` = `straightflushplumbingoc.com` |
| `straightflushplumbing03/SEO-AI-SF` | **Existing SEO/AI authority engine ("SFGE").** 83 tests passing. |
| `straightflushplumbing03/my-vercel-neon-app1` | Bare Neon/Vercel/better-auth starter. **No SEO or Business Brain content code.** |
| `SEO-AI`, `SEO-AI-System`, `Up2dateseowebsite` | Empty repositories |
| `Uptodatestraightflushwebsite` | Older snapshot (97 files, no `cities/` dir, no `CNAME`) — superseded |

**Blocking question:** the workspace has no remote, so nothing can be pushed from here. To do
real work I need either (a) the production repo cloned into the workspace with push access, or
(b) a decision to work through SFGE's PR flow (its guardrail #1 requires PRs, never direct
pushes to `main`).

---

## 2. Phase 0 audit findings

### 2.1 Stack & architecture

- **Framework:** none. Hand-authored **static HTML/CSS/JS**. No Next.js, no build step, no npm.
- **Routing:** flat files + folders. Extensionless canonicals; relative internal links.
- **Hosting:** Cloudflare Pages, `CNAME` → custom domain. Verified: `www` → 301 → apex, `http` → 301 → https.
- **Content pipeline:** Python generators in `scripts/` (`build.py` + 19 `gen_*.py`). `build.py`
  holds shared `head/nav/footer` templates and `icon_defs.py` supplies inline SVG icons.
- **Templating:** none — shared markup is duplicated per file by design.

### 2.2 Content inventory (74 sitemap URLs)

| Section | Count |
|---|---|
| `/cities/*` | 21 (all 11 target areas already exist) |
| `/services/*` | 8 (hub + 7) |
| `/academy/*` | 23 (hub + 22 articles) |
| `/insurance/*` | 6 (hub + 5) |
| `/case-studies/*` | 4 (all Laguna Niguel) |
| `/guides/*` | 3 |
| About | 2 (incl. master authority page) |
| Other | `/`, `/contact`, `/service-areas`, `/plumbing-health-score`, `/south-oc-slab-leak-specialist`, `/privacy-policy`, `/terms-of-service` |

### 2.3 What is already correct (do not regress)

- **Titles/descriptions:** all unique across the 21 pages sampled. No duplicates, none missing.
- **Canonicals:** correct and extensionless on every page checked.
- **Root-level duplicates** (`/san-clemente.html`, `/leak-detection.html`, …) are correctly
  `noindex, nofollow` **and** self-canonicalize to `/cities/*` and `/services/*`. Not in sitemap. Safe.
- **Sitemap:** 74 URLs, well-formed, no root-duplicate entries, **zero orphan pages**.
- **robots.txt:** allows all, explicitly welcomes GPTBot, ChatGPT-User, OAI-SearchBot,
  Google-Extended, PerplexityBot, ClaudeBot, Claude-SearchBot, anthropic-ai, and more. References sitemap.
- **`llms.txt`:** present and genuinely good — canonical facts, services, service area, citation summary.
- **H1:** exactly one per page across all pages checked.
- **Images:** `width`/`height` set, `loading="lazy"` on non-hero, alt text descriptive and accurate.
- **OG image:** absolute URL. No fabricated office claims found in any city page.

### 2.4 Schema currently implemented

Present: `Plumber`, `Service`, `Offer`, `OfferCatalog`, `BreadcrumbList`, `City`, `FAQPage`,
`Question`/`Answer`, `Review`, `AggregateRating`, `Person`, `Rating`, `WebSite`/`SearchAction`,
`OpeningHoursSpecification`, `AdministrativeArea`, `ServiceChannel`, `ContactPoint`, `PostalAddress`.

Homepage `Plumber` block is rich: name, slogan, image, priceRange, foundingDate, 21-city
`areaServed`, PostalAddress, telephone, email, url.

---

## 3. Gaps vs. the brief (prioritized)

### P0 — architectural

| # | Gap | Spec phase |
|---|---|---|
| **C1** | **No `@id` anywhere.** Zero entities carry an `@id`; every page redeclares a disconnected `Plumber`. The brief explicitly requires a stable `#business` id and `@id` references instead of duplicated entities. | 9, 10 |
| **C2** | **City pages are thin and near-duplicate.** 204–322 words; only **3 H2s**; **no FAQ sections**; only ~37% of sentences are unique to their page (10 of 11 cities share the same boilerplate). Aliso Viejo is the outlier at 204 words / 1 H2 / no footer city links. | 3, 4, 27 |
| **C3** | **No contextual internal-link graph.** City pages have **zero body links to service pages** (services appear only in the footer). 8 of 11 cities have **no body city-to-city links**. Service pages link to **no city pages at all**. `/service-areas` body links to neither cities nor services. | 6 |
| **C4** | **Missing service pages.** Present: leak-detection, slab-leak-detection, pex-repiping, water-heater-services, drain-services, plumbing-repair, emergency-plumbing. Brief asks for **acoustic-leak-detection, water-leak-detection, water-line-repair, water-line-reroute, repiping** — absent. | 5 |
| **C5** | **San Clemente is not a reference implementation.** No FAQ, 3 H2s, 310 words, no body service links. Cannot serve as the template to replicate. | 27 |

### P1 — technical / measurement

| # | Gap | Spec phase |
|---|---|---|
| **C6** | **No analytics, no Search Console.** No GA4, no GTM, no verification meta tag anywhere. Zero measurement foundation. | 20, 23 |
| **C7** | `/service-areas` is **missing `og:title` and `og:image`**. | 12 |
| **C8** | `/cities/` and `/guides/` return **404** (no hub index at those paths). | 19 |
| **C9** | Only **3 real images** site-wide (`logo.jpg`, `lance-hero.jpeg`, `qr-code.png`). No technician, equipment, project, or repiping imagery — so Phases 13/14 (image + video authority) have no material. | 13, 14 |
| **C10** | Review count inconsistency: `index.html` says "74 reviews" (×2), `llms.txt` says "74+", SFGE `build.py` says "73+". | 8 |

### P2 — strategy / process

| # | Gap | Spec phase |
|---|---|---|
| **C11** | No machine-readable city×service matrix config. | 25 |
| **C12** | Case studies live at `/case-studies/`, not `/projects/` — reuse the existing path rather than creating a second system. | 7 |
| **C13** | `scripts/build.py` hardcodes the **wrong domain** (`straightflushplumbing.com`, missing "oc") in `head()`. Only 2 occurrences, and it's not currently in production output — but regenerating any page from this builder would emit **broken canonicals and OG URLs**. A live trap. | 19 |

---

## 4. The existing system to extend — SFGE (`SEO-AI-SF`)

This is the "Business Brain / SEO content system" you flagged. It is mature and already enforces
guardrails that match the brief's anti-spam rules.

**Test suite: 83 tests, all passing (1 skipped).**

Reusable components:

| Component | Role |
|---|---|
| `modules/objects/site_data.py` | Canonical entity source: DOMAIN, NAP, CITIES, hours, brand, `SAMEAS_VERIFIED`/`SAMEAS_TODO` |
| `modules/objects/schema_jsonld.py` | Schema builders — already has `organization()`, `local_business()`, `website()`, `master_authority_schema()` |
| `modules/objects/page.py` | Composes gold head/nav/footer markup byte-compatible with the live site |
| `modules/objects/links.py` | Builds city proximity links |
| `modules/objects/case_study.py` | Case-study builder, driven by real job rows |
| `modules/objects/review_miner.py`, `review_fold.py` | Review extraction/folding |
| `modules/objects/audit.py`, `link_audit.py`, `ai_visibility.py`, `demand_signal.py`, `keywords.py`, `blog_gen.py` | Audit, link graph, AI-visibility tracking, demand modelling, opportunities |
| `scripts/gen_*.py`, `audit_engine.py`, `livecheck.py`, `sync_prs.py`, `dashboard.py`, `weekly_report.py` | PR-based publishing + monitoring |
| `schema.sql` | `jobs`, `reviews`, `opportunities`, `content`, `ai_visibility_checks`, `audit_findings`, `settings` |
| `GUARDRAILS.md` | PR-only publishing, no fabrication, no PII, no SEO regression, rate-limiting, paid-API sign-off |

**Guardrails worth preserving verbatim:**
1. Every generated page is a PR, never a direct push to `main`.
2. Never publish a page without a real local detail from a real job/review.
3. Never expose customer-identifying data (cost buckets, city + neighborhood only).
4. Never regress existing site SEO (gold markup, `livecheck.py` before/after).
5. Rate-limit publishing to real job/review velocity.
6. Explicit sign-off before any paid API.

**Docs already written:** BUSINESS-ENTITY-CANONICAL, LOCAL-CITATION-AUTHORITY,
AI-VISIBILITY-TEST-PLAN, COMPETITOR-AUTHORITY-GAPS, BACKLINK-AUTHORITY-PLAN,
CONTENT-AUTHORITY-ROADMAP, AI-AUTHORITY-ARCHITECTURE, SITE-GROUND-TRUTH, SEO-IMPLEMENTATION-REPORT.

### 4.1 Stale artifacts to reconcile

- `SITE-GROUND-TRUTH.md` says **69 sitemap URLs**; live is now **74**.
- `SEO-IMPLEMENTATION-REPORT.md` lists **PR #9 as open**; it is **merged** (`945a05e`).
- `BUSINESS-ENTITY-CANONICAL.md` predates the `@id` requirement — needs a `#business` convention added.
- Address spelling conflict remains open: "78 Cameray Heights" (site) vs "78 Camery Hts" (invoices).
- Licensing/insurance still `[VERIFY]` — the single biggest E-E-A-T gap.

---

## 5. Proposed architecture (extend SFGE, don't duplicate)

### 5.1 Entity model (fixes C1)

Add to `site_data.py`:

```
BUSINESS_ID = "https://straightflushplumbingoc.com/#business"
WEBSITE_ID  = "https://straightflushplumbingoc.com/#website"
ORG_ID      = "https://straightflushplumbingoc.com/#organization"
```

Every page emits one canonical `Plumber` (`@id: #business`) with `sameAs`, NAP, hours,
`areaServed`, `makesOffer`, `knowsAbout`; every other block references it by `@id` only —
`Service.provider`, `WebPage.isPartOf`/`about`/`publisher`, `BreadcrumbList`, `WebSite.publisher`.
No page re-declares a standalone `Plumber` with different fields.

### 5.2 City page module (fixes C2, C3, C5)

New `modules/objects/city_page.py` + `scripts/gen_city_pages.py`, emitting PRs like every other
generator. Section skeleton (unique content per city, per the brief):

`H1 Plumber & Leak Detection in [CITY], CA` → opening → Leak Detection → Slab Leak Detection →
Water Line → Repiping → Plumbing Services (contextual links) → Why Homeowners Call Straight Flush →
Serving [CITY] and Nearby Communities → **FAQ** → CTA.

Guardrail #2 governs: a city page may only carry city-specific detail that is **real** (verified
ZIP codes, housing era, geography, or actual job/review data). Where none exists, emit a
`needs_field_data` flag and schedule auto-upgrade on the first real job in that city — **no filler**.

### 5.3 Internal-link graph (fixes C3)

City → 3–5 service pages (contextual, in-body, descriptive anchors) and 2–3 genuinely adjacent
cities. Service → 4–6 served cities. `/service-areas` → all 11 + service hub. Reuse `links.py`
proximity logic; enforce "no page links to every other page".

### 5.4 Service pages (fixes C4)

Add only services actually offered. Confirm with the owner before creating
`acoustic-leak-detection`, `water-leak-detection`, `water-line-repair`, `water-line-reroute`,
`repiping`. Acoustic/thermal detection is well evidenced in existing copy and `llms.txt`;
the water-line repair/reroute split needs owner confirmation.

### 5.5 Content matrix (fixes C11)

Single `config/city_service_matrix.yaml` (or extend `site_data.py`) as source of truth:
`city: {slug, name, state, zip_codes, neighborhoods, services, page_url, project_urls, faq_topics}`
and `services: {slug, name, description, related_services, city_pages}`. Consumed by all generators.

### 5.6 Measurement (fixes C6)

GA4 + Search Console verification + Bing Webmaster. Wire `ai_visibility.py` (already built) to the
prompt panel in `AI-VISIBILITY-TEST-PLAN.md` for the CITY/SERVICE/QUERY/ENGINE/cited/recommended
tracking model. No claim of API access where none exists.

### 5.7 Technical fixes (fixes C7–C13)

Add OG to `/service-areas`; add `/cities/` and `/guides/` hub indexes (or 301); correct the
`build.py` domain trap; reconcile review counts; update stale SFGE docs to 74 URLs.

### 5.8 San Clemente first (fixes C5)

Build San Clemente to the full skeleton → validate → then replicate the **component architecture,
not the wording** across the other 10 cities, each with its own real local data.

---

## 6. Recommended execution order

| Step | Work | Where |
|---|---|---|
| 0 | **Decide repo access** (clone prod repo into workspace, or work via SFGE PRs) | — |
| 1 | Add `@id` entity graph to `site_data.py` + `schema_jsonld.py`; update BUSINESS-ENTITY-CANONICAL | SFGE |
| 2 | Build `city_page.py` + `gen_city_pages.py`; content matrix | SFGE |
| 3 | Ship **San Clemente** as reference impl (full skeleton, FAQ, contextual links, schema) | PR |
| 4 | Replicate architecture to the other 10 cities with unique real data | PRs |
| 5 | Add confirmed service pages; internal-link graph | PRs |
| 6 | Technical SEO fixes + analytics/Search Console | PR |
| 7 | Update stale SFGE docs; run `livecheck.py` + 83-test suite | SFGE |

Each step: PR only, `livecheck.py` before/after, full test suite green.

---

## 7. Deliverables status

1. **Full audit report** — this document (§2–§3)
2. **Files changed** — none (stopped before build, as instructed)
3. **Files created** — this audit document only
4. **New URLs** — none
5. **Modified URLs** — none
6. **Schema summary** — §2.4 (current), §5.1 (proposed `@id` graph)
7. **Sitemap summary** — 74 URLs, 0 orphans, no root duplicates
8. **Internal-link summary** — §3 C3 (current gaps), §5.3 (proposed)
9. **City-page summary** — 21 exist, all 11 targets present; §3 C2 for quality gaps
10. **Service-page summary** — 8 exist; §3 C4 for missing
11. **Technical SEO fixes** — §3 P1, §5.7
12. **Remaining gaps** — §3, §4.1
13. **Manual owner tasks** — license/insurance verification; Google Business Profile alignment;
     citation audit (Tier 1–4 in `LOCAL-CITATION-AUTHORITY.md`); address-spelling confirmation;
     historical job/review backfill
14. **Business Brain integration** — reuse SFGE as the pluggable "AI Authority / Local Search
     Intelligence" layer (§4). Do **not** create a second analytics system.
15. **Test results** — SFGE suite: **83 tests, OK (1 skipped)**
16. **Git commit hash** — not applicable (no changes committed; workspace repo has no remote)
17. **Git push confirmation** — **not performed.** Workspace repo is empty with no remote.

---

## 8. What I need from you to proceed

1. **Repo access decision** — clone `-Up2datewebsiteseo` into the workspace with push rights, or
   drive everything through SFGE PRs (recommended, matches guardrail #1).
2. **Service confirmation** — which of `acoustic-leak-detection`, `water-leak-detection`,
   `water-line-repair`, `water-line-reroute`, `repiping` are genuinely offered as distinct services?
3. **Analytics approval** — GA4 property + Search Console access.
4. **Image/video assets** — real technician, equipment, and project photos are required before
   Phases 13/14 can produce anything genuine.

**Nothing was published, fabricated, or overwritten. No parallel system was created.**
