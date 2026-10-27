# AGENTS.md — straightflushplumbingoc.com

Static HTML site published via GitHub Pages (CNAME: straightflushplumbingoc.com).
There is no build step: the committed `.html` files *are* the site.

## Critical: do not run the `gen_*.py` scripts against production pages

`scripts/gen_*.py` are the original content generators. They predate the later
passes that were applied directly to the committed HTML — per-page JSON-LD
(`BreadcrumbList` / `FAQPage` / `Service`), the corrected business hours, and the
unique per-city titles and descriptions.

Because the generators were never updated, regenerating a page **silently reverts
production SEO**. Measured by running `scripts/gen_cities.py` on a clean checkout:

- JSON-LD blocks dropped — 4 blocks per city page reduced to 1
- Unique city `<title>`/`<meta name="description">` replaced by the old templated
  ones, discarding the local differentiation
- 585 lines deleted across 4 city pages in that single run

`write_page()` in `scripts/build.py` now refuses to overwrite a page when the
regenerated output would drop JSON-LD blocks or the `#business` id. Override with
`SF_ALLOW_REGEN=1` only after confirming the output is correct.

**To change a page, edit the `.html` directly** (or update the generator *and*
re-apply the later passes). Never run a generator over the site as a whole.

## Conventions

- Canonical/OG URLs and sitemap entries use the `.html` form: `https://straightflushplumbingoc.com/cities/san-clemente.html`
  (verified 2026-10-26: every page and `sitemap.xml` use `.html`; keep them consistent — don't flip conventions)
- Hub pages are directories with `index.html` and are declared in `sitemap.xml`
  with a trailing slash (`/guides/`, `/case-studies/`)
- Breadcrumb JSON-LD must match the visible breadcrumb trail
- Service-area cities are `areaServed` only — never invent a physical address
- No fabricated reviews, projects, licenses, or local offices

## Verification

There is **no CI** on this repository. Run the checks by hand before pushing:

```bash
python3 growth-engine/tests/validate_knowledge_base.py   # must pass; checks
                                                         # titles/descriptions,
                                                         # dead fragments,
                                                         # sitemap parity
python3 -m unittest discover -s growth-engine/tests -p "test_*.py"
bash growth-engine/tests/crawler_access_check.sh         # Cloudflare regression
python3 scripts/seo_audit.py                             # technical audit

# live site vs local checkout, and crawl depth from the homepage
python3 scripts/verify_live_vs_repo.py .
```

Live pages and the repo are kept in sync; Cloudflare injects email-obfuscation
and a challenge script at the edge, which `verify_live_vs_repo.py` normalises
away before comparing.

## Analytics

- GA4 `G-DFS6B1LV4P`. The CSP lives in `scripts/csp_policy.py`; `connect-src` must allow every GA4 collect host
  (`*.google-analytics.com`, `*.analytics.google.com`, `analytics.google.com`, `www.google.com`, `*.g.doubleclick.net`),
  guarded by `test_ga4_tag.py`. Before 2026-10-26 the CSP blocked every page_view.
- Lead events come from `assets/js/lead-events.js`: `phone_call_click`, `generate_lead`, `form_submit_confirmed`.
  No personal data is sent.

## Gotchas

- Extensionless URLs resolve on GitHub Pages but 404 on a plain static server,
  so open `cities/san-clemente.html` when previewing locally.
- Cloudflare returns HTTP 403 when requests are sent too quickly. Pace any
  script that fetches many live URLs.
- Root-level `.html` files are `noindex` stubs that exist to keep extensionless
  URLs working. The indexable pages live in subdirectories (`cities/`,
  `services/`, `academy/`, `guides/`, `insurance/`, `case-studies/`).
