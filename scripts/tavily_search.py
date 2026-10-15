#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Run conventional-search visibility checks through Tavily and record them.

Replaces the Brave / DuckDuckGo-HTML scraping path. Results are recorded as
`test_type: conventional_proxy` — conventional search, NOT an AI answer engine.

Examples
--------
Smoke test one query (prints a shape summary, never the key):

    python3 scripts/tavily_search.py --smoke --query "plumber in Laguna Niguel"

Run the curated suite and append evidence rows:

    python3 scripts/tavily_search.py --run --append

Dry run (no network; shows what would be asked):

    python3 scripts/tavily_search.py --run --dry-run

Requires TAVILY_API_KEY in the environment. Never pass the key on the command
line — it would land in shell history and process listings.
"""
import argparse
import json
import os
import sys
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT, "growth-engine"))

import tavily_search as TS  # noqa: E402

HISTORY = os.path.join(ROOT, "growth-engine", "data", "ai_visibility_history.jsonl")

# Mirrors the curated set in scripts/perplexity_agent.py so the AI-platform
# answer and the conventional-search ranking can be compared query-for-query.
DEFAULT_QUERIES = [
    ("plumber in Laguna Niguel", "Laguna Niguel"),
    ("best leak detection company in Laguna Niguel", "Laguna Niguel"),
    ("slab leak detection in Mission Viejo", "Mission Viejo"),
    ("water leak detection Laguna Niguel", "Laguna Niguel"),
    ("emergency plumber in South Orange County", "South Orange County"),
    ("copper pipe leak repair near Dana Point", "Dana Point"),
    ("PEX repiping company in Laguna Hills", "Laguna Hills"),
    ("water heater repair in Aliso Viejo", "Aliso Viejo"),
    ("who can locate a hidden water leak in Laguna Niguel?", "Laguna Niguel"),
    ("which local plumber handles recurring sewer backups in Laguna Niguel?", "Laguna Niguel"),
]


def _now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _shape(result):
    """A key-safe summary: counts and status, never the key."""
    if not result.get("ok"):
        return {
            "ok": False,
            "error_type": result.get("error_type"),
            "status_code": result.get("status_code"),
            "message": (result.get("message") or "")[:200],
        }
    return {
        "ok": True,
        "query": result.get("query"),
        "results": len(result.get("results") or []),
        "domains": (result.get("domains") or [])[:10],
        "response_time": result.get("response_time"),
        "request_id": result.get("request_id"),
        "straight_flush": TS.classify_visibility(result),
    }


def cmd_smoke(args):
    if not TS.api_key_present():
        print("TAVILY_API_KEY is not set.\n"
              "Create a key at https://app.tavily.com and export it in your own "
              "terminal:\n  export TAVILY_API_KEY=tvly-...\n"
              "Never paste the key into a chat or a repository file.", file=sys.stderr)
        return 1

    client = TS.TavilyClient(timeout=args.timeout, max_retries=args.max_retries)
    try:
        result = client.search(args.query, max_results=args.max_results,
                               search_depth=args.search_depth)
        print(json.dumps(_shape(result), indent=2, ensure_ascii=False))
        return 0
    except TS.TavilyError as exc:
        print(json.dumps(exc.as_dict(), indent=2, ensure_ascii=False))
        if exc.status_code == 401:
            print("\n401: the key was rejected. Check it at https://app.tavily.com; "
                  "if it may have been exposed, rotate it.", file=sys.stderr)
        elif exc.status_code == 429:
            print(f"\n429: rate limited. Retry-After={exc.retry_after}", file=sys.stderr)
        return 2


def _load_queries(args):
    if args.queries_file:
        with open(args.queries_file, encoding="utf-8") as fh:
            return [(ln.strip(), "") for ln in fh if ln.strip()]
    return DEFAULT_QUERIES


def cmd_run(args):
    queries = _load_queries(args)
    if args.limit:
        queries = queries[: args.limit]

    if args.dry_run:
        print(json.dumps({
            "dry_run": True,
            "endpoint": TS.ENDPOINT,
            "test_type": "conventional_proxy",
            "max_results": args.max_results,
            "search_depth": args.search_depth,
            "history": os.path.relpath(HISTORY, ROOT),
            "append": bool(args.append),
            "queries": [{"query": q, "city": c} for q, c in queries],
        }, indent=2, ensure_ascii=False))
        return 0

    if not TS.api_key_present():
        print("TAVILY_API_KEY is not set — see --help. Aborting without recording "
              "anything (a missing key is not zero visibility).", file=sys.stderr)
        return 1

    client = TS.TavilyClient(timeout=args.timeout, max_retries=args.max_retries)
    records, summary = [], []
    for query, city in queries:
        try:
            result = client.search(query, max_results=args.max_results,
                                   search_depth=args.search_depth)
        except TS.TavilyError as exc:
            result = exc.as_dict()

        record = TS.build_record(query, city, result, ts=_now_iso())
        records.append(record)
        summary.append({
            "query": query,
            "city": city,
            "straight_flush": record["straight_flush"],
            "results": len(record.get("top_results") or []),
            "domains": (record.get("top_results") or [])[:5],
            "error_type": record.get("error_type"),
        })
        print(f"  [{record['straight_flush']:>13}] {query}", file=sys.stderr)

    print(json.dumps({"queries": len(queries), "results": summary},
                     indent=2, ensure_ascii=False))

    if args.append:
        written = TS.append_records(HISTORY, records)
        print(f"\nAppended {written} record(s) to "
              f"{os.path.relpath(HISTORY, ROOT)}", file=sys.stderr)
    else:
        print("\n(no --append: nothing written)", file=sys.stderr)
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--smoke", action="store_true",
                    help="run one query and print a key-safe shape summary")
    ap.add_argument("--run", action="store_true",
                    help="run the query suite and print a summary")
    ap.add_argument("--query", default="plumber in Laguna Niguel",
                    help="query for --smoke (default: %(default)r)")
    ap.add_argument("--queries-file", help="one query per line (overrides the suite)")
    ap.add_argument("--limit", type=int, help="cap the number of queries")
    ap.add_argument("--append", action="store_true",
                    help="append records to growth-engine/data/ai_visibility_history.jsonl")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the plan without making any network call")
    ap.add_argument("--max-results", type=int, default=TS.DEFAULT_MAX_RESULTS,
                    help="results per query (default: %(default)s)")
    ap.add_argument("--search-depth", default="basic", choices=("basic", "advanced"),
                    help="Tavily search depth (default: %(default)s)")
    ap.add_argument("--timeout", type=float, default=TS.DEFAULT_TIMEOUT_S)
    ap.add_argument("--max-retries", type=int, default=TS.MAX_RETRIES)
    args = ap.parse_args(argv)

    if args.smoke:
        return cmd_smoke(args)
    if args.run:
        return cmd_run(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
