#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deterministic drift supervisor for the AI Headquarters automations.

WHY THIS EXISTS
---------------
The daily automation writes to this repository 3x a week: new pages, new
reports, new PRs, sometimes new branches. The owner asked for a periodic check
that the system is "not going crazy" — specifically, that it is not
*automatically changing and writing new things* beyond what was intended, and
that it stays on track.

A drift signal ("did the agent merge its own PR?", "did the schedule change?",
"were 40 pages added this week?") is a fact, not a judgement. This script
collects those facts cheaply and deterministically — no LLM, no tokens spent
deciding what to check — and writes a compact JSON report. An agent (or the
owner) reads the report and decides.

WHAT IT CHECKS (each is PASS / FAIL / BLOCKED, never a silent zero)
-------------------------------------------------------------------
  automations_enabled   exactly one enabled *content* automation (the invariant)
  schedule_intact       the live daily cron is still 06:00 PT, every day
  prompt_matches_repo   the live prompt equals the repo prompt (no silent drift)
  ai_visibility_blind   at least one *AI-platform* row exists and is fresh (not a
                        conventional-search proxy), so the business goal is measured
  self_merges           no PR was merged by the account that opened it
  open_pr_backlog       open PRs are below the backlog threshold
  change_volume         files/pages changed since the last check are within budget
  unexpected_branches   remote branches that no known automation pattern explains

USAGE
-----
    python3 scripts/system_supervisor.py
    python3 scripts/system_supervisor.py --json          # machine-only output
    python3 scripts/system_supervisor.py --since 2026-10-09

The keys are read from the environment. As with the daily pre-stage, the
platform injects a registered secret only into a shell command whose TEXT names
it, so invoke it as:

    export OPENHANDS_API_KEY="${OPENHANDS_API_KEY}" GITHUB_TOKEN="${GITHUB_TOKEN}"
    python3 scripts/system_supervisor.py

Exit code is 0 when every check passes or is blocked, and 1 when any check
FAILS, so a caller can gate on it.
"""
import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HISTORY_PATH = os.path.join(ROOT, "growth-engine", "data", "supervisor_history.jsonl")
VISIBILITY_PATH = os.path.join(ROOT, "growth-engine", "data", "ai_visibility_history.jsonl")

HOST = os.environ.get("OPENHANDS_HOST", "https://app.all-hands.dev")
GH_API = "https://api.github.com"
REPO = "straightflushplumbing03/-Up2datewebsiteseo"

DAILY_AUTOMATION = "df8e3c2d-1fac-47fb-9af2-38d59c8239c5"  # HQ-D
EXPECTED_SCHEDULE = "0 6 * * *"          # every day, incl. weekends
EXPECTED_CONTENT_AUTOMATIONS = 1
# The live daily prompt is deployed from this canonical file (see
# growth-engine/automations/deploy_intelligence_hq.py). Comparing it against
# anything else reports false drift.
PROMPT_FILE = os.path.join(ROOT, "growth-engine", "automations",
                           "intelligence-hq-daily.prompt.md")

MAX_OPEN_PRS = 5          # more than this is a backlog the owner has not cleared
MAX_CHANGED_FILES = 200   # unique files changed between two supervisor runs
MAX_PAGES_ADDED = 25      # genuinely new indexable pages between two supervisor runs
MAX_AI_VISIBILITY_AGE_DAYS = 14  # newest AI-platform row older than this is stale

# Remote branch prefixes any automation is allowed to create. A branch is also
# treated as explained when it is the head of a known PR (see
# check_unexpected_branches), so this list only has to name the patterns that
# outlive their PRs.
KNOWN_BRANCH_PREFIXES = (
    "intelligence-hq/", "sfge/", "technical-seo/", "tests/",
    "memory/", "fix/", "trim-master-prompt",
)


def _now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def _http_json(url, token=None, accept="application/vnd.github+json"):
    req = urllib.request.Request(url)
    if token:
        req.add_header("Authorization", "Bearer " + token)
    req.add_header("Accept", accept)
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:200]
        raise RuntimeError(f"HTTP {e.code} {url}: {body}") from None


def _git(args, timeout=60):
    r = subprocess.run(["git", "-C", ROOT] + args, capture_output=True, text=True,
                       timeout=timeout)
    return r.returncode, r.stdout, r.stderr


def _check(name, ok, detail, **extra):
    rec = {"name": name, "ok": bool(ok), "detail": detail}
    if extra.get("blocked"):
        rec["blocked"] = True
    rec.update({k: v for k, v in extra.items() if k != "blocked"})
    return rec


# --- individual checks -----------------------------------------------------

def check_automations_enabled():
    token = os.environ.get("OPENHANDS_API_KEY")
    if not token:
        return _check("automations_enabled", False, "OPENHANDS_API_KEY not set",
                      blocked=True), None
    try:
        data = _http_json(f"{HOST}/api/automation/v1", token=token, accept="application/json")
    except Exception as e:
        return _check("automations_enabled", False, f"cannot list automations: {e}",
                      blocked=True), None
    items = data.get("automations") or data.get("items") or []
    enabled = [a for a in items if a.get("enabled")]
    # A content automation does the daily SEO work; a watchdog only re-dispatches.
    content = [a for a in enabled
               if "watchdog" not in (a.get("name") or "").lower()
               and "review" not in (a.get("name") or "").lower()
               and "supervisor" not in (a.get("name") or "").lower()]
    ok = len(content) == EXPECTED_CONTENT_AUTOMATIONS
    return _check(
        "automations_enabled", ok,
        f"{len(content)} enabled content automation(s): "
        + ", ".join(a.get("name", "?") for a in content),
        enabled_total=len(enabled), content_names=[a.get("name") for a in content],
    ), {a.get("id"): a for a in items}


def check_schedule_intact(by_id):
    if by_id is None:
        return _check("schedule_intact", False, "automations not listed", blocked=True)
    # by_id keys are real ids; find the daily one by id
    daily = by_id.get(DAILY_AUTOMATION)
    if daily is None:
        return _check("schedule_intact", False,
                      f"daily automation {DAILY_AUTOMATION[:8]} not found")
    got = (daily.get("trigger") or {}).get("schedule")
    return _check("schedule_intact", got == EXPECTED_SCHEDULE,
                  f"live cron {got!r}, expected {EXPECTED_SCHEDULE!r}")


def check_prompt_matches_repo(by_id):
    if by_id is None:
        return _check("prompt_matches_repo", False, "automations not listed", blocked=True)
    daily = by_id.get(DAILY_AUTOMATION)
    if daily is None:
        return _check("prompt_matches_repo", False, "daily automation not found")
    live = (daily.get("prompt") or "").strip()
    try:
        with open(PROMPT_FILE, encoding="utf-8") as fh:
            text = fh.read()
    except OSError as e:
        return _check("prompt_matches_repo", False, f"cannot read prompt file: {e}")
    # Same split the deploy script uses: everything after the first '---' rule is
    # the prompt body sent to the platform.
    parts = re.split(r"^---$", text, maxsplit=1, flags=re.M)
    if len(parts) != 2:
        return _check("prompt_matches_repo", False, "no '---' prompt separator in repo file")
    want = parts[1].strip()
    ok = live == want
    return _check("prompt_matches_repo", ok,
                  "live prompt == repo prompt" if ok
                  else f"live {len(live)} chars vs repo {len(want)} chars — DRIFTED")


def _newest_ai_platform_row(path):
    """Return (count, newest_iso_ts) of rows with test_type == ai_platform."""
    count = 0
    newest = None
    if not os.path.exists(path):
        return 0, None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if rec.get("test_type") != "ai_platform":
                continue
            count += 1
            ts = rec.get("ts")
            if ts and (newest is None or ts > newest):
                newest = ts
    return count, newest


def check_ai_visibility_blind(now=None):
    """The business goal is AI recommendation; measure it, never a proxy.

    `conventional_proxy` (Tavily) and `conventional_search` rows say nothing
    about AI answers. Only `ai_platform` rows (Gemini Search grounding) do. FAIL
    when there are none, or when the newest is stale.
    """
    count, newest = _newest_ai_platform_row(VISIBILITY_PATH)
    if count == 0:
        return _check(
            "ai_visibility_blind", False,
            "no ai_platform rows in ai_visibility_history.jsonl — AI surface "
            "UNMEASURED (all rows are conventional-search proxies); owner action: "
            "raise/rotate GEMINI_API_KEY grounding quota",
            count=0, newest=None)
    now = now or dt.datetime.now(dt.timezone.utc)
    try:
        newest_dt = dt.datetime.fromisoformat(newest.replace("Z", "+00:00"))
        if newest_dt.tzinfo is None:
            newest_dt = newest_dt.replace(tzinfo=dt.timezone.utc)
        age_days = (now - newest_dt).days
    except (ValueError, AttributeError):
        return _check("ai_visibility_blind", False,
                      f"newest ai_platform ts unparseable: {newest!r}",
                      blocked=True, count=count, newest=newest)
    fresh = age_days <= MAX_AI_VISIBILITY_AGE_DAYS
    return _check(
        "ai_visibility_blind", fresh,
        f"{count} ai_platform row(s); newest {newest} "
        f"({age_days}d old, limit {MAX_AI_VISIBILITY_AGE_DAYS}d)"
        + ("" if fresh else " — STALE, AI surface effectively unmeasured"),
        count=count, newest=newest, age_days=age_days)


def _gh_token():
    # The GitHub provider secret is not always injected under GITHUB_TOKEN; fall
    # back to the other names the platform uses so a missing alias is not read as
    # a missing integration.
    for name in ("GITHUB_TOKEN", "github_token", "GITHUB_PERSONAL_ACCESS_TOKEN"):
        val = os.environ.get(name)
        if val:
            return val
    return None


def _merged_by_login(pr, token):
    """Return the login that merged `pr`, or None when the API omits it.

    The GitHub *list* endpoint does not return `merged_by` (observed 0 of 40
    closed PRs), so reading it from the list made this check a silent
    always-PASS. Fall back to the single-PR endpoint, which does return it.
    """
    merger = (pr.get("merged_by") or {}).get("login")
    if merger:
        return merger
    try:
        detail = _http_json(f"{GH_API}/repos/{REPO}/pulls/{pr['number']}", token=token)
    except Exception:
        return None
    return (detail.get("merged_by") or {}).get("login")


def _collaborator_count(token):
    """Number of accounts with access, or None if it cannot be read."""
    try:
        users = _http_json(f"{GH_API}/repos/{REPO}/collaborators?per_page=100", token=token)
    except Exception:
        return None
    return len(users) if isinstance(users, list) else None


def check_self_merges(since):
    token = _gh_token()
    if not token:
        return _check("self_merges", False, "no GitHub token", blocked=True)
    try:
        prs = _http_json(
            f"{GH_API}/repos/{REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=40",
            token=token)
    except Exception as e:
        return _check("self_merges", False, f"cannot list PRs: {e}", blocked=True)

    merged = [p for p in prs
              if p.get("merged_at") and (not since or p["merged_at"] >= since)]
    offenders, unknown = [], []
    for p in merged:
        author = (p.get("user") or {}).get("login")
        merger = _merged_by_login(p, token)
        if not merger:
            unknown.append(p["number"])
            continue
        if author and author == merger:
            offenders.append(f"#{p['number']} by {merger}")

    # With a single collaborator the "a different account approved" rule cannot
    # be enforced, and every merge is by that one account (agent and owner share
    # it). Reporting that as a PASS would be blind and as a FAIL would be
    # permanent noise, so report the true count as UNMEASURED instead.
    collaborators = _collaborator_count(token)
    if collaborators is not None and collaborators < 2:
        return _check(
            "self_merges", False,
            f"UNMEASURED: review gate unenforceable with {collaborators} collaborator; "
            f"{len(offenders)} of {len(merged)} merged PR(s) in window are by the same "
            "account (add a second collaborator to enforce and measure it)",
            blocked=True, count=len(offenders), merged_in_window=len(merged),
            collaborators=collaborators, offenders=offenders)

    if unknown:
        return _check("self_merges", False,
                      f"merged_by unreadable for PR(s) {unknown} — UNMEASURED",
                      blocked=True, unknown=unknown)
    return _check("self_merges", not offenders,
                  "no self-merged PRs" if not offenders
                  else "self-merged: " + ", ".join(offenders),
                  count=len(offenders))


def check_open_pr_backlog():
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN")
    if not token:
        return _check("open_pr_backlog", False, "no GitHub token", blocked=True)
    try:
        prs = _http_json(f"{GH_API}/repos/{REPO}/pulls?state=open&per_page=100", token=token)
    except Exception as e:
        return _check("open_pr_backlog", False, f"cannot list open PRs: {e}", blocked=True)
    n = len(prs)
    return _check("open_pr_backlog", n <= MAX_OPEN_PRS,
                  f"{n} open PR(s) (threshold {MAX_OPEN_PRS})",
                  open_prs=[{"number": p["number"], "title": p["title"][:70]} for p in prs])


def _parse_numstat(text):
    """Return (unique_files_changed, html_additions) from `git log --numstat`.

    Counts *distinct* paths: a merge commit repeats the same path, and counting
    rows doubled the figure (292 rows vs 148 unique paths). `html_additions`
    counts only `.html` paths that gained lines, which flags a one-line edit to
    an existing page as if it were a new page; genuinely new pages are counted
    separately by check_change_volume via `--diff-filter=A`.
    """
    files = set()
    pages_added = 0
    for line in text.splitlines():
        if not line or re.fullmatch(r"[0-9a-f]{40}", line):
            continue
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        added, deleted, path = parts
        files.add(path)
        if added != "-" and int(added) > 0 and path.endswith(".html"):
            pages_added += 1
    return len(files), pages_added


def _unexpected_from(branches):
    return sorted(b for b in branches
                  if b != "main" and not b.startswith(KNOWN_BRANCH_PREFIXES))


def check_change_volume(since):
    if not since:
        # No prior supervisor run: this IS the baseline. Do not fail on history
        # we did not measure a delta against; record the baseline and pass.
        return _check("change_volume", True, "baseline established (no prior check)",
                      blocked=True, files=0, new_pages=0)
    rc, out, err = _git(["log", f"--since={since}", "--numstat", "--pretty=format:%H"])
    if rc != 0:
        return _check("change_volume", False, f"git log failed: {err.strip()[:120]}",
                      blocked=True)
    files, html_touched = _parse_numstat(out)
    # Genuinely new pages, not edits to existing ones (a one-line edit used to be
    # scored as an "HTML addition", which is what produced the false FAIL).
    rc2, added_out, _ = _git(
        ["log", f"--since={since}", "--diff-filter=A", "--name-only", "--pretty=format:%H"])
    new_pages = 0
    if rc2 == 0:
        new_pages = sum(1 for ln in added_out.splitlines()
                        if ln.endswith(".html") and not re.fullmatch(r"[0-9a-f]{40}", ln))
    ok = files <= MAX_CHANGED_FILES and new_pages <= MAX_PAGES_ADDED
    return _check("change_volume", ok,
                  f"since {since}: {files} unique files changed "
                  f"({html_touched} HTML edited), {new_pages} new page(s) "
                  f"(budget {MAX_CHANGED_FILES} files / {MAX_PAGES_ADDED} pages)",
                  files=files, html_touched=html_touched, new_pages=new_pages)


def _known_branches_snapshot(path_key):
    """Read the previous supervisor report's branch list, if any."""
    if not os.path.exists(HISTORY_PATH):
        return None
    last = None
    with open(HISTORY_PATH, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            for c in rec.get("checks", []):
                if c.get("name") == "unexpected_branches":
                    last = c.get(path_key)
    return last


def _pr_head_refs():
    """Head refs of every PR (any state). A branch matching one is explained.

    The hardcoded prefix list cannot keep up with the automation's branch
    naming, so merged work (`analytics/ga4-tag`, `ci/verify-gate`, ...) read as
    unexplained. A branch that is (or was) a PR head is explained by definition.
    """
    token = _gh_token()
    if not token:
        return None
    refs = set()
    page = 1
    while True:
        try:
            prs = _http_json(
                f"{GH_API}/repos/{REPO}/pulls?state=all&per_page=100&page={page}", token=token)
        except Exception:
            return refs if refs else None
        if not prs:
            break
        for p in prs:
            ref = (p.get("head") or {}).get("ref")
            if ref:
                refs.add(ref)
        if len(prs) < 100:
            break
        page += 1
    return refs


def check_unexpected_branches():
    rc, out, err = _git(["ls-remote", "--heads", "origin"])
    if rc != 0:
        return _check("unexpected_branches", False, f"ls-remote failed: {err.strip()[:120]}",
                      blocked=True)
    branches = [l.split("refs/heads/")[-1] for l in out.splitlines() if "refs/heads/" in l]
    pr_refs = _pr_head_refs()
    candidates = _unexpected_from(branches)
    if pr_refs is None:
        # No GitHub token: fall back to the prefix list alone, and say so.
        return _check("unexpected_branches", True,
                      f"{len(branches)} remote branch(es); {len(candidates)} outside known "
                      "patterns (PR-head cross-check unavailable: no token)",
                      blocked=True, total_branches=len(branches), unexpected=candidates)
    unexpected = sorted(b for b in candidates if b not in pr_refs)
    prev = _known_branches_snapshot("unexpected")
    if prev is None:
        # Baseline run: report the count, but as a signal for the owner to read,
        # not a failure. New unexpected branches in later runs are the trigger.
        return _check("unexpected_branches", True,
                      f"baseline: {len(branches)} remote branch(es), "
                      f"{len(unexpected)} outside known patterns and known PRs",
                      blocked=True, total_branches=len(branches),
                      unexpected=unexpected)
    new = sorted(set(unexpected) - set(prev))
    return _check("unexpected_branches", not new,
                  f"{len(branches)} remote branch(es); "
                  + ("no new unexplained branches" if not new
                     else "new unexplained: " + ", ".join(new)),
                  total_branches=len(branches), unexpected=unexpected, new_unexpected=new)


# --- driver ----------------------------------------------------------------

def last_check_timestamp():
    if not os.path.exists(HISTORY_PATH):
        return None
    last = None
    with open(HISTORY_PATH, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                last = json.loads(line).get("generated_at")
            except json.JSONDecodeError:
                continue
    return last


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--json", action="store_true", help="print JSON only")
    ap.add_argument("--since", default=None,
                    help="ISO date to measure change volume from (default: last check)")
    args = ap.parse_args()

    started = _now()
    since = args.since or last_check_timestamp()

    auto_check, by_id = check_automations_enabled()
    checks = [
        auto_check,
        check_schedule_intact(by_id),
        check_prompt_matches_repo(by_id),
        check_ai_visibility_blind(),
        check_self_merges(since),
        check_open_pr_backlog(),
        check_change_volume(since),
        check_unexpected_branches(),
    ]

    report = {
        "generated_at": started,
        "since": since,
        "checks": checks,
        "summary": {
            "passed": sum(1 for c in checks if c.get("ok")),
            "total": len(checks),
            "blocked": [c["name"] for c in checks if c.get("blocked")],
            "failed": [c["name"] for c in checks if not c.get("ok") and not c.get("blocked")],
        },
    }

    os.makedirs(os.path.dirname(HISTORY_PATH), exist_ok=True)
    with open(HISTORY_PATH, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(report, ensure_ascii=False) + "\n")

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(f"system_supervisor: {report['summary']['passed']}/{report['summary']['total']} checks passed")
        for c in checks:
            mark = "OK     " if c.get("ok") else ("BLOCKED" if c.get("blocked") else "DRIFT  ")
            print(f"  [{mark}] {c['name']}: {c['detail']}")
        if report["summary"]["failed"]:
            print("  FAILED: " + ", ".join(report["summary"]["failed"]))
        print(f"report -> {os.path.relpath(HISTORY_PATH, ROOT)}")

    return 1 if report["summary"]["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
