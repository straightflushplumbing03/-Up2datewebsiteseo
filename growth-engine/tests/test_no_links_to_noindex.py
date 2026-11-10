"""Indexable pages must not link to noindex pages.

The root-level .html files (e.g. /copper-vs-pex-pipes.html) are
`noindex, nofollow` stubs kept only so old extensionless URLs still resolve.
The real pages live in /academy/, /guides/, /cities/, /services/ and so on.

On 2026-11-10 three in-body links on indexable pages pointed at stubs
(two PEX city-service pages -> /copper-vs-pex-pipes.html, and the San Clemente
FAQ -> /repair-vs-reroute-vs-repipe.html). A crawler following them lands on
a noindex, nofollow page and passes nothing on to the canonical article.
This test fails if any indexable page links to a noindex page again.

Allowed: the company profile page, which is noindex,follow by decision
(growth-engine/KNOWN_ISSUES.md ISSUE-013), and thank-you/404.
"""

import glob
import os
import posixpath
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SKIP = ("ai-headquarters-blueprint", "briefs", "md", "growth-engine", "scripts", "geo-lab")
ALLOWED = {"about/straight-flush-plumbing-orange-county.html", "thank-you.html", "404.html"}
ROBOTS_NOINDEX = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]*noindex', re.I)
HREF = re.compile(r'<a\s[^>]*?href=["\']([^"\']+)', re.I)
SCRIPT = re.compile(r"<script.*?</script>", re.S | re.I)
SITE = "straightflushplumbingoc.com"


def _pages():
    out = {}
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        if rel.split("/")[0] in SKIP:
            continue
        with open(path, encoding="utf-8", errors="ignore") as fh:
            out[rel] = fh.read()
    return out


def _resolve(src, href):
    u = href.split("#")[0].split("?")[0]
    if not u or u.startswith(("tel:", "mailto:", "sms:", "javascript:")):
        return None
    if u.startswith(("http://", "https://", "//")):
        if SITE not in u:
            return None
        u = "/" + u.split(SITE, 1)[1].lstrip("/")
    p = u.lstrip("/") if u.startswith("/") else posixpath.normpath(posixpath.join(posixpath.dirname(src), u))
    if p in ("", "."):
        return "index.html"
    if p.endswith("/") or os.path.isdir(os.path.join(ROOT, p)):
        return p.rstrip("/") + "/index.html"
    if not p.endswith(".html") and not os.path.exists(os.path.join(ROOT, p)):
        p += ".html"
    return p


def links_to_noindex():
    pages = _pages()
    noindex = {p for p, h in pages.items() if ROBOTS_NOINDEX.search(h)}
    bad = []
    for src, html in sorted(pages.items()):
        if src in noindex:
            continue
        for href in HREF.findall(SCRIPT.sub("", html)):
            tgt = _resolve(src, href)
            if tgt in noindex and tgt not in ALLOWED:
                bad.append(f"{src} -> {href}")
    return bad


class NoLinksToNoindex(unittest.TestCase):
    def test_indexable_pages_do_not_link_to_noindex_stubs(self):
        bad = links_to_noindex()
        self.assertEqual(bad, [], "indexable pages linking to noindex pages:\n" + "\n".join(bad))


if __name__ == "__main__":
    unittest.main()
