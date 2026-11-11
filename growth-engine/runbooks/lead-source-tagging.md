# Lead source tagging runbook (Google Business Profile, directories, print)

**Purpose:** make every link we control outside the website say where a visit
came from, so GA4 (and, once PR #162 merges, the Formspree lead email) can tell
a Google Business Profile visitor from a Google Search visitor or a typed-in URL.

**Status:** `OWNER ACTION`. Nothing here changes a listing. Each step is done by
the owner inside the listing's own dashboard. Written 2026-11-11 by the Lead and
Revenue Analyst. Documentation only: no HTML, no business facts.

---

## 1. Why this matters (measured 2026-11-11)

- GA4, Aug 1 – Nov 10, 2026: **118 of 131 sessions are `(direct) / (none)`**,
  4 are `google / organic`, 2 `bing / organic`, 1 `chatgpt.com / ai-assistant`,
  1 `homeservicebase.com / referral`. The only tagged campaign is one `business-profile` session, which matches that homeservicebase visit (1 session, 1 engaged), not Google.
- **No session has ever carried a Google Business Profile tag.** The GBP website
  field is the plain `http://straightflushplumbingoc.com/` (OpenSEO profile
  lookup, 2026-11-11).
- Untagged GBP clicks are reported by GA4 as Direct (Google Maps app) or
  `google / organic` (Search). So the channel most likely to produce jobs is
  the one we cannot see.
- Source: Search Engine Land, "UTMs for Google Business Profile":
  https://searchengineland.com/guide/utms-for-google-business-profile

## 2. Tagged URLs to use (copy exactly)

Use `https://` (the GBP field is `http://`, which costs a redirect hop).
`utm_source=gbp` keeps GBP separate from `google / organic`; `utm_medium=organic`
keeps it in GA4's Organic channel.

| Where | Field | URL |
|---|---|---|
| Google Business Profile | Website | `https://straightflushplumbingoc.com/?utm_source=gbp&utm_medium=organic&utm_campaign=gbp-listing` |
| Google Business Profile | Appointment / booking link (if used) | `https://straightflushplumbingoc.com/contact.html?utm_source=gbp&utm_medium=organic&utm_campaign=gbp-booking` |
| Google Business Profile | Each post's button | `https://straightflushplumbingoc.com/<existing page>?utm_source=gbp&utm_medium=organic&utm_campaign=gbp-post&utm_content=<yyyy-mm-dd>` |
| Yelp | Business website | `https://straightflushplumbingoc.com/?utm_source=yelp&utm_medium=referral&utm_campaign=yelp-listing` |
| Any other directory (Angi, HomeGuide, Nextdoor, BBB, homeservicebase) | Website | `https://straightflushplumbingoc.com/?utm_source=<directory>&utm_medium=referral&utm_campaign=<directory>-listing` |
| Truck, cards, QR code | Printed link | `https://straightflushplumbingoc.com/?utm_source=print&utm_medium=offline&utm_campaign=<truck\|card\|qr>` |

Rules:

- Lower-case, hyphens, no spaces. Same spelling every time, or GA4 splits rows.
- A GBP post must link to a page that already exists (see the 11-09 report:
  a planned `/plumbing-tips/...` URL got a visit and returned the 404 page).
- Do not tag internal links on the site itself. That resets the session source.
- The canonical tags already strip the query string for search engines, and
  `lead_page` reads the canonical (PR #151), so tags do not split page rows.

## 3. Turn on the native GA4 ↔ Business Profile link (owner, 2 minutes)

Google now offers a direct link that imports Business Profile calls, direction
requests, website clicks and messages into GA4. That is the only way calls
started from the profile (which never touch the website) show up anywhere.

- Help: https://support.google.com/analytics/answer/16930347 and
  https://support.google.com/business/answer/16987554
- Path reported by third parties: GA4 > Admin > Product links > Google Business
  Profile links > Link, then pick the profile. Needs Editor on GA4 and Owner or
  Manager on the profile. Rolled out gradually from June 2026, so it may not show
  yet. Data is aggregated and kept for about six months.

## 4. How to read the result (after 14 days)

1. GA4 > Reports > Acquisition > Traffic acquisition, dimension
   **Session source / medium**. Look for `gbp / organic`, `yelp / referral`.
2. Compare `gbp / organic` sessions with the GBP dashboard's "Website clicks".
   A gap much larger than 2x means the link is not saved or the Maps app is
   stripping it. Recheck the field.
3. Once PR #162 is merged and `visit_source` is a GA4 custom dimension, a form
   lead from the profile reads `visit_source: gbp` in the Formspree email.
4. The crew's revenue-analyst shift reads these rows weekly.

## 5. Not covered here

- Phone calls dialed straight from the profile or from Maps: only the native
  link (section 3) or a call-tracking number can count them. A tracking number
  changes the listed phone (NAP), so it needs an owner decision and an
  entity-schema review first.
