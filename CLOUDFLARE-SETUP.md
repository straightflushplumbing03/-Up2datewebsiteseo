# Cloudflare Setup Checklist — straightflushplumbingoc.com

The site is **static HTML on GitHub Pages, proxied by Cloudflare (DNS + proxy)**.
Everything in this file is applied in the **Cloudflare dashboard** — GitHub Pages
ignores `_headers`, so Cloudflare is the only place host-level headers can be set.
Work top to bottom; each item takes 1–3 minutes on the free plan.

> After finishing, verify with the curl commands at the bottom.

---

## 1. Security headers (Transform Rule → Modify Response Header)

**Where:** Cloudflare Dashboard → your zone → **Rules → Transform Rules →
Modify Response Header → Create rule**

Name the rule `security-headers`. Set **"All incoming responses"** (match all),
then add these **Set static** header actions — values identical to the repo's
`_headers` file so the meta CSP and header CSP intersect cleanly:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.googleusercontent.com https://maps.google.com https://maps.gstatic.com; script-src 'self'; frame-src https://www.google.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action https://formspree.io; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

Also add one **Remove** action for the header GitHub Pages adds:

- Remove `Access-Control-Allow-Origin` (Pages sends `*`; a fully public static
  site doesn't need it, and removing it is the tightest config).

---

## 2. Crawler & AI-bot access (the fixes that matter for SEO/AEO)

### 2a. Security Level + Bot Fight Mode

**Where:** Security → Settings

- **Security Level: Medium** (not "I'm Under Attack" — that JS-challenges every
  visitor and crawler).
- **Bot Fight Mode: OFF** *if you enable "Verified Bots" allowances below* —
  its challenge pages can interstitial-block AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot) that don't run JS, which is exactly the traffic this site's
  AEO strategy depends on. If you keep it ON, at minimum complete step 2b.

### 2b. WAF skip rule for verified crawlers (do this if Bot Fight Mode stays ON)

**Where:** Security → WAF → Custom rules → Create rule

Name: `allow-verified-crawlers`
Expression (Edit expression):

```
(cf.client.bot)
```

Action: **Skip** → check **All remaining custom rules** (leave Zone Lockdown /
IP ACL checks enabled). `cf.client.bot` matches Cloudflare's **verified-bot
list** — Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, Applebot, etc. —
so real crawlers are never challenged while generic scraper traffic still is.

> Note: if an AI crawler is missing from Cloudflare's verified list, the
> challenge still blocks it. Check Security → Events occasionally for
> challenge spikes against `/` or `/llms.txt`.

### 2c. Email Address Obfuscation: OFF

**Where:** Scrape Shield → Email Address Obfuscation → **Off**

It rewrites every email address in the HTML into `data-cfemail` blobs, so AI
answer engines read gibberish instead of the contact email. This is one of the
highest-impact AEO fixes on this list.

### 2d. Rocket Loader: OFF

**Where:** Speed → Optimization → Rocket Loader → **Off**

It rewrites script loading order and conflicts with the strict
`script-src 'self'` CSP.

### 2e. Mirage / other HTML-rewriting Scrape Shield features: OFF

**Where:** Scrape Shield → Mirage → Off (same reasoning — HTML rewriting).

---

## 3. Caching & performance (safe defaults)

**Where:** Caching → Configuration

- **Browser Cache TTL:** Respect Existing Headers (HSTS and friends are set by
  the Transform Rule; Pages already sends reasonable asset caching).
- **Crawler Hints: ON** — nudges Googlebot to re-crawl updated content faster.
- **Cache Level: Standard.**
- Do **not** enable "Always Online" (it can serve stale cached pages that
  diverge from the repo).

---

## 4. One-time verification (after applying the above)

```bash
# Security headers present on the live homepage?
curl -sI https://straightflushplumbingoc.com/ | grep -iE "content-security|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"

# access-control-allow-origin removed?
curl -sI https://straightflushplumbingoc.com/ | grep -i access-control   # expect: no output

# AI crawlers get a clean 200 on the pages they cite?
curl -s -o /dev/null -w "%{http_code}\n" https://straightflushplumbingoc.com/llms.txt
curl -s -o /dev/null -w "%{http_code}\n" https://straightflushplumbingoc.com/robots.txt
curl -s -o /dev/null -w "%{http_code}\n" -A "GPTBot" https://straightflushplumbingoc.com/
curl -s -o /dev/null -w "%{http_code}\n" -A "ClaudeBot" https://straightflushplumbingoc.com/

# No HTML rewriting (email addresses should appear in plain text)?
curl -s https://straightflushplumbingoc.com/contact.html | grep -c "straightflushplumbing03@gmail.com"   # expect >= 1
```

If any check fails, the matching dashboard section above is where to fix it.

---

## Why GitHub Pages + Cloudflare needs this

GitHub Pages serves the site but ignores the repo's `_headers` file, and it
adds `access-control-allow-origin: *`. Cloudflare sits in front as the proxy,
so its Transform Rule is the only mechanism that can attach the real security
headers to every response — and its bot settings are the gate that decides
whether AI answer engines can read the site at all. Both halves are required
for the site's SEO/AEO posture: headers for trust and XSS protection, crawler
access for citation in Google AI Overviews, ChatGPT, Claude, and Perplexity.
