#!/usr/bin/env python3
"""Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep share submissions).

Built for exp-2026-11-03-indexnow-split (growth-engine/EXPERIMENT_LOG.md).
Google does NOT use IndexNow; this only speeds up Bing-family discovery, which
is the index behind Copilot and Bing-grounded AI answers.

Default is a DRY RUN: it validates the key file and the URL list and prints the
JSON payload. Nothing is sent unless --send is given.

    python3 scripts/indexnow_submit.py --arm treatment          # dry run
    python3 scripts/indexnow_submit.py --arm treatment --send   # submit
    python3 scripts/indexnow_submit.py --url https://straightflushplumbingoc.com/cities/irvine.html

Arms come from growth-engine/data/indexnow_experiment.json. Do not submit the
holdout arm before the experiment's day-14 read (see the log entry).
"""
import argparse
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HOST = "straightflushplumbingoc.com"
DOMAIN = f"https://{HOST}"
ENDPOINT = "https://api.indexnow.org/indexnow"
ARMS_FILE = os.path.join(ROOT, "growth-engine", "data", "indexnow_experiment.json")
KEY_RE = re.compile(r"^[A-Za-z0-9-]{8,128}$")


def find_key(root=ROOT):
    """Return the IndexNow key: the root <key>.txt file whose body equals its name."""
    for name in sorted(os.listdir(root)):
        stem, ext = os.path.splitext(name)
        if ext != ".txt" or not KEY_RE.match(stem):
            continue
        with open(os.path.join(root, name), encoding="utf-8") as fh:
            if fh.read().strip() == stem:
                return stem
    return None


def sitemap_urls(root=ROOT):
    with open(os.path.join(root, "sitemap.xml"), encoding="utf-8") as fh:
        return set(re.findall(r"<loc>([^<]+)</loc>", fh.read()))


def build_payload(urls, key):
    bad = [u for u in urls if not u.startswith(DOMAIN + "/")]
    if bad:
        raise ValueError(f"URLs outside {HOST}: {bad}")
    return {
        "host": HOST,
        "key": key,
        "keyLocation": f"{DOMAIN}/{key}.txt",
        "urlList": sorted(set(urls)),
    }


def main(argv=None):
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--arm", choices=["treatment", "holdout"])
    g.add_argument("--url", action="append")
    ap.add_argument("--send", action="store_true", help="actually submit (default: dry run)")
    args = ap.parse_args(argv)

    key = find_key()
    if not key:
        print("ERROR: no IndexNow key file (<key>.txt containing the key) at repo root", file=sys.stderr)
        return 2

    if args.arm:
        with open(ARMS_FILE, encoding="utf-8") as fh:
            urls = [DOMAIN + "/" + p for p in json.load(fh)["arms"][args.arm]]
    else:
        urls = args.url

    missing = [u for u in urls if u not in sitemap_urls()]
    if missing:
        print(f"ERROR: not in sitemap.xml: {missing}", file=sys.stderr)
        return 2

    payload = build_payload(urls, key)
    print(json.dumps(payload, indent=2))
    if not args.send:
        print("DRY RUN - nothing sent. Add --send to submit.")
        return 0

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"IndexNow HTTP {resp.status}")  # 200 or 202 = accepted
            return 0
    except urllib.error.HTTPError as e:
        # 400 bad request, 403 key not valid/not found, 422 URL/host mismatch, 429 too many
        print(f"IndexNow HTTP {e.code}: {e.read()[:300]!r}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
