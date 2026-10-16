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
  schedule_intact       the live daily cron is still Mon/Wed/Fri 06:00 PT
  prompt_matches_repo   the live prompt equals the repo prompt (no silent drift)
  ai_visibility_blind   AI-platform rows exist and are recent (the business goal)
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

HOST = os.environ.get("OPENHANDS_HOST", "https://app.all-hands.dev")
GH_API = "https://api.github.com"
REPO = "straightflushplumbing03/-Up2datewebsiteseo"
PROMPT_FILE = os.path.join(ROOT, "ai-headquarters-blueprint", "01-MASTER-AGENT-PROMPT.md")

DAILY_AUTOMATION = "1485d659-8663-4776-a507-db0fefed8483"
EXPECTED_SCHEDULE = "0 6 * * 1,3,5"
EXPECTED_CONTENT_AUTOMATIONS = 1

MAX_OPEN_PRS = 5          # more than this is a backlog the owner has not cleared
MAX_CHANGED_FILES = 120   # churn budget between two supervisor runs
MAX_PAGES_ADDED = 25      # new indexable pages between two supervisor runs
MAX_AI_MEASUREMENT_AGE_DAYS = 10  # AI-platform rows must be newer than this

# Remote branch prefixes any automation is allowed to create.
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
    m = re.search(r"^## THE PROMPT.*?\n(.*?)^## END OF PROMPT", text, re.S | re.M)
    if not m:
        return _check("prompt_matches_repo", False, "prompt markers not found in repo file")
    want = m.group(1).strip()
    ok = live == want
    return _check("prompt_matches_repo", ok,
                  "live prompt == repo prompt" if ok
                  else f"live {len(live)} chars vs repo {len(want)} chars — DRIFTED")


def check_self_merges(since):
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN")
    if not token:
        return _check("self_merges", False, "no GitHub token", blocked=True)
    try:
        prs = _http_json(
            f"{GH_API}/repos/{REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=40",
            token=token)
    except Exception as e:
        return _check("self_merges", False, f"cannot list PRs: {e}", blocked=True)
    offenders = []
    for p in prs:
        if not p.get("merged_at"):
            continue
        if since and p["merged_at"] < since:
            continue
        author = (p.get("user") or {}).get("login")
        merger = (p.get("merged_by") or {}).get("login")
        if author and merger and author == merger:
            offenders.append(f"#{p['number']} by {merger}")
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
    """Return (files_changed, html_additions) from `git log --numstat` output."""
    files = 0
    pages_added = 0
    for line in text.splitlines():
        if not line or re.fullmatch(r"[0-9a-f]{40}", line):
            continue
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        added, deleted, path = parts
        files += 1
        if added != "-" and int(added) > 0 and path.endswith(".html"):
            pages_added += 1
    return files, pages_added


def _unexpected_from(branches):
    return sorted(b for b in branches
                  if b != "main" and not b.startswith(KNOWN_BRANCH_PREFIXES))


def check_ai_visibility_blind():
    """Is the AI-platform surface actually being measured?

    This is the business-critical check for the stated goal — being recommended by
    AI engines. Every row in the history so far is a *conventional search proxy*
    (Tavily/Brave/DDG); `test_type: ai_platform` rows are what prove the AI surface
    is measured. Zero such rows means the programme is blind, not that the business
    is invisible. We fail the *measurement*, never record a visibility zero.
    """
    path = os.path.join(ROOT, "growth-engine", "data", "ai_visibility_history.jsonl")
    if not os.path.exists(path):
        return _check("ai_visibility_blind", False, "no visibility history file")
    ai_rows = 0
    latest = None
    total = 0
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            total += 1
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            if r.get("test_type") == "ai_platform":
                ai_rows += 1
                ts = r.get("ts") or ""
                if latest is None or ts > latest:
                    latest = ts
    if ai_rows == 0:
        return _check(
            "ai_visibility_blind", False,
            f"0 of {total} history rows are AI-platform measurements — the AI surface "
            "has never been measured (all rows are conventional-search proxies)",
            ai_platform_rows=0, total_rows=total,
            fix="provision a GEMINI_API_KEY (free tier) — see INTEGRATION_STATUS.md",
        )
    # Stale if the newest AI measurement is older than the window.
    try:
        newest = dt.datetime.fromisoformat(latest.replace("Z", "+00:00"))
        age_days = (dt.datetime.now(dt.timezone.utc) - newest).days
    except (ValueError, AttributeError):
        return _check("ai_visibility_blind", True,
                      f"{ai_rows} AI-platform row(s); latest ts unparsable ({latest!r})",
                      ai_platform_rows=ai_rows, total_rows=total)
    ok = age_days <= MAX_AI_MEASUREMENT_AGE_DAYS
    return _check(
        "ai_visibility_blind", ok,
        f"{ai_rows} AI-platform row(s); latest {age_days} day(s) ago "
        f"(window {MAX_AI_MEASUREMENT_AGE_DAYS})",
        ai_platform_rows=ai_rows, total_rows=total, latest_ai_ts=latest,
        age_days=age_days,
    )


def check_change_volume(since):
    if not since:
        # No prior supervisor run: this IS the baseline. Do not fail on history
        # we did not measure a delta against; record the baseline and pass.
        return _check("change_volume", True, "baseline established (no prior check)",
                      blocked=True, files=0, html_touched=0)
    rc, out, err = _git(["log", f"--since={since}", "--numstat", "--pretty=format:%H"])
    if rc != 0:
        return _check("change_volume", False, f"git log failed: {err.strip()[:120]}",
                      blocked=True)
    files, pages_added = _parse_numstat(out)
    ok = files <= MAX_CHANGED_FILES and pages_added <= MAX_PAGES_ADDED
    return _check("change_volume", ok,
                  f"since {since}: {files} file-changes, {pages_added} HTML additions "
                  f"(budget {MAX_CHANGED_FILES}/{MAX_PAGES_ADDED})",
                  files=files, html_touched=pages_added)


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


def check_unexpected_branches():
    rc, out, err = _git(["ls-remote", "--heads", "origin"])
    if rc != 0:
        return _check("unexpected_branches", False, f"ls-remote failed: {err.strip()[:120]}",
                      blocked=True)
    branches = [l.split("refs/heads/")[-1] for l in out.splitlines() if "refs/heads/" in l]
    unexpected = _unexpected_from(branches)
    prev = _known_branches_snapshot("unexpected")
    if prev is None:
        # Baseline run: report the count, but as a signal for the owner to read,
        # not a failure. New unexpected branches in later runs are the trigger.
        return _check("unexpected_branches", True,
                      f"baseline: {len(branches)} remote branch(es), "
                      f"{len(unexpected)} outside known patterns",
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
