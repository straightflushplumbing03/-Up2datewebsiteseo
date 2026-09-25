# Straight Flush Plumbing & Leak Detection — Website

Diagnose-first marketing site for Straight Flush Plumbing & Leak Detection, serving South & Central Orange County, CA. Static HTML/CSS/JS — no build step, no framework, no dependencies to install.

**Live brand:** Straight Flush Plumbing & Leak Detection — "Always A Safe Bet"
**Phone:** (949) 374-6524 · **Email:** straightflushplumbing03@gmail.com

The visual theme mirrors the original straightflushplumbingoc.com site (white header, navy/red-orange palette, Playfair Display serif, interactive symptom/problem pickers, Yelp/Google proof cards, service-area map, split booking form), rebuilt from scratch as a fast static site with expanded content and SEO infrastructure.

---

## What's in this repo

64 pages:

| Section | Pages |
|---|---|
| Core | Home, About, Contact, Service Areas, Thank You (form redirect) |
| Services | Hub + Leak Detection, Slab Leak Detection, PEX Repiping, Water Heater, Drain Services, Plumbing Repair |
| Cost/decision guides | Leak Detection Cost, Slab Leak Repair Cost, Repair vs. Reroute vs. Repipe |
| Insurance Resource Center | Hub + 4 articles |
| Leak Detection Academy | Hub + 22 articles, grouped by category |
| City pages | 21 individual Orange County city pages |
| Utility | 404 page |

## Structure

```
/
├── index.html                 ← homepage (cinematic scroll intro + full page)
├── about.html
├── contact.html
├── service-areas.html
├── 404.html
├── sitemap.xml                ← all 64 pages, for Google Search Console
├── robots.txt                 ← allows all crawlers, including AI/LLM bots
├── llms.txt                   ← structured site summary for AI answer engines
├── services/                  ← hub + 6 service pages
├── guides/                    ← 3 cost/decision guides
├── insurance/                 ← Insurance Resource Center (5 pages)
├── academy/                   ← Leak Detection Academy (22 pages)
├── cities/                    ← 21 individual city pages
└── assets/
    ├── css/style.css          ← single shared stylesheet (design tokens + components)
    ├── js/main.js             ← nav toggle, FAQ accordion, scroll-reveal, symptom/problem pickers
    ├── js/xray-hero.js        ← homepage cinematic scroll animation (GSAP)
    └── img/                   ← logo, founder photo, QR code

scripts/ contains the Python page-generator tooling used to build the Academy
articles, city pages, guides, and insurance pages from shared templates
(build.py). It's not required to run the site — it's there so you (or a
future developer) can add new pages in the same style instead of hand-coding
HTML from scratch. Run any gen_*.py from inside scripts/ with `python3
gen_whatever.py`; it writes directly into the site folders above.
```

Every page shares the same `<header>`/`<footer>` markup and the same stylesheet — there is no templating engine, so shared markup is duplicated per file by design (this is a static site, not an app).

## Running it locally

No build step. From the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (`npx serve`, VS Code Live Server, etc.) — just don't open the HTML files directly via `file://`, since a couple of relative-path and font-loading behaviors expect an actual origin.

## Deploying (production stack: Cloudflare → GitHub Pages)

The site is served through **Cloudflare (DNS + proxy) in front of GitHub Pages** (deploy from branch `main`, root). Pushing to GitHub via the normal flow triggers a Pages rebuild automatically — no build step, no CI config.

**Headers note:** GitHub Pages ignores the `_headers` file — it exists as a portability fallback for Netlify/Cloudflare Pages-style hosts. The production security headers (HSTS, CSP, X-Frame-Options, etc.) must therefore be applied with a **Cloudflare Transform Rule → Modify Response Header** (all on the free plan): set each header listed in `_headers` for all responses to the zone. Keep the header CSP identical to the meta CSP that ships in every page — browsers enforce both, and identical policies intersect cleanly.

**Cloudflare settings that matter for this site:**
- **Email Address Obfuscation (Scrape Shield): turn OFF.** It rewrites every email address in HTML into `data-cfemail` blobs, so AI crawlers and answer engines read gibberish instead of the contact email. The plain email still ships in `llms.txt`, but the HTML pages should be readable too.
- **Rocket Loader: keep OFF.** It rewrites script loading and conflicts with the CSP.
- Bot Fight Mode injects a small inline challenge script that a strict `script-src 'self'` CSP blocks. This only degrades Cloudflare's invisible bot-scoring telemetry on your pages — visitor-facing functionality (including the email-decode and challenge-platform scripts, which are same-origin) is unaffected.
- Optional cleanup: GitHub Pages sends `access-control-allow-origin: *`; remove that response header via the same Transform Rule if you want the tightest config (low risk either way for a fully public static site).

Because every internal link is a **relative path** (`services/leak-detection.html`, not `/services/leak-detection.html`), the site works correctly whether it's hosted at a domain root or in a GitHub Pages subfolder — no path rewriting needed.

## The homepage's interactive hero

The homepage opens with a CSS/SVG "sonar" animation (sonar rings and sweep rendered in pure CSS) leading into the headline and CTA. It carries no third-party animation library: the page loads only its own two scripts (`assets/js/main.js`, `assets/js/features.js`) plus Google Fonts. Two further interactive features live in `features.js`:

- **"Hear The Difference" sound comparison** — synthesizes two audio clips in-browser using the Web Audio API (a steady oscillator tone vs. filtered noise) so visitors can hear the acoustic signature of a healthy pipe vs. a pressurized leak. No audio files to host; generated on the fly.
- **Home Plumbing Health Score** — a 5-question assessment that calculates a 0–100 risk score client-side and gives a personalized result with a CTA.

Both degrade gracefully: if the Web Audio API isn't available, the play buttons simply do nothing rather than erroring, and the score quiz requires no network at all.

## Custom icon system

Every icon site-wide is a hand-drawn inline SVG (24x24 viewBox, `currentColor` stroke) — no emoji, no icon font, no external icon library. Definitions live in `scripts/icon_defs.py` and are applied automatically by `write_page()`, so any page generated through `scripts/build.py` gets the same consistent icon set. If you hand-edit an HTML file directly and want to swap an icon, copy the relevant `<svg class="ico">...</svg>` snippet from another page — they're all self-contained (no sprite sheet dependency).

## Flagship interactive features

Two features unique to this build (not something most local-service sites have):

- **"Hear The Difference" sound comparison** (homepage) — synthesizes two audio clips in-browser using the Web Audio API (a steady oscillator tone vs. filtered noise) to let visitors hear the acoustic signature of a healthy pipe vs. a pressurized leak. No audio files to host; it's generated on the fly in `assets/js/features.js`.
- **Home Plumbing Health Score** (homepage) — a 5-question interactive assessment that calculates a 0–100 risk score client-side and gives a personalized result with a CTA. Also in `assets/js/features.js`.

Both degrade gracefully: if the Web Audio API isn't available, the play buttons simply do nothing rather than erroring.

## SEO infrastructure

- **sitemap.xml** — lists all 64 pages with priority/changefreq. Submit this to Google Search Console and Bing Webmaster Tools after deploying.
- **robots.txt** — allows all standard crawlers plus explicit allow rules for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) so the site can be cited by AI answer engines.
- **llms.txt** — a structured, plain-language summary of the business, services, and key pages, following the emerging `llms.txt` convention aimed at helping AI assistants and answer engines (ChatGPT, Perplexity, Claude, etc.) accurately summarize and cite the business.
- **JSON-LD structured data** on every page: `Plumber`/`LocalBusiness` schema with real `AggregateRating` (4.8/74 Yelp) and `Review` entries on the homepage, `Service` schema on service pages, `FAQPage` schema on pages with FAQ sections. Every city page in `cities/` also carries a localized 5-question FAQ section with matching `FAQPage` schema (added/refreshed via `python3 scripts/add_city_faqs.py`, idempotent).
- **Open Graph + Twitter Card** meta tags on every page for clean social-media link previews.
- Every page has a unique, keyword-relevant `<title>` and meta description — none are duplicated.

## Updating contact info

Phone number, email, and address currently appear in the `<header>`, `<footer>`, and JSON-LD schema of every page. To change them site-wide, find-and-replace across all `.html` files:

- Phone: `(949) 374-6524` and `+19493746524`
- Email: `straightflushplumbing03@gmail.com`
- Address: `78 Cameray Heights, Laguna Niguel, CA 92677`

```bash
grep -rl "374-6524" --include="*.html" . | xargs sed -i 's/(949) 374-6524/YOUR-NEW-NUMBER/g'
```

## Business hours

Real hours (confirmed by the owner, do not change without confirming first): **Monday–Friday 8am–7pm, Saturday 9am–6pm, closed Sunday — with 24/7 availability for emergency calls only.** These appear in the footer of every page (`scripts/build.py`'s `footer()` function) and in the homepage's `openingHoursSpecification` JSON-LD schema.

If these ever change, update `scripts/build.py` and re-run `python3 scripts/fix_hours.py` — the idempotent hours patcher rewrites the footer hours line in every HTML file, the homepage JSON-LD description, and `llms.txt`, then verifies no stale phrasing remains. (In September 2026 it corrected all 131 pages that still said "Sat–Sun 9am–6pm" from an earlier version.) For the homepage `openingHoursSpecification` block, `Sat`/`Sun` day lists are hand-edited in `index.html`.

**Do not state the business is open 24/7 for general service** — only emergencies are handled outside the hours above. An earlier version of this site incorrectly stated blanket 24/7 hours; this was corrected sitewide and should not be reintroduced.

## Reviews

The homepage reviews section uses **paraphrased themes** from real Yelp reviews, not fabricated quotes, and links out to the real Google and Yelp profiles for the full, unedited reviews. If you want to swap in verbatim quotes with customer names, replace the two `<p>` lines inside `.review-card` in `index.html`.

## Security posture

This is a fully static site (no server, database, or user accounts), so attack surface is intentionally minimal. The hardening that ships in this repo:

- **Content-Security-Policy on every page** — a `<meta http-equiv="Content-Security-Policy">` (plus a `referrer` meta) is present in all 132 pages and in the generator template (`scripts/build.py`). It locks scripts to same-origin only (`script-src 'self'`), blocks `object`/`base-uri` injection, and restricts styles, fonts, images, and frames to the small set of origins the site actually uses (Google Fonts, Google Maps embeds). To re-run/extend injection after generating new pages: `python3 scripts/add_security_meta.py` (idempotent and self-upgrading).
- **Host-level security headers** — `_headers` (Netlify/Cloudflare Pages format) additionally sets HSTS (2-year, preload), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and COOP/CORP. These are headers-only directives the meta CSP cannot carry. `.nojekyll` is present for GitHub Pages (which ignores `_headers`; its HTTPS/HSTS is handled by GitHub).
- **Contact forms** — both forms (`contact.html`, homepage booking card) post to [Formspree](https://formspree.io) form **`xgojqkvb`** (`https://formspree.io/f/xgojqkvb`) instead of `mailto:`. Formspree provides server-side validation, spam filtering, and **rate limiting** out of the box. Both forms carry client-side field-length caps (`maxlength`), a phone `pattern`, `autocomplete` hints, and a hidden honeypot field (`_gotcha`) that silently discards bots. A hidden `_redirect` field sends successful submissions to `thank-you.html` (noindex) instead of Formspree's generic interstitial. The page CSP's form destinations must be updated if you switch form providers.
- **XSS** — there is no server-rendered or user-supplied content anywhere, and the two JavaScript rendering paths (`main.js` symptom picker, `features.js` health score) build DOM nodes with `textContent` instead of `innerHTML`, so no HTML-injection sink exists.
- **Repository hygiene** — no `.env`, credentials, tokens, or API keys exist in the repo (checked current tree and git history). `.gitignore` blocks env files, key material, and credential caches. A stray duplicate git object store (`.git-2/`) that had been committed has been removed from tracking.

If a backend is ever added (form handler of your own, admin area, database), re-run this audit: you would then need server-side input validation, parameterized queries, real rate limiting, auth with Argon2/bcrypt hashing, and signed webhooks — none of which a pure static site requires.

## Credits / stack

Plain HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JS. Fonts: Playfair Display, Inter, IBM Plex Mono (Google Fonts). No frameworks, no third-party scripts, no npm install required.
