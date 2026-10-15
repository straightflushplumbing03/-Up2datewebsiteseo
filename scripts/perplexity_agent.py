#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ask Perplexity (Agent API, web-grounded) customer-style questions and record
the answers as AI-visibility evidence.

Replaces the "Perplexity: unverified — JS app, no API key" line in
growth-engine/AI_VISIBILITY_METHODOLOGY.md with a real, reproducible measurement.

Examples
--------
Smoke test one query (prints a shape summary, never the key):

    python3 scripts/perplexity_agent.py --smoke --query "plumber in Laguna Niguel"

Run the curated suite and append evidence rows:

    python3 scripts/perplexity_agent.py --run --append

Dry run (no network; shows what would be asked):

    python3 scripts/perplexity_agent.py --run --dry-run

Requires PERPLEXITY_API_KEY in the environment. Never pass the key on the
command line — it would land in shell history and process listings.
"""
import argparse
import json
import os
import sys
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT, "growth-engine"))

import ai_agent_client as AC  # noqa: E402

HISTORY = os.path.join(ROOT, "growth-engine", "data", "ai_visibility_history.jsonl")

# Curated from growth-engine/KEYWORD_UNIVERSE.md: high-value service x city
# intents, plus the recommendation/comparison intents the methodology calls out.
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
    """A key-safe summary of a result: counts and status, never the key."""
    if not result.get("ok"):
        return {
            "ok": False,
            "error_type": result.get("error_type"),
            "status_code": result.get("status_code"),
            "message": (result.get("message") or "")[:200],
        }
    return {
        "ok": True,
        "status": result.get("status"),
        "model": result.get("model"),
        "response_id": result.get("response_id"),
        "answer_chars": len(result.get("answer") or ""),
        "answer_head": (result.get("answer") or "")[:160].replace("\n", " "),
        "sources": len(result.get("sources") or []),
        "citations": len(result.get("citations") or []),
        "domains": (result.get("domains") or [])[:10],
        "usage": result.get("usage"),
    }


def cmd_smoke(args):
    if not AC.api_key_present():
        print("PERPLEXITY_API_KEY is not set.\n"
              "Create a key at https://console.perplexity.ai and export it in your "
              "own terminal:\n  export PERPLEXITY_API_KEY=...\n"
              "Never paste the key into a chat or a repository file.", file=sys.stderr)
        return 1

    client = AC.AgentClient(
        preset=args.preset, model=args.model,
        timeout=args.timeout, max_retries=args.max_retries)
    try:
        result = client.ask(args.query)
        print(json.dumps(_shape(result), indent=2, ensure_ascii=False))
        return 0
    except AC.AgentError as exc:
        print(json.dumps(exc.as_dict(), indent=2, ensure_ascii=False))
        if exc.status_code == 401:
            print("\n401: the key was rejected. Check it in the API Console; if it "
                  "may have been exposed, rotate it.", file=sys.stderr)
        elif exc.status_code == 429:
            print(f"\n429: rate limited or model overloaded. Retry-After="
                  f"{exc.retry_after}. See "
                  "https://docs.perplexity.ai/docs/admin/rate-limits-usage-tiers",
                  file=sys.stderr)
        return 2


def _load_queries(args):
    if args.queries_file:
        with open(args.queries_file, encoding="utf-8") as fh:
            rows = [ln.strip() for ln in fh if ln.strip()]
        return [(r, "") for r in rows]
    return DEFAULT_QUERIES


def cmd_run(args):
    queries = _load_queries(args)
    if args.limit:
        queries = queries[: args.limit]

    if args.dry_run:
        print(json.dumps({
            "dry_run": True,
            "mode": "model" if args.model else "preset",
            "model": args.model,
            "preset": args.preset,
            "history": os.path.relpath(HISTORY, ROOT),
            "append": bool(args.append),
            "queries": [{"query": q, "city": c} for q, c in queries],
        }, indent=2, ensure_ascii=False))
        return 0

    if not AC.api_key_present():
        print("PERPLEXITY_API_KEY is not set — see --help. Aborting without "
              "recording anything (a missing key is not zero visibility).",
              file=sys.stderr)
        return 1

    client = AC.AgentClient(
        preset=args.preset, model=args.model,
        timeout=args.timeout, max_retries=args.max_retries)

    records, summary = [], []
    for query, city in queries:
        ts = _now_iso()
        try:
            result = client.ask(query)
        except AC.AgentError as exc:
            result = exc.as_dict()
        except Exception as exc:  # noqa: BLE001
            result = AC.classify_error(exc).as_dict()

        record = AC.build_record(query, city, result, ts=ts)
        records.append(record)
        summary.append({
            "query": query,
            "city": city,
            "straight_flush": record["straight_flush"],
            "sources": len(record.get("sources") or []),
            "domains": (record.get("top_results") or [])[:5],
            "error_type": record.get("error_type"),
        })
        print(f"  [{record['straight_flush']:>13}] {query}", file=sys.stderr)

    print(json.dumps({"queries": len(queries), "results": summary},
                     indent=2, ensure_ascii=False))

    if args.append:
        written = AC.append_records(HISTORY, records)
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
    ap.add_argument("--model", default=None,
                    help=f"Agent API model slug (default: preset mode, "
                         f"{AC.DEFAULT_PRESET!r})")
    ap.add_argument("--preset", default=AC.DEFAULT_PRESET,
                    help="preset when --model is not given (default: %(default)r)")
    ap.add_argument("--timeout", type=float, default=AC.DEFAULT_TIMEOUT_S)
    ap.add_argument("--max-retries", type=int, default=AC.MAX_RETRIES)
    args = ap.parse_args(argv)

    if args.smoke:
        return cmd_smoke(args)
    if args.run:
        return cmd_run(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
