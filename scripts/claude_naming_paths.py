#!/usr/bin/env python3
"""How does Claude web search name local businesses? Own site vs directory profile.

Reads growth-engine/data/citation_observations.jsonl (the daily claude_web_search
board) and, for every business named in an answer, checks which cited URL carries it:

  own_site   - a cited non-directory URL whose host contains a token of the name
  directory  - no own-site URL, but a directory URL (Angi, HomeGuide, BuildZoom ...)
               whose URL contains a token of the name
  unmatched  - neither (named from page text we did not store)

Heuristic token matching; read the shares, not single rows. Used by
exp-2026-11-13-claude-directory-path (EXPERIMENT_LOG.md).

Usage: python3 scripts/claude_naming_paths.py [--since YYYY-MM-DD] [--json OUT]
"""
import argparse
import collections
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OBS = ROOT / "growth-engine" / "data" / "citation_observations.jsonl"

DIRECTORIES = (
    "angi", "homeadvisor", "thumbtack", "yelp", "bbb", "homeguide", "porch",
    "expertise", "buildzoom", "superpages", "yp.com", "mapquest", "nextdoor",
    "servicemag", "lantern", "bark", "houzz", "threebestrated", "networx", "fixr",
    "google",
)
STOP = {
    "plumbing", "the", "and", "of", "inc", "services", "service", "orange", "county",
    "oc", "co", "llc", "leak", "detection", "heating", "air", "plumber", "plumbers",
    "rooter",
}
OUR_DOMAIN = "straightflushplumbingoc.com"


def tokens(name):
    words = re.findall(r"[a-z]+", name.lower())
    kept = [w for w in words if w not in STOP]
    return kept or words[:1]


def host(url):
    return (url.split("/")[2] if "//" in url else url).lower()


def directory_of(h):
    return next((d for d in DIRECTORIES if d in h), None)


def classify(name, urls):
    toks = tokens(name)
    for u in urls:
        h = host(u)
        if not directory_of(h) and any(t in h for t in toks):
            return "own_site", None
    for u in urls:
        d = directory_of(host(u))
        if d and any(t in u.lower() for t in toks):
            return "directory", d
    return "unmatched", None


def analyse(rows):
    paths = collections.Counter()
    dir_sources = collections.Counter()
    by_business = collections.defaultdict(collections.Counter)
    our_cited = 0
    for o in rows:
        urls = o.get("cited_urls", [])
        if any(OUR_DOMAIN in u.lower() for u in urls):
            our_cited += 1
        for b in o.get("businesses_named", []):
            path, d = classify(b, urls)
            paths[path] += 1
            by_business[b][path] += 1
            if d:
                dir_sources[d] += 1
    directory_only = sorted(
        ((b, c["directory"]) for b, c in by_business.items()
         if c["directory"] and not c["own_site"]),
        key=lambda x: -x[1])
    own_top = sorted(((b, c["own_site"]) for b, c in by_business.items() if c["own_site"]),
                     key=lambda x: -x[1])
    total = sum(paths.values())
    return {
        "observations": len(rows),
        "observations_with_a_named_business": sum(1 for o in rows if o.get("businesses_named")),
        "observations_citing_our_domain": our_cited,
        "observations_naming_straight_flush": sum(
            1 for o in rows if o.get("sf_status") not in (None, "absent", "inconclusive")),
        "namings": total,
        "paths": dict(paths),
        "path_share": {k: round(v / total, 3) for k, v in paths.items()} if total else {},
        "directory_sources": dict(dir_sources.most_common()),
        "named_only_via_directory": directory_only[:20],
        "named_via_own_site": own_top[:15],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--since", default="")
    ap.add_argument("--json")
    a = ap.parse_args()
    rows = [json.loads(line) for line in OBS.read_text().splitlines() if line.strip()]
    rows = [r for r in rows if r.get("ts", "")[:10] >= a.since]
    out = analyse(rows)
    out["window"] = {"since": a.since or min(r["ts"][:10] for r in rows),
                     "until": max(r["ts"][:10] for r in rows)}
    text = json.dumps(out, indent=2)
    if a.json:
        pathlib.Path(a.json).write_text(text + "\n")
    print(text)


if __name__ == "__main__":
    main()
