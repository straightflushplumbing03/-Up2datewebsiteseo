# AGENTS.md — straightflushplumbingoc.com

Static HTML site published via GitHub Pages (CNAME: straightflushplumbingoc.com).
There is no build step in CI: the committed `.html` files *are* the site.

## Critical: do not run the `gen_*.py` scripts against production pages

`scripts/gen_*.py` are the original content generators. They predate two later
passes that were applied directly to the committed HTML:

1. the site-wide entity graph (`@id: https://straightflushplumbingoc.com/#business`)
2. per-page JSON-LD (BreadcrumbList / FAQPage / Service) and the corrected
   business hours

Because the generators were never updated for either, regenerating a page
**silently reverts production SEO**. Measured impact of running every generator:
61 of 75 pages overwritten, in three ways:

- `#business` entity graph deleted (64 pages lost it)
- JSON-LD blocks dropped
- canonical URLs rewritten to include `.html`
  (`/cities/san-clemente.html` instead of the canonical `/cities/san-clemente`)

`write_page()` in `scripts/build.py` now refuses to overwrite a page when the
regenerated output would drop the `#business` id or JSON-LD blocks. Override with
`SF_ALLOW_REGEN=1` only if you have confirmed the output is correct.

**To change a page, edit the `.html` directly** (or update the generator *and*
re-apply the entity graph). Never run a generator over the site as a whole.

## Conventions

- Canonical/OG URLs are extensionless: `https://straightflushplumbingoc.com/cities/san-clemente`
- Hub pages are directories with `index.html` and are declared in `sitemap.xml`
  with a trailing slash (`/guides/`, `/case-studies/`)
- Breadcrumb JSON-LD must match the visible breadcrumb trail
- Service-area cities are `areaServed` only — never invent a physical address
- No fabricated reviews, projects, licenses, or local offices

## Verification

```bash
# live site vs local checkout, and crawl depth from the homepage
python3 scripts/verify_live_vs_repo.py .

# broken internal links + sitemap/JSON-LD validation
python3 -c "..."   # see the checks used in the audit; or rely on CI below
```

Live pages and the repo are kept in sync; Cloudflare injects email-obfuscation
and a challenge script at the edge, which `verify_live_vs_repo.py` normalises
away before comparing.

## Gotchas

- Extensionless URLs resolve on GitHub Pages but 404 on a plain static server,
  so open `cities/san-clemente.html` when previewing locally.
- Cloudflare returns HTTP 403 when requests are sent too quickly. Pace any
  script that fetches many live URLs.
