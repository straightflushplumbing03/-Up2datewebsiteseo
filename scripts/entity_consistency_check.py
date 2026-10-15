#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Entity consistency check — detect competing/stale Straight Flush properties.

The business is legitimately reachable on several hosts (the real site plus
owned duplicates). Search and AI engines resolve a business to ONE entity, so any
host that starts serving *indexable* content again is a regression: it splits
authority and can be cited instead of the real site.

This is the regression test for ENTITY_CONSISTENCY. It checks each known host and
classifies it:

  * `canonical`   — the real site (expected to be 200 + indexable)
  * `live_duplicate` — an owned host serving indexable content (BAD)
  * `gone`        — 404/410/non-serving (GOOD for a duplicate)
  * `noindex`     — serving but explicitly noindex (acceptable, low risk)
  * `unknown`     — could not determine (network error, unexpected status)

Stdlib only. No API key required.

Run:  python3 scripts/entity_consistency_check.py --run
      python3 scripts/entity_consistency_check.py --run --append
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

CANONICAL_HOST = "straightflushplumbingoc.com"

# Owned hosts that must NOT serve indexable content. Owner-confirmed 2026-10-15.
DUPLICATE_HOSTS = [
    "straight-flush-plumbing-7fb7cf71.base44.app",
    "straightflushplumb8.wixsite.com",
    "flush-pro-flow.base44.app",  # declared as the business @id in base44 JSON-LD
]

HISTORY = os.path.join(ROOT, "growth-engine", "data", "entity_consistency_history.jsonl")

UA = "Mozilla/5.0 (compatible; StraightFlushEntityCheck/1.0)"
TIMEOUT_S = 20


def _now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch(url, timeout=TIMEOUT_S):
    """Return (status, body). Never raises; status None means a network failure."""
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        body = ""
        try:
            body = exc.read().decode("utf-8", "replace")
        except Exception:  # noqa: BLE001
            pass
        return exc.code, body
    except Exception:  # noqa: BLE001 - network errors are expected outcomes here
        return None, ""


def robots_meta(body):
    """Extract the robots meta directive, if any."""
    m = re.search(r'<meta[^>]*name=["\']robots["\'][^>]*>', body or "", re.I)
    if not m:
        return None
    c = re.search(r'content=["\']([^"\']*)', m.group(0), re.I)
    return (c.group(1).strip().lower() if c else "")


def canonical_link(body):
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*>', body or "", re.I)
    if not m:
        return None
    h = re.search(r'href=["\']([^"\']*)', m.group(0), re.I)
    return h.group(1).strip() if h else None


def is_indexable(status, robots):
    """A page is indexable when it serves 200 without a noindex directive."""
    if status != 200:
        return False
    return not (robots and "noindex" in robots)


def classify(host, status, body):
    """Classify one host. Returns (verdict, detail_dict)."""
    robots = robots_meta(body)
    canonical = canonical_link(body)
    title_m = re.search(r"<title[^>]*>(.*?)</title>", body or "", re.S | re.I)
    title = re.sub(r"\s+", " ", title_m.group(1)).strip() if title_m else None

    detail = {"http_status": status, "robots": robots, "canonical": canonical,
              "title": title[:120] if title else None}

    if status is None:
        return "unknown", detail
    if host == CANONICAL_HOST:
        return ("canonical" if is_indexable(status, robots) else "unknown"), detail
    if status in (404, 410, 403, 451):
        return "gone", detail
    if is_indexable(status, robots):
        return "live_duplicate", detail
    if status == 200:
        return "noindex", detail
    return "unknown", detail


def check_host(host):
    url = f"https://{host}/"
    status, body = fetch(url)
    verdict, detail = classify(host, status, body)
    return {"host": host, "url": url, "verdict": verdict, **detail}


def check_all():
    hosts = [CANONICAL_HOST] + DUPLICATE_HOSTS
    return [check_host(h) for h in hosts]


def summarize(results):
    dupes = [r for r in results if r["verdict"] == "live_duplicate"]
    canonical_ok = any(r["host"] == CANONICAL_HOST and r["verdict"] == "canonical"
                       for r in results)
    return {
        "ts": _now_iso(),
        "canonical_ok": canonical_ok,
        "live_duplicates": [r["host"] for r in dupes],
        "hosts": results,
        "ok": canonical_ok and not dupes,
    }


def cmd_run(args):
    results = check_all()
    summary = summarize(results)

    for r in results:
        flag = {"live_duplicate": "!! REGRESSION", "gone": "ok (gone)",
                "noindex": "ok (noindex)", "canonical": "ok (canonical)"}.get(
                    r["verdict"], "? unknown")
        print(f"  [{r['verdict']:>14}] {r['host']}  HTTP {r['http_status']}  {flag}",
              file=sys.stderr)

    print(json.dumps(summary, indent=2, ensure_ascii=False))

    if args.append:
        os.makedirs(os.path.dirname(HISTORY), exist_ok=True)
        with open(HISTORY, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(summary, ensure_ascii=False) + "\n")
        print(f"\nAppended to {os.path.relpath(HISTORY, ROOT)}", file=sys.stderr)

    return 0 if summary["ok"] else 1


def main(argv=None):
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run", action="store_true", help="check all known hosts")
    ap.add_argument("--append", action="store_true",
                    help="append the summary to growth-engine/data/entity_consistency_history.jsonl")
    args = ap.parse_args(argv)

    if args.run:
        return cmd_run(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
