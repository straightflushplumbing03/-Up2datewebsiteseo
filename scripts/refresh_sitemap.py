#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sitemap maintainer for straightflushplumbingoc.com (static tree).

- Ensures every indexable page (i.e., every HTML file that is NOT root-stub
  noindex-duplicate and NOT 404.html) has a <url> entry.
- Preserves each entry's existing <changefreq>/<priority> when present,
  deriving sensible defaults for additions.
- Bumps <lastmod> to the file's last git commit date (a real, verifiable
  signal) — falling back to the file mtime when the file is untracked or git is
  unavailable. Idempotent within a day.
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


_git_dates = {}

def _git_lastcommit():
    """rel path -> YYYY-MM-DD of its last commit on HEAD. Empty if git absent."""
    if _git_dates:
        return _git_dates
    try:
        out = subprocess.run(
            ["git", "-C", ROOT, "log", "--format=%cI", "--name-only", "HEAD", "--", "."],
            capture_output=True, text=True, timeout=120,
        ).stdout
    except Exception:
        return _git_dates
    # Walk commits newest-first, recording the first (newest) date each path appears.
    result = {}
    cur_date = None
    for line in out.splitlines():
        line = line.strip()
        if not line:
            continue
        if re.match(r"^\d{4}-\d{2}-\d{2}T", line):
            cur_date = line[:10]
        elif cur_date:
            result.setdefault(line, cur_date)
    _git_dates.update(result)
    return _git_dates


def file_lastmod_date(rel, full):
    git = _git_lastcommit().get(rel)
    if git:
        return git
    return date.fromtimestamp(os.path.getmtime(full)).isoformat()

def url_of(rel):
    # A section index is served at its canonical trailing-slash URL
    # (e.g. services/index.html canonicalizes to /services/), so emit that form.
    if rel == "index.html":
        return f"{DOMAIN}/"
    if rel.endswith("/index.html"):
        return f"{DOMAIN}/{rel[:-len('index.html')]}"
    return f"{DOMAIN}/{rel}"

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
        path = loc.replace(DOMAIN, "").lstrip("/")
        if path == "":
            rel = "index.html"
        elif path.endswith("/"):
            rel = path + "index.html"
        else:
            rel = path
        entries[rel] = block

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

    # refresh lastmod: set to the file's real last-commit date (or mtime fallback)
    bumped = 0
    for rel, block in entries.items():
        fpath = os.path.join(ROOT, rel)
        target = file_lastmod_date(rel, fpath)
        lm = re.search(r"<lastmod>(.*?)</lastmod>", block)
        current = lm.group(1) if lm else ""
        if not lm or current != target:
            block = re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{target}</lastmod>", block)
            entries[rel] = block
            bumped += 1
    print(f"lastmod refreshed: {bumped}")

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
        path = m.group(1).replace(DOMAIN, "").lstrip("/")
        if path == "":
            final_rels.add("index.html")
        elif path.endswith("/"):
            final_rels.add(path + "index.html")
        else:
            final_rels.add(path)
    missing = sorted(indexable - final_rels)
    extra = sorted(final_rels - indexable)
    print(f"VERIFY -> sitemap URLs: {len(final_rels)}  missing: {missing}  extra: {extra}")
    if missing or extra:
        raise SystemExit(1)
    print("Sitemap is in sync with the indexable page set.")

if __name__ == "__main__":
    main()
