#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Correct extensionless URLs across the site.

GitHub Pages (the origin host) does NOT resolve extensionless paths:
/about 404s while /about.html works (directory indexes like /academy/ do work).
The sitemap, canonical tags, og:url, JSON-LD @id/item URLs, and a set of
internal links were written extensionless, so crawlers hit 404s.

This script rewrites, in every HTML file:
  1. Absolute site URLs (https://straightflushplumbingoc.com/x) whose final
     path segment has no extension and no trailing slash  ->  append .html
  2. Absolute-path internal links (href="/x")  ->  depth-correct relative
     link with .html appended
  3. Relative internal links (href="./x" or href="x") with no extension and
     no trailing slash  ->  append .html

Skipped on purpose: tel:, mailto:, data:, fragments (#...), external domains,
URLs with a query string, and anything already carrying a file extension or
trailing slash. Idempotent by construction.
"""
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SITE = "https://straightflushplumbingoc.com"
SKIP_EXT = (".html", ".jpg", ".jpeg", ".png", ".xml", ".txt", ".css", ".js",
            ".webp", ".svg", ".ico", ".pdf", ".json", ".webmanifest")


def needs_html(path_part):
    """True if the final segment of a URL path should get .html appended."""
    if not path_part or path_part.endswith("/"):
        return False
    last = path_part.rstrip("/").rsplit("/", 1)[-1]
    if "." in last or last.startswith("#"):
        return False
    return True


def iter_pages():
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in (".git", ".git-2", "scripts")]
        for f in files:
            if f.endswith(".html") or f in ("sitemap.xml", "llms.txt"):
                yield os.path.join(base, f)


def fix_src(src, page_dir_rel):
    depth = 0 if page_dir_rel == "." else page_dir_rel.count("/") + 1
    prefix = "../" * depth

    # 1) Absolute site URLs in any attribute or JSON string.
    def abs_site(m):
        path = m.group(1)
        if "?" in path or "#" in path or not needs_html(path):
            return m.group(0)
        return f"{SITE}/{path}.html"
    src = re.sub(re.escape(SITE) + r"/([^\s\"'<>\)]+)", abs_site, src)

    # 2) Absolute-path internal links -> depth-correct relative + .html.
    def abs_path(m):
        path = m.group(1)
        if "?" in path or not needs_html(path):
            return m.group(0)
        if path.endswith("/"):
            return m.group(0)  # directory index, works as-is
        return f'href="{prefix}{path.lstrip("/")}.html"'
    src = re.sub(r'href="/([^"/][^"]*)"', abs_path, src)

    # 3) Relative extensionless links -> append .html.
    def rel(m):
        attr, path = m.group(1), m.group(2)
        if "?" in path or "#" in path.split(".html")[0]:
            return m.group(0)
        if not needs_html(path):
            return m.group(0)
        return f'{attr}="{path}.html"'
    src = re.sub(r'(href|src)="((?:\./)?[^":/][^":]*)"', rel, src)

    return src


def main():
    changed = 0
    for path in iter_pages():
        rel = os.path.relpath(os.path.dirname(path), ROOT)
        with open(path, "r", encoding="utf-8", newline="") as fh:
            src = fh.read()
        out = fix_src(src, "." if rel == "." else rel)
        if out != src:
            with open(path, "w", encoding="utf-8", newline="") as fh:
                fh.write(out)
            changed += 1
    print(f"URL corrections applied to {changed} page(s).")


if __name__ == "__main__":
    main()
