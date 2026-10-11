# Proposals — Owner Approval Required

Created 2026-10-09. Each item states what is asked, why, the approval level, and
what the automation may do once approved. Nothing here has been executed.

---

## P-001 — Lift the Cloudflare crawler block  [LEVEL 3 · URGENT]

**Ask:** Owner applies Cloudflare settings (dashboard) per `CLOUDFLARE-SETUP.md`:

1. Security → Settings → **Security Level: Medium** (not "I'm Under Attack").
2. **Bot Fight Mode: OFF** (or WAF skip rule for verified bots).
3. WAF → Custom rules → `allow-verified-crawlers` = `(cf.client.bot)`,
   action Skip → All remaining custom rules.
4. Scrape Shield → **Email Address Obfuscation: OFF**; Speed → **Rocket Loader: OFF**.

**Why:** Live domain returns 403 to every crawler and AI bot. No organic,
Maps, or AI-search visibility is possible until fixed. This is worth more than
any content work.

**Why not autonomous:** hosting/DNS/security configuration is Level 3 and the
domain is not managed from the repo.

**Verification after fix:**
`curl -sI https://straightflushplumbingoc.com/ | grep -i cf-mitigated` → empty;
homepage and `/robots.txt` → 200.

---

## P-002 — Connect measurement integrations  [LEVEL 3 · HIGH]

**Ask:** Provide access (or exports) for:
- **Google Search Console** (property verified for the domain).
- **Google Analytics 4** (if present).
- **Google Business Profile** performance.
- Optionally a **Perplexity API key** for real AI-answer visibility in-automation.

**Why:** Without these, organic/indexing/local-pack performance cannot be
measured, and the growth loop cannot verify its own changes.

---

## P-003 — Verify reputation & credential facts  [LEVEL 3 · MEDIUM]

**Ask:** Confirm:
- CSLB license number + classification (to publish/schema).
- Insurance/bond details.
- Whether the published street address should be public or presented as a
  service-area business (affects GBP + schema).
- Whether all 21 published cities are actively serviced.
- Warranty terms if any.

**Why:** These gate trust signals and prevent unverified claims. `APPROVED_CLAIMS.md`
lists them as restricted until confirmed.

---

## P-004 — Consolidate automations to the A–E schedule  [LEVEL 2 · MEDIUM]

**Ask:** Approve replacing the current overlapping automations
(Scout 05:30, Strategist 06:30, Sentinel retries) with the master schedule:

- **A** Morning AI Search & Competitor Intelligence — 06:00 PT daily
- **B** Daily Technical Health Check — 06:20 PT daily
- **C** Controlled Website Improvement — 07:00 PT weekdays
- **D** Weekly Strategy Review — 07:30 PT Mondays
- **E** Monthly Growth Audit — 08:00 PT on the 1st

**Why:** Removes duplicate coverage, reduces token cost, prevents conflicting
edits. Keeps the useful parts (Scout's competitor deep-dive, Strategist's gap
engine) inside A/D.

---

## P-005 — Notification channel  [LEVEL 3 · MEDIUM]

**Ask:** Provide an owner-approved notification target (email address or Slack
channel/webhook) for urgent alerts (downtime, site-wide noindex, business-info
errors).

**Why:** `INTEGRATION_STATUS.md` shows no channel configured; urgent issues
currently cannot be pushed to the owner.
