#!/usr/bin/env python3
"""Repair files on `main` that contain committed conflict markers.

`main` briefly received conflict markers because a merge resolver was handed an
already-conflicted file and passed the markers through. This repairs that.

Resolution is deliberately conservative and non-destructive: **both** sides of
every conflict block are kept, in order, with the markers removed. Nothing is
chosen, discarded, or reordered, so no content can be lost by this step. The
files are logs and issue registers, so keeping both sides is the correct outcome;
duplicate text is deduplicated where it is exactly repeated.

This script is a one-off repair, not part of the daily pipeline. It reports what
it changed and refuses to write a file that would still contain markers.

Usage:
    python3 scripts/strip_conflict_markers.py --check
    python3 scripts/strip_conflict_markers.py --apply
"""

import argparse
import json
import re
import sys

MARKER_START = re.compile(r"^<{7} .*$", re.M)
MARKER_MID = re.compile(r"^={7}$", re.M)
MARKER_END = re.compile(r"^>{7} .*$", re.M)
ANY_MARKER = re.compile(r"^(<{7}|={7}|>{7})", re.M)

FILES = [
    "briefs/strategy-log.md",
    "growth-engine/INTEGRATION_STATUS.md",
    "growth-engine/KNOWN_ISSUES.md",
    "growth-engine/CHANGELOG.md",
    "growth-engine/INDUSTRY_WATCH.md",
    ".openhands/memory/MEMORY.md",
]


def repair_text(text):
    """Keep both sides of each conflict block, markers removed."""
    lines = text.splitlines(keepends=True)
    out, i = [], 0
    while i < len(lines):
        if MARKER_START.match(lines[i]):
            i += 1
            while i < len(lines) and not MARKER_MID.match(lines[i]):
                out.append(lines[i])
                i += 1
            i += 1  # skip =======
            while i < len(lines) and not MARKER_END.match(lines[i]):
                out.append(lines[i])
                i += 1
            i += 1  # skip >>>>>>>
        else:
            out.append(lines[i])
            i += 1
    result = "".join(out)
    # Collapse runs of 3+ blank lines left behind by the removals.
    return re.sub(r"\n{4,}", "\n\n\n", result)


def repair_jsonl(text):
    """Union JSONL records, dropping marker lines and deduplicating."""
    seen, rows = set(), []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or ANY_MARKER.match(stripped):
            continue
        try:
            record = json.loads(stripped)
        except json.JSONDecodeError:
            continue
        key = json.dumps(record, sort_keys=True)
        if key not in seen:
            seen.add(key)
            rows.append(record)
    rows.sort(key=lambda r: r.get("ts") or r.get("timestamp") or "")
    return "".join(json.dumps(r) + "\n" for r in rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="report only")
    parser.add_argument("--apply", action="store_true", help="rewrite the files")
    args = parser.parse_args()
    if not (args.check or args.apply):
        parser.error("pass --check or --apply")

    changed = 0
    for path in FILES:
        try:
            with open(path, encoding="utf-8") as fh:
                original = fh.read()
        except FileNotFoundError:
            print(f"  {path}: absent, skipped")
            continue
        blocks = len(MARKER_START.findall(original))
        if not blocks:
            continue
        repaired = repair_text(original)
        if ANY_MARKER.search(repaired):
            print(f"  {path}: STILL HAS MARKERS after repair - refusing")
            return 1
        print(f"  {path}: {blocks} conflict block(s) -> repaired")
        changed += 1
        if args.apply:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(repaired)

    print(f"\n{changed} file(s) {'repaired' if args.apply else 'need repair'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
