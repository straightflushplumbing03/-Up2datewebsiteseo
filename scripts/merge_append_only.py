#!/usr/bin/env python3
"""Resolve git conflicts in append-only records without losing entries.

The intelligence branches conflict on files that are append-only by design: the
JSONL history logs and the dated sections of the markdown logs. Git sees both
sides as edits to the same lines, but the correct resolution is a union.

A plain merge resolution keeps one side and silently discards entries that exist
only on the other. That has cost us real data twice: once dropping a whole dated
section of `briefs/strategy-log.md`, and once shipping conflict markers into
`main` because the resolver was handed an already-conflicted file and passed the
markers straight through.

This resolver works on *conflict blocks only*. Text git already merged cleanly is
left untouched, which is more correct and more conservative than re-merging whole
files.

    JSONL       each conflict block becomes the union of both sides' records,
                deduplicated by whole-record identity; the file is then sorted
                by `ts`.
    Markdown    each conflict block becomes the union of the `## `-delimited
                sections from both sides, keyed by heading text, ordered by the
                date in the heading, newest first. The local side wins a heading
                collision.

A hard guard refuses to emit output containing conflict markers, so a resolution
can never silently produce a broken file.

Usage:
    python3 scripts/merge_append_only.py --resolve <conflicted-file> [--out <file>]
    python3 scripts/merge_append_only.py --ours <a> --theirs <b> [--out <file>]

`--resolve` operates on a file that already contains conflict markers, which is
the normal state during a merge. `--ours`/`--theirs` compare two clean versions.
"""

import argparse
import json
import re
import sys

SECTION_RE = re.compile(r"^## (?P<heading>.+)$", re.M)
DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})")

MARKER_START = re.compile(r"^<{7} .*$")
MARKER_MID = re.compile(r"^={7}$")
MARKER_END = re.compile(r"^>{7} .*$")
ANY_MARKER = re.compile(r"^(<{7}|={7}|>{7})", re.M)


class ConflictMarkersRemain(RuntimeError):
    """Raised when a resolution would emit conflict markers."""


def parse_conflicts(text):
    """Split text into ('text', str) and ('conflict', ours, theirs) segments."""
    segments, lines = [], text.splitlines(keepends=True)
    buf, i = [], 0
    while i < len(lines):
        if MARKER_START.match(lines[i]):
            if buf:
                segments.append(("text", "".join(buf)))
                buf = []
            ours, theirs = [], []
            i += 1
            while i < len(lines) and not MARKER_MID.match(lines[i]):
                ours.append(lines[i])
                i += 1
            i += 1  # skip the ======= line
            while i < len(lines) and not MARKER_END.match(lines[i]):
                theirs.append(lines[i])
                i += 1
            i += 1  # skip the >>>>>>> line
            segments.append(("conflict", "".join(ours), "".join(theirs)))
        else:
            buf.append(lines[i])
            i += 1
    if buf:
        segments.append(("text", "".join(buf)))
    return segments


def load_jsonl_text(text):
    """Parse JSONL text, skipping blank and unparsable lines."""
    rows = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or ANY_MARKER.match(stripped):
            continue
        try:
            rows.append(json.loads(stripped))
        except json.JSONDecodeError:
            continue
    return rows


def union_jsonl(*texts):
    """Union JSONL records by whole-record identity, sorted by `ts`."""
    seen, merged = set(), []
    for text in texts:
        for record in load_jsonl_text(text):
            key = json.dumps(record, sort_keys=True)
            if key not in seen:
                seen.add(key)
                merged.append(record)
    merged.sort(key=lambda r: r.get("ts") or r.get("timestamp") or "")
    return "".join(json.dumps(r) + "\n" for r in merged)


def split_sections(text):
    """Split markdown into (preamble, [(heading, body), ...])."""
    matches = list(SECTION_RE.finditer(text))
    if not matches:
        return text, []
    preamble = text[: matches[0].start()]
    sections = []
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections.append((match.group("heading").strip(), text[match.start() : end]))
    return preamble, sections


def _date_key(heading):
    """Newest date first; undated headings sort last, alphabetically."""
    match = DATE_RE.match(heading)
    if not match:
        return (1, heading)
    y, m, d = (int(part) for part in match.group(1).split("-"))
    return (0, (-y, -m, -d))


def union_markdown(*texts):
    """Union dated sections across texts, newest first; first text wins ties."""
    merged = {}
    for text in reversed(texts):  # earlier texts take precedence
        _, sections = split_sections(text)
        for heading, body in sections:
            merged[heading] = body
    preamble = ""
    for text in texts:
        candidate, _ = split_sections(text)
        if len(candidate) > len(preamble):
            preamble = candidate
    ordered = sorted(merged.items(), key=lambda kv: _date_key(kv[0]))
    return preamble + "".join(body for _, body in ordered)


def resolve_text(segments, is_jsonl):
    """Apply the union to every conflict segment; pass clean text through."""
    parts = []
    for segment in segments:
        if segment[0] == "text":
            parts.append(segment[1])
        else:
            _, ours, theirs = segment
            parts.append(
                union_jsonl(ours, theirs) if is_jsonl else union_markdown(ours, theirs)
            )
    result = "".join(parts)
    if is_jsonl:
        result = union_jsonl(result)  # keep interleaved merges ordered
    return result


def resolve_file(path, out=None):
    """Resolve conflict markers in `path`, guarding against emitting markers."""
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    if not ANY_MARKER.search(text):
        return text  # nothing to resolve
    result = resolve_text(parse_conflicts(text), path.endswith(".jsonl"))
    if ANY_MARKER.search(result):
        raise ConflictMarkersRemain(
            f"{path}: resolution still contains conflict markers; refusing to write"
        )
    if out:
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--resolve", help="a file containing conflict markers")
    parser.add_argument("--ours")
    parser.add_argument("--theirs")
    parser.add_argument("--out", help="write here instead of stdout")
    args = parser.parse_args()

    if args.resolve:
        try:
            result = resolve_file(args.resolve, args.out)
        except ConflictMarkersRemain as exc:
            print(exc, file=sys.stderr)
            return 1
        if not args.out:
            sys.stdout.write(result)
        return 0

    if not (args.ours and args.theirs):
        parser.error("provide --resolve, or both --ours and --theirs")

    with open(args.ours, encoding="utf-8") as fh:
        ours = fh.read()
    with open(args.theirs, encoding="utf-8") as fh:
        theirs = fh.read()

    is_jsonl = args.ours.endswith(".jsonl") or args.theirs.endswith(".jsonl")
    result = union_jsonl(ours, theirs) if is_jsonl else union_markdown(ours, theirs)
    if ANY_MARKER.search(result):
        print("refusing to write output containing conflict markers", file=sys.stderr)
        return 1
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(result)
    else:
        sys.stdout.write(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
