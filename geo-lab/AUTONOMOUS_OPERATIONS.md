# Autonomous Operations

How the lab runs without anyone watching it, what it may do on its own, and how
it is stopped if something goes wrong.

## The daily schedule

Every day at **06:00 America/Los_Angeles**, including weekends:

1. Run priority AI-visibility tests.
2. Review search performance (only if GSC/GA4 are connected; otherwise recorded
   as UNMEASURED).
3. Monitor competitors.
4. Crawl priority website pages.
5. Check technical website health.
6. Identify optimization opportunities.
7. Execute permitted optimizations.
8. Publish routine improvements.
9. Validate deployments.
10. Record all activity and update historical measurements.
11. Generate a daily activity report.

**Throughout the day:** queued tasks are processed, recoverable failures retried
within configured limits, and overlapping executions are prevented.

**Weekly** (Mon 06:15): complete competitor research, analyse visibility trends,
evaluate experiments, review geographic coverage, produce a weekly report.

**Monthly** (1st 06:30): reassess GEO strategy, review all five layers, evaluate
long-term performance, review costs, produce a monthly report.

The declarative form of this lives in `src/lib/schedule.ts` and is rendered in
**Settings → Autonomous schedule**.

## How it is scheduled

The lab does **not** run its own timer. Persistent scheduling is provided by an
external caller hitting one HTTP endpoint:

```
POST /api/run?trigger=<name>&report=daily&visibility=1&liveEntity=1&limit=20
Authorization: Bearer $GEO_LAB_RUN_TOKEN
```

Two schedulers drive it:

1. **GitHub Actions** — `.github/workflows/geo-lab-daily.yml` (the primary,
   repository-owned scheduler). One cron entry, `0 6 * * *`, pinned to the
   `America/Los_Angeles` IANA timezone, so it stays 06:00 local across the
   PST/PDT changeover. GitHub Actions supports a `timezone` on a schedule.
2. **The existing OpenHands daily automation** ("SFPL Intelligence HQ Daily
   6 AM") — a second heartbeat, useful when Actions is unavailable.

Both call the **same orchestrator** the manual buttons call, so behaviour is
identical no matter who triggers it. An authenticated owner/operator session may
also trigger a run by hand.

If `GEO_LAB_URL`/`GEO_LAB_RUN_TOKEN` are not configured, the workflow exits with
a notice instead of failing — safe to merge before deployment.

## Manual run controls

Every scheduled operation has a manual equivalent:

| Operation | Control |
|---|---|
| Full daily operation | Command Center → **Run daily operations** |
| Visibility sweep only | AI Visibility → **Run visibility sweep** |
| Entity check | Entity Intelligence → **Run entity check** |
| Publish safe fixes | Publishing History → **Publish safe fixes** (preview first) |
| Re-score pages | GEO Console → **Re-score** |
| Single agent | Autonomous Agents → per-agent buttons |
| Generate report | Reports → **Generate daily/weekly/monthly** |
| HTTP | `POST /api/run` with the run token |

## The agent team

Ten specialists, each with one responsibility and explicit boundaries
(`src/lib/agents/team.ts`):

| Agent | Responsibility |
|---|---|
| **GEO Research** | Visibility sweeps; mention/recommendation/citation metrics |
| **SEO Technical** | Crawl, indexability, metadata, canonical, headings, schema, links |
| **Content Intelligence** | Score sections; identify the weakest; propose factual improvements |
| **Entity Intelligence** | Identity consistency, NAP, services, geography, owned hosts |
| **Competitor Intelligence** | Evidence-based competitor map from observed results |
| **Experiment** | Create and evaluate controlled experiments |
| **Analytics** | Metrics, trends, reports |
| **Security & Quality** | Credentials, permissions, deployment health, content accuracy |
| **Publishing** | Implement policy-permitted changes, verify, roll back |
| **Chief Intelligence Orchestrator** | Assign, de-duplicate, prioritise, review, report |

### The orchestrator's duties

- Assigns each agent its task in a fixed order and records the result of every step.
- Guards against overlapping runs so two scheduled executions never run at once.
- Seeds the query library and canonical experiments.
- Reviews agent output for evidence: an agent that reports nothing measurable is
  logged as UNMEASURED, not as success.
- Derives prioritised opportunities from the crawl, scores and measured visibility.
- Records failures with their reason and keeps a complete, queryable history.
- Never publishes a change that fails validation, and never pushes to `main` or
  merges a PR.

**Overlap guard:** `isRunInProgress()` returns true while an `agent_runs` row is
unfinished. A second trigger gets HTTP 409, so a cron can never start a second
concurrent crawl.

## Autonomous publishing

### What may be published without approval

`ROUTINE_TYPES` in `src/lib/engine/publishing.ts`:

- `broken-internal-link-fix`
- `meta-description-fix`
- `heading-fix`
- `schema-add`
- `faq-add`
- `internal-link-improve`
- `alt-text-fix`
- `content-section-improve`
- `sitemap-refresh`

### What always requires owner authorisation

`OWNER_ONLY_TYPES`: identity, NAP, pricing, warranty, licensing, certification,
review, testimonial, legal, new-service.

These are enforced mechanically, not by convention:
`detectLockedFactChange()` runs on every candidate change and fails validation
when any locked value differs. A test asserts that a phone-number change is
rejected.

The system must never invent company identity, phone, address, pricing,
discounts, warranties, guarantees, licensing, certifications, testimonials,
reviews, project results, services the company does not offer, or legal
policies. It never manufactures case studies or claims work was completed.

### The publishing workflow

For every change:

1. Identify a verified opportunity.
2. Retrieve the existing content.
3. Understand the page and its dependencies.
4. Generate the improvement.
5. Check facts against the business knowledge base.
6. Validate content and technical implementation.
7. Save the previous version (snapshot).
8. Create a Git branch and commit.
9. Open a pull request (never a push to `main`, never a merge).
10. Verify the live page after deploy.
11. Record the change in `publications`.
12. Measure subsequent results.

### Validation gates (all must pass)

| Check | Fails when |
|---|---|
| Non-empty | The new page is substantially smaller than the old one |
| Locked facts | Any identity/NAP/pricing/etc. value changed |
| No new external script | An external `<script src>` was introduced |
| Structure intact | Headings or canonical/robots were damaged |
| Links resolve | A new internal link does not resolve |
| Claim policy | Superlatives or unapproved claims were introduced |

A change that fails any gate is recorded with `status = 'failed'` and is **not**
published. The failure is kept as evidence.

### Automatic rollback

Before publishing, the previous version is snapshotted and restorable. After
publishing, the live URL is checked for server errors and critical functionality.
If a change breaks the site, the previous version is restored and the
publication is marked `rolled_back`. A manual **Roll back** control is available
on every published change in Publishing History.

## Failure handling

- Failures are recorded in `agent_runs` (with `status='failed'` and `error`) and
  in `activity` at `error` level.
- Recoverable failures are retried within configured limits.
- The daily report lists outstanding tasks and recent failures.
- Major incidents are surfaced on the Command Center ("Recent failures").

## What the system deliberately does not do

- It does not push to `main`.
- It does not merge pull requests.
- It does not fabricate listings, reviews, results or credentials.
- It does not alter locked business facts.
- It does not treat an unreachable platform as zero visibility.
- It does not spam links or pursue manipulative SEO tactics.
- It respects `robots.txt`, provider terms and rate limits (350 ms between
  provider calls).
