# Google Search Console measurement runbook

**Purpose:** make the first day that Google Search Console (GSC) access exists
productive instead of exploratory. GSC is the only reliable source for organic
impressions, clicks, queries, and indexing/coverage data (P-002, currently
**BLOCKED** — no credentials in this environment).

**Status:** `BLOCKED` — no `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` /
`GOOGLE_SEARCH_CONSOLE_*` secret is present in the run environment. Nothing in
this runbook has been executed against a live property. This is a **procedure**,
not a measurement result.

**Author/scope:** Intelligence HQ daily, 2026-10-20. Documentation only (Level 1).
No HTML, no business facts, no external property touched.

---

## 1. What must exist before the runbook can execute (owner action, P-002)

| # | Item | Exact requested change | Why |
|---|---|---|---|
| 1 | A GSC property | Property verified for `sc-domain:straightflushplumbingoc.com` (domain property), or the URL-prefix property `https://straightflushplumbingoc.com/` | All API calls are property-scoped |
| 2 | Service-account or OAuth credentials | Register a secret named `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` holding the service-account JSON, **and add that service-account email as a user of the property** in GSC | The API authenticates as the service account; a service account with no property grant returns `403` |
| 3 | Property identifier | Register `GOOGLE_SEARCH_CONSOLE_PROPERTY` = `sc-domain:straightflushplumbingoc.com` | Lets the client stop guessing the property string |
| 4 | API enabled | Enable the **Google Search Console API** on the service account's Google Cloud project | Otherwise every call returns `403 SERVICE_DISABLED` |

Do **not** paste credentials into a prompt, a repo file, or a report. Register
them as an OpenHands Cloud secret only.

## 2. Day-one checklist (in this order)

1. **Confirm the credential resolves** — a read-only `GET` that proves
   authentication, before any report is trusted:
   - `sites.list` must return the configured property. If the list is empty, the
     service account has no property grant: stop and report, do not treat it as
     zero data.
2. **Confirm the property string matches** what `sites.list` returned
   (`sc-domain:` vs `https://` are different properties with different data).
3. **Establish the baseline window** — pull 16 months where available, then
   report the trailing 28 days and the trailing 7 days separately. GSC data has a
   **2-3 day processing lag**; do not compare a partial final day against a
   complete one.
4. **Record the coverage/indexing split** — `indexed` vs `not indexed` and the
   reason buckets (e.g. "Discovered - currently not indexed", "Crawled -
   currently not indexed", "Alternate page with proper canonical tag",
   "Excluded by 'noindex' tag"). Root-level `.html` stubs are intentionally
   `noindex`; they should appear in the excluded buckets, not as errors.
5. **Pull the query report** and join it against
   `growth-engine/KEYWORD_UNIVERSE.md`. Record, per query: impressions, clicks,
   CTR, average position, and whether the query is one of the tracked intents.
6. **Pull the page report** and join it against the sitemap URL set (75 URLs) so
   orphan pages (impressions but no internal links) and dead pages (in sitemap,
   zero impressions) both surface.
7. **Open the Generative AI performance report** (see §3) and record its
   coverage. If the report is empty, record `UNMEASURED` with the date - an
   empty report is not evidence of zero AI visibility.
8. **Append** the run to `growth-engine/data/technical_health_history.jsonl`
   (and, once a client exists, a GSC-specific history file) using the
   append-only merge helper so concurrent runs do not clobber each other.

## 3. The Generative AI performance report (new, primary-source verified)

Google Search Console now exposes a **Generative AI performance report**. This is
the in-console measurement surface for how content performs in generative AI
features on Google Search and Discover - and it is the closest available
first-party signal for the business goal ("be recommended by AI answers").

Verbatim, from Google Search Central's *Optimizing for generative AI search*
page (fetched 2026-10-20, HTTP 200):

> "To measure how your content is performing in generative AI features on Google
> Search and Discover, use the Generative AI performance report in Search
> Console."

> "Be wary of third-party tools that promise ranking success or claim to use
> 'internal' Google metrics. No third-party tool has access to our internal
> ranking or AI systems."

Source: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

Two operational consequences:

- **Add the Generative AI performance report to the P-002 ask** (done - see
  `INTEGRATION_STATUS.md` and `proposals/2026-10-09-priority-actions.md`). The
  credential request should say plainly that we want the report *and* the API
  data, because the report may be UI-only on day one.
- **Do not accept a third-party "AI visibility score" as a substitute.** Our own
  `gemini_search` rows are a real observation of one answer engine, but they are
  not Google's internal data, and no vendor has it.

## 4. What this changes about our own tooling claims

The same page states, verbatim (fetched 2026-10-20, HTTP 200):

> "It's completely fine if you decide to create and maintain LLMS.txt files (or
> other similar files) for other services or systems that use these files. Doing
> so will neither harm nor help your site's visibility or rankings in Google
> Search, as Google Search ignores them."

> "For Google Search, you can ignore tactics like 'chunking' content, creating
> unnecessary AI text files (like llms.txt), or pursuing inauthentic mentions."

Source: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

So `/llms.txt` and `/md/**` are kept for **AI-agent consumers** (a legitimate,
different audience), and must not be described anywhere as a Google ranking
lever. This runbook records the correction; the copy-level re-frame is tracked in
`INDUSTRY_WATCH.md`.

## 5. Recording rules (unchanged, restated because they are easy to break)

- Missing credential -> **`BLOCKED`**, never `0`.
- Report exists but is empty for the window -> **`UNMEASURED`** with the date.
- A single day of GSC data is **not** a trend. Compare trailing 7 days to the
  previous 7 days and state the window explicitly.
- Impressions/clicks/position are **first-party Google data**; label them
  `VERIFIED`. Anything derived from our own Tavily/Gemini sweeps is an
  **`OBSERVED` proxy**, not a ranking measurement.
- Never convert an `unsupported` or `unverified` platform into a zero.

## 6. Client implementation note (not yet written)

No GSC client exists in this repo (`grep` for `search_console` returns nothing).
When credentials arrive, add **one** client - `growth-engine/gsc_client.py` -
mirroring the shape of `growth-engine/tavily_search.py` and
`growth-engine/gemini_search_client.py`: a thin transport, a `--smoke` mode, a
`--json` output, a labelled `note` on every row, and an exit code that
distinguishes `BLOCKED` from `UNMEASURED` (the pattern ISSUE-032 established for
the Gemini client). Do not add a second scheduler, database, or agent (section 2
of the operating brief).
