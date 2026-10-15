#!/usr/bin/env python3
"""Deterministic measurement pre-stage for the daily Intelligence HQ run.

WHY THIS EXISTS
---------------
Two consecutive scheduled runs hit the ~32-minute platform ceiling and were
killed without producing anything. Their `current_phase` values show why: every
minute went to an *agent* discovering which commands to run.

    run 1 (1941 s) phases: ... -> "Write the 2026-10-15 daily report"
    run 2 (1953 s) phases: "Installing dependencies" -> "List data dir and tail
                           jsonl histories" -> "List PRs via GitHub API" ->
                           "Inspect record schema and wrapper style"   [killed]

Run 2 never executed a single measurement. Meanwhile the measurements themselves
are cheap: entity check 1.7 s, seo_audit 0.6 s, crawler check 3.7 s. The Tavily
sweep is the only slow part and it is bounded by query count.

So the expensive part is not measuring, it is *deciding how to measure*. This
script makes that decision once, in code, and leaves the agent a small, fast,
already-collected context.

WHAT IT DOES
------------
Runs every deterministic check, writes a compact JSON context to
`growth-engine/data/daily_context.json`, and prints a short human summary. It
appends to the history files, so its output IS the day's measurement record.

WHAT IT DELIBERATELY DOES NOT DO
--------------------------------
No analysis, no prioritisation, no report writing, no network calls beyond the
checks themselves, no LLM. Those are the agent's job and they are the part that
needs judgement. This script only answers "what are the facts today".

USAGE
-----
    python3 scripts/daily_measure.py                # full run
    python3 scripts/daily_measure.py --skip-tavily  # fast, no network sweep
    python3 scripts/daily_measure.py --queries 12   # smaller sweep

Exit code is always 0 unless the script itself fails; per-check failures are
recorded in the context so a partial day is still a recorded day.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTEXT_PATH = os.path.join(ROOT, "growth-engine", "data", "daily_context.json")


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _run(cmd, timeout=300):
    """Run a command, never raise. Returns (ok, exit_code, tail_of_output)."""
    try:
        p = subprocess.run(
            cmd, cwd=ROOT, capture_output=True, text=True, timeout=timeout
        )
        out = (p.stdout or "") + (p.stderr or "")
        return p.returncode == 0, p.returncode, out.strip()
    except subprocess.TimeoutExpired:
        return False, -1, f"timed out after {timeout}s"
    except FileNotFoundError as e:
        return False, -2, f"not found: {e}"


def _tail(text: str, lines: int = 12) -> str:
    return "\n".join(text.splitlines()[-lines:])


def check_crawler_access():
    ok, code, out = _run(["bash", "growth-engine/tests/crawler_access_check.sh"], 120)
    return {"name": "crawler_access", "ok": ok, "exit_code": code, "detail": _tail(out, 6)}


def check_seo_audit():
    ok, code, out = _run([sys.executable, "scripts/seo_audit.py"], 120)
    return {"name": "seo_audit", "ok": ok, "exit_code": code, "detail": _tail(out, 6)}


def check_entity_consistency():
    """Exit 1 means a duplicate host is serving indexable content again."""
    ok, code, out = _run(
        [sys.executable, "scripts/entity_consistency_check.py", "--run", "--append"], 180
    )
    return {
        "name": "entity_consistency",
        "ok": ok,
        "exit_code": code,
        "detail": _tail(out, 8),
        "note": (
            "exit 1 = an owned duplicate host is indexable again (report it, "
            "never edit the external property)"
        ),
    }


def check_knowledge_base():
    ok, code, out = _run(
        [sys.executable, "growth-engine/tests/validate_knowledge_base.py"], 120
    )
    return {"name": "knowledge_base", "ok": ok, "exit_code": code, "detail": _tail(out, 4)}


def check_sitemap_idempotent():
    """The shallow-clone lastmod regression (ISSUE-016) must stay fixed."""
    ok, code, out = _run([sys.executable, "scripts/refresh_sitemap.py"], 180)
    refreshed = None
    for line in out.splitlines():
        if line.startswith("lastmod refreshed:"):
            try:
                refreshed = int(line.split(":")[1].strip().split()[0])
            except (IndexError, ValueError):
                pass
    # `git status --porcelain sitemap.xml` non-empty means the tool rewrote it.
    _, _, status = _run(["git", "status", "--porcelain", "--", "sitemap.xml"], 30)
    return {
        "name": "sitemap_idempotent",
        "ok": ok and not status.strip(),
        "exit_code": code,
        "lastmod_refreshed": refreshed,
        "sitemap_dirty": bool(status.strip()),
        "detail": _tail(out, 4),
        "note": "a clean tree after refresh means the shallow-clone guard held",
    }


def check_visibility(queries: int):
    """Tavily sweep. Absent key is BLOCKED, never a zero."""
    have_key = any(
        os.environ.get(n) for n in ("TAVILY_API_KEY", "Tavily_api_key")
    )
    if not have_key:
        return {
            "name": "visibility_sweep",
            "ok": False,
            "blocked": True,
            "detail": "no Tavily key in this environment",
            "note": "record the platform BLOCKED, never zero",
        }
    ok, code, out = _run(
        [sys.executable, "scripts/tavily_search.py", "--run", "--append",
         "--limit", str(queries)],
        timeout=900,
    )
    return {"name": "visibility_sweep", "ok": ok, "exit_code": code, "detail": _tail(out, 8)}


def summarise_history():
    """Row counts per history file, plus the last visibility row per platform."""
    data_dir = os.path.join(ROOT, "growth-engine", "data")
    counts = {}
    try:
        names = sorted(os.listdir(data_dir))
    except OSError:
        names = []
    for fn in names:
        if not fn.endswith(".jsonl"):
            continue
        path = os.path.join(data_dir, fn)
        try:
            with open(path, encoding="utf-8") as fh:
                counts[fn] = sum(1 for line in fh if line.strip())
        except OSError:
            counts[fn] = None

    latest = {}
    vis = os.path.join(data_dir, "ai_visibility_history.jsonl")
    try:
        with open(vis, encoding="utf-8") as fh:
            rows = [json.loads(l) for l in fh if l.strip()]
        for row in rows:
            plat = row.get("platform")
            prev = latest.get(plat)
            if prev is None or (row.get("ts") or "") > (prev.get("ts") or ""):
                latest[plat] = row
    except (OSError, json.JSONDecodeError):
        pass
    return counts, latest


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--skip-tavily", action="store_true",
                    help="skip the network sweep (fast path)")
    ap.add_argument("--queries", type=int, default=40,
                    help="max queries for the Tavily sweep (default 40)")
    args = ap.parse_args()

    started = _now()
    checks = [
        check_knowledge_base(),
        check_crawler_access(),
        check_entity_consistency(),
        check_sitemap_idempotent(),
        check_seo_audit(),
    ]
    if args.skip_tavily:
        checks.append({
            "name": "visibility_sweep", "ok": False, "blocked": True,
            "detail": "--skip-tavily", "note": "record BLOCKED, never zero",
        })
    else:
        checks.append(check_visibility(args.queries))

    counts, latest = summarise_history()
    ctx = {
        "generated_at": started,
        "finished_at": _now(),
        "checks": checks,
        "history_row_counts": counts,
        "latest_visibility_row_per_platform": latest,
        "summary": {
            "checks_passed": sum(1 for c in checks if c.get("ok")),
            "checks_total": len(checks),
            "blocked": [c["name"] for c in checks if c.get("blocked")],
            "failed": [c["name"] for c in checks if not c.get("ok") and not c.get("blocked")],
        },
    }
    os.makedirs(os.path.dirname(CONTEXT_PATH), exist_ok=True)
    with open(CONTEXT_PATH, "w", encoding="utf-8") as fh:
        json.dump(ctx, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    print(f"daily_measure: {ctx['summary']['checks_passed']}/{ctx['summary']['checks_total']} checks passed")
    for c in checks:
        mark = "OK  " if c.get("ok") else ("BLOCKED" if c.get("blocked") else "FAIL")
        print(f"  [{mark}] {c['name']}")
    if ctx["summary"]["blocked"]:
        print(f"  blocked: {', '.join(ctx['summary']['blocked'])}")
    if ctx["summary"]["failed"]:
        print(f"  failed:  {', '.join(ctx['summary']['failed'])}")
    print(f"context -> growth-engine/data/daily_context.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
