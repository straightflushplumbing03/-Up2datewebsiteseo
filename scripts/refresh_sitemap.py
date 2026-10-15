#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sitemap maintainer for straightflushplumbingoc.com (static tree).

- Ensures every indexable page (i.e., every HTML file that is NOT root-stub
  noindex-duplicate and NOT 404.html) has a <url> entry.
- Preserves each entry's existing <changefreq>/<priority> when present,
  deriving sensible defaults for additions.
- Bumps <lastmod> to today for every URL whose target file changed today
  (or whose lastmod is missing/stale-beyond-file-mtime); idempotent within a day.
- In a shallow clone git history and mtime both collapse to the clone date, so
  lastmod is refreshed ONLY for files the working tree actually modifies.
- Root stub pages (aliso-viejo.html, etc.) are intentionally EXCLUDED: they are
  noindex duplicates that canonically point at cities/*.html.

Run from project root:  python3 scripts/refresh_sitemap.py
"""
import os
import re
import subprocess
from datetime import date
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOMAIN = "https://straightflushplumbingoc.com"
TODAY = date.today().isoformat()

class Robots(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.noindex = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and a.get("name") == "robots" and "noindex" in (a.get("content") or "").lower():
            self.noindex = True

def page_indexable(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        head = fh.read(4096)
    p = Robots()
    try:
        p.feed(head)
    except Exception:
        pass
    return not p.noindex

def url_of(rel):
    # Directory-index pages (X/index.html) are published at the directory URL
    # (X/) and their canonical points there, so the sitemap must match.
    if rel == "index.html":
        return f"{DOMAIN}/"
    if rel.endswith("/index.html"):
        return f"{DOMAIN}/{rel[: -len('index.html')]}"
    return f"{DOMAIN}/{rel}"


def rel_of(loc):
    path = loc.replace(DOMAIN, "").lstrip("/")
    if path == "" or path.endswith("/"):
        return path + "index.html"
    return path

DEFAULT_FREQ = {
    "index.html": ("weekly", "1.0"),
    "404.html": None,  # never in sitemap
}
def defaults_for(rel):
    if rel in DEFAULT_FREQ and DEFAULT_FREQ[rel]:
        return DEFAULT_FREQ[rel]
    top = rel.count("/") == 0
    if top:
        return ("monthly", "0.9")
    if rel.startswith("services/") or rel.startswith("guides/"):
        return ("monthly", "0.8")
    if rel.startswith("cities/") or rel.startswith("insurance/"):
        return ("monthly", "0.7")
    if rel.startswith("academy/") or rel.startswith("case-studies/"):
        return ("monthly", "0.6")
    return ("monthly", "0.6")

def main():
    sm_path = os.path.join(ROOT, "sitemap.xml")
    with open(sm_path, encoding="utf-8") as fh:
        sm = fh.read()

    # collect filesystem pages
    pages = {}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d not in ("node_modules",)]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            pages[rel] = full

    indexable = {rel for rel in pages if rel != "404.html" and page_indexable(pages[rel])}
    excluded = sorted(set(pages) - indexable)
    print(f"indexable pages: {len(indexable)}  (excluded noindex/404: {len(excluded)})")

    # parse existing sitemap
    entries = {}  # rel -> full url block
    for m in re.finditer(r"  <url>\n(.*?)  </url>\n", sm, re.S):
        block = m.group(0)
        loc = re.search(r"<loc>(.*?)</loc>", block).group(1)
        entries[rel_of(loc)] = block

    existing = set(entries)
    to_add = sorted(indexable - existing)
    to_remove = sorted(existing - indexable)
    print(f"to add: {len(to_add)}  {to_add}")
    print(f"to remove: {len(to_remove)}  {to_remove}")

    # drop entries that must not be listed (noindex stubs, 404, trailing-slash variants)
    for rel in to_remove:
        entries.pop(rel, None)

    # add missing entries
    for rel in to_add:
        freq, pri = defaults_for(rel)
        entries[rel] = (
            f"  <url>\n    <loc>{url_of(rel)}</loc>\n"
            f"    <lastmod>{TODAY}</lastmod>\n"
            f"    <changefreq>{freq}</changefreq>\n"
            f"    <priority>{pri}</priority>\n  </url>\n"
        )

    # refresh lastmod: prefer the file's last git commit date (authoritative,
    # and stable in a fresh clone).
    def last_commit_date(rel):
        try:
            out = subprocess.run(
                ["git", "log", "-1", "--format=%cs", "--", rel],
                cwd=ROOT, capture_output=True, text=True, timeout=10,
            )
            d = out.stdout.strip()
            if d:
                return d
        except Exception:
            pass
        return None

    # In a shallow clone git history is grafted at the fetch boundary, so `git
    # log` reports the same date for every path and says nothing about when a
    # given file actually changed. Stamping that value would mark the whole
    # sitemap as freshly edited on every run. Fall back to the filesystem mtime
    # only for files the working tree genuinely modified.
    shallow = subprocess.run(
        ["git", "rev-parse", "--is-shallow-repository"],
        cwd=ROOT, capture_output=True, text=True, timeout=10,
    ).stdout.strip() == "true"

    def working_tree_changed(rel):
        out = subprocess.run(
            ["git", "status", "--porcelain", "--", rel],
            cwd=ROOT, capture_output=True, text=True, timeout=10,
        )
        return bool(out.stdout.strip())

    bumped = 0
    skipped_unknown = 0
    for rel, block in entries.items():
        stamp = last_commit_date(rel)
        if shallow:
            if not working_tree_changed(rel):
                skipped_unknown += 1
                continue
            stamp = None
        if stamp is None:
            stamp = date.fromtimestamp(
                os.path.getmtime(os.path.join(ROOT, rel))).isoformat()
        lm = re.search(r"<lastmod>(.*?)</lastmod>", block)
        current = lm.group(1) if lm else ""
        if not lm or current < stamp:
            block = re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{stamp}</lastmod>", block)
            entries[rel] = block
            bumped += 1
    print(f"lastmod refreshed: {bumped}"
          + (f"  (unchanged, history unavailable: {skipped_unknown})" if shallow else ""))

    # rebuild sitemap: homepage first, then top-level, then sections alphabetically
    def sort_key(rel):
        depth = rel.count("/")
        is_index = rel.endswith("index.html")
        return (0 if rel == "index.html" else 1, depth, not is_index, rel)

    ordered = sorted(entries, key=sort_key)
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n']
    for rel in ordered:
        out.append(entries[rel])
    out.append("</urlset>\n")
    with open(sm_path, "w", encoding="utf-8") as fh:
        fh.write("".join(out))

    # verification
    with open(sm_path, encoding="utf-8") as fh:
        final = fh.read()
    final_rels = set()
    for m in re.finditer(r"<loc>(.*?)</loc>", final):
        final_rels.add(rel_of(m.group(1)))
    missing = sorted(indexable - final_rels)
    extra = sorted(final_rels - indexable)
    print(f"VERIFY -> sitemap URLs: {len(final_rels)}  missing: {missing}  extra: {extra}")
    if missing or extra:
        raise SystemExit(1)
    print("Sitemap is in sync with the indexable page set.")

if __name__ == "__main__":
    main()
