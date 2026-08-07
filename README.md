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
| Core | Home, About, Contact, Service Areas |
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

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: deploy from branch `main`, folder `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.
4. If deploying to a **custom domain**, add a `CNAME` file at the root containing your domain, and update the `<link rel="canonical">` and JSON-LD `url` fields across pages to match (currently set to `https://straightflushplumbing.com/`).

Because every internal link is a **relative path** (`services/leak-detection.html`, not `/services/leak-detection.html`), the site works correctly whether it's hosted at a domain root or in a GitHub Pages subfolder — no path rewriting needed.

## The homepage's cinematic intro ("The X-Ray Descent")

The homepage hero is a scroll-driven animation: a tile floor dissolves into an X-ray view of the home's plumbing, a leak reveals itself, a card seals it, and the camera pulls back to the logo + CTA. It's built with:

- **GSAP + ScrollTrigger**, loaded from cdnjs (`assets/js/xray-hero.js`)
- Plain CSS/SVG layers (no WebGL/Three.js — this keeps it fast and dependency-free while still being fully scroll-scrubbed)
- A **static fallback**: if GSAP fails to load (offline, ad-blocker, etc.) or the visitor has `prefers-reduced-motion` enabled, the final logo/headline/CTA state displays immediately with no animation required. The page is never broken by this feature.

This requires an internet connection to load the GSAP CDN scripts. It will not animate if you open the site with no network connection at all (rare in practice), but will always display the final headline and CTA regardless.

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
- **JSON-LD structured data** on every page: `Plumber`/`LocalBusiness` schema with real `AggregateRating` (4.8/74 Yelp) and `Review` entries on the homepage, `Service` schema on service pages, `FAQPage` schema on pages with FAQ sections.
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

Real hours (confirmed by the owner, do not change without confirming first): **Monday–Friday 8am–7pm, Saturday 9am–6pm, closed Sunday — with 24/7 availability for emergency calls only.** These appear in the footer of every page (`scripts/build.py`'s `footer()` function, plus 6 hand-authored pages that don't use that shared template) and in the homepage's `openingHoursSpecification` JSON-LD schema. If these ever change, update `scripts/build.py`, regenerate all script-built pages, and manually patch `index.html`, `about.html`, `contact.html`, `service-areas.html`, `services/leak-detection.html`, and `services/slab-leak-detection.html`, which don't run through the generator.

**Do not state the business is open 24/7 for general service** — only emergencies are handled outside the hours above. An earlier version of this site incorrectly stated blanket 24/7 hours; this was corrected sitewide and should not be reintroduced.

## Reviews

The homepage reviews section uses **paraphrased themes** from real Yelp reviews, not fabricated quotes, and links out to the real Google and Yelp profiles for the full, unedited reviews. If you want to swap in verbatim quotes with customer names, replace the two `<p>` lines inside `.review-card` in `index.html`.

## Known limitations / next steps

- The Academy currently has 21 articles (not the full 250+ originally scoped) — the category structure and template are built to keep expanding on the same pattern.
- No CMS — every page is hand-authored HTML. For 100+ more pages, consider a static site generator (11ty, Astro, Hugo) fed by the same design system in `style.css`.
- No contact form backend — the contact form currently submits via `mailto:`, which opens the visitor's email client rather than sending silently. Wire it up to a form backend (Formspree, Netlify Forms, etc.) if you want silent submission.
- No analytics installed — add Google Analytics / GA4 or Plausible before launch if you want traffic data.

## Credits / stack

Plain HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JS. Fonts: Fraunces, Inter, IBM Plex Mono (Google Fonts). Animation: GSAP + ScrollTrigger (cdnjs). No frameworks, no npm install required.
