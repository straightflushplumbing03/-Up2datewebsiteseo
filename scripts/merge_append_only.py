#!/usr/bin/env python3
"""Merge append-only records without losing entries.

The intelligence branches conflict on files that are append-only by design:
the JSONL history logs and the dated sections of the markdown logs. Git sees
both sides as edits to the same lines, but the correct resolution is a union.

    JSONL            union by whole-record identity, sorted by `ts`.
    Markdown logs    sections delimited by `## ` headings, keyed by heading
                     text, ordered by the date in the heading (newest first).

A git merge of these files silently drops one side. That already happened once:
a `--theirs`-style resolution discarded a whole dated section of
`briefs/strategy-log.md` that existed only on the stale branch.

Usage:
    python3 scripts/merge_append_only.py --ours <file> --theirs <file> [--out <file>]

Reads the two conflicted versions and writes the union. With no `--out` the
result goes to stdout, so it can be redirected over the conflicted file.
"""

import argparse
import json
import re
import sys

SECTION_RE = re.compile(r"^## (?P<heading>.+)$", re.M)
# Leading ISO date in a heading, e.g. "2026-10-12 (HQ-D run #2) - ...".
DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})")


def load_jsonl(path):
    """Parse a JSONL file, skipping conflict markers and unparsable lines."""
    rows = []
    with open(path, encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            stripped = line.strip()
            if not stripped or stripped[0] in "<>=|":
                continue
            try:
                rows.append(json.loads(stripped))
            except json.JSONDecodeError:
                print(f"{path}:{lineno}: skipped unparsable line", file=sys.stderr)
    return rows


def union_jsonl(ours, theirs):
    """Union two record sets by whole-record identity, ordered by `ts`."""
    seen, merged = set(), []
    for record in ours + theirs:
        key = json.dumps(record, sort_keys=True)
        if key not in seen:
            seen.add(key)
            merged.append(record)
    merged.sort(key=lambda r: r.get("ts") or r.get("timestamp") or "")
    return "".join(json.dumps(r) + "\n" for r in merged)


def split_sections(text):
    """Split markdown into (preamble, [(heading, body), ...]).

    The body of a section is everything up to the next `## ` heading.
    """
    matches = list(SECTION_RE.finditer(text))
    if not matches:
        return text, []
    preamble = text[: matches[0].start()]
    sections = []
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections.append((match.group("heading"), text[match.start() : end]))
    return preamble, sections


def section_sort_key(heading):
    """Newest date first; undated headings keep their relative order at the end."""
    match = DATE_RE.match(heading)
    return (0, _negated_date(match.group(1))) if match else (1, heading)


def _negated_date(iso_date):
    """Sortable key that puts later dates first."""
    y, m, d = (int(part) for part in iso_date.split("-"))
    return (-y, -m, -d)


def union_markdown(ours, theirs):
    """Union dated sections, newest first, keeping ours on a heading collision."""
    pre_a, sec_a = split_sections(ours)
    pre_b, sec_b = split_sections(theirs)

    merged = {heading: body for heading, body in sec_b}
    merged.update({heading: body for heading, body in sec_a})  # ours wins ties

    ordered = sorted(merged.items(), key=lambda kv: section_sort_key(kv[0]))
    preamble = pre_a if len(pre_a) >= len(pre_b) else pre_b
    return preamble + "".join(body for _, body in ordered)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ours", required=True)
    parser.add_argument("--theirs", required=True)
    parser.add_argument("--out", help="write here instead of stdout")
    args = parser.parse_args()

    with open(args.ours, encoding="utf-8") as fh:
        ours = fh.read()
    with open(args.theirs, encoding="utf-8") as fh:
        theirs = fh.read()

    if args.ours.endswith(".jsonl") or args.theirs.endswith(".jsonl"):
        result = union_jsonl(load_jsonl(args.ours), load_jsonl(args.theirs))
    else:
        result = union_markdown(ours, theirs)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(result)
    else:
        sys.stdout.write(result)


if __name__ == "__main__":
    main()
