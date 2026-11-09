# Security

## Authentication

- **Passwords** are hashed with `scrypt` (N=16384, r=8, p=1, 64-byte output) and
  a per-user random salt. The stored string records its scheme
  (`scrypt$N$salt$hash`) so the algorithm can be upgraded later. Plaintext is
  never stored or logged.
- **Sessions** are opaque 32-byte random tokens (`base64url`) in the `sessions`
  table, carried in an `httpOnly`, `sameSite=lax`, `secure`-in-production
  cookie. There is no JWT secret to leak and revocation is immediate: deleting
  the row ends the session.
- **Session lifetime** is 14 days; expired sessions are rejected on read.
- **Brute-force guard**: eight failed attempts for one email within 15 minutes
  locks that account for the remainder of the window. Counters persist in
  `schema_meta` so a restart does not clear them; a successful login clears them.
  The login route returns HTTP 429 with `Retry-After` while locked. Lockouts are
  recorded in `audit_log`.

## Roles

| Role | May |
|---|---|
| `owner` | Everything, including authorising locked-fact changes and managing users |
| `operator` | Run operations, publish routine changes, generate reports |
| `viewer` | Read-only |

`requireRole()` is called at the top of every mutating route handler; a missing
or insufficient role yields 401/403. See `src/lib/auth.ts`.

## Secrets

- Credentials are read **only** from environment variables at run time. Nothing
  is hardcoded, and nothing is written to the database.
- The Integrations page shows *which* environment variable a provider needs. It
  never displays a value.
- `data/owner-credentials.txt` (the one-time generated owner password) is
  gitignored. **Delete it after the first sign-in and change the password.**
- The database file `data/geo-lab.db` (plus `-wal`/`-shm`) is gitignored: it
  contains password hashes and session tokens.
- The lab never sends credentials anywhere except to the provider they belong to.
- If a credential is ever pasted into a chat, a report or a commit, rotate it.

## Input validation

- Every route handler validates its body and rejects malformed input with 400.
- Publishing candidates pass through `validateChange()`, which rejects: a
  substantially emptied page, any locked-fact change, an injected external
  `<script src>`, damaged headings/canonical/robots, unresolved new internal
  links, and unapproved claims.
- The HTML parser strips `<script>` and `<style>` contents before extracting
  structure, so anchors or headings embedded in JavaScript/JSON-LD are never
  read as real markup.

## Audit logging

- `audit_log` records actor, action, target and detail for sign-ins, lockouts,
  role changes, manual runs and publications.
- `activity` records what each agent did, at what level, with an evidence
  pointer.
- `publications` records the before/after hashes, the validation results, the
  branch, commit SHA and PR for every change, plus any rollback.

Both logs append; nothing is overwritten or deleted by normal operation.

## Deployment protection

- The lab runs behind HTTPS.
- `POST /api/run` accepts either an authenticated owner/operator session or the
  `GEO_LAB_RUN_TOKEN` bearer. Without either it returns 401.
- An overlap guard returns 409 rather than starting a second concurrent run.
- The lab never pushes to `main` and never merges a pull request; publishing
  opens a PR for human review.
- Recommended for production: put the lab behind Cloudflare Access or an IP
  allowlist, since it is an internal operations tool.

## Backup and recovery

- The entire state is one SQLite file. Back it up by copying
  `data/geo-lab.db` (use `sqlite3 .backup` or a file copy while idle).
- Content recovery is separate: `page_snapshots` and `publications.before_hash`
  allow any published change to be restored.
- A failed deployment rolls back automatically; every publication also has a
  manual **Roll back** control.

## Dependency and code checks

- `npx tsc --noEmit` and `npm test` run in CI on every PR that touches
  `geo-lab/**`.
- `npm run build` must succeed before merge.
- No runtime dependency performs network calls outside the provider adapters, so
  the reachable surface is small and reviewable.

## Data and privacy

- The lab stores no customer personal data. It collects only public information:
  the company's own pages, public search results, and publicly visible competitor
  domains.
- No review, testimonial, credential or business fact is ever fabricated.
- `robots.txt` and provider rate limits are respected; provider calls are spaced
  by a delay to stay inside documented limits.

## What is not implemented here

- Multi-factor authentication.
- Per-IP rate limiting at the edge (the account lockout above is per-email).
- Automated dependency vulnerability scanning beyond CI's install step.

These are known gaps and are recorded rather than claimed.
