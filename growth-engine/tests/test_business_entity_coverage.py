"""Every indexable page must name the business in its structured data, as a Plumber.

AI answer engines often read one page on its own. A page whose JSON-LD has
only a BreadcrumbList/FAQPage gives them no machine-readable link to
Straight Flush. The 2026-11-09 audit found 10 such pages (fixed in PR #158)
and the 2026-11-12 audit found 3 more (contact, privacy, terms).

The same audit found 22 academy Articles typing the shared #business node as
Organization while every other page types it Plumber. Plumber is the more
specific, consistent signal, so every #business node must say Plumber.
"""
import glob
import json
import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BUSINESS_ID = "https://straightflushplumbingoc.com/#business"
SKIP_DIRS = ("ai-headquarters-blueprint", "briefs", "growth-engine", "node_modules", "scripts", "md")
LD_RE = re.compile(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', re.S | re.I)
NOINDEX_RE = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', re.I)

# Pages fixed on the open PR #158 branch (crew/entity-schema-2026-11-09).
# Remove each entry once #158 is merged; the test then guards them too.
PENDING_PR_158 = {
    "academy/index.html",
    "case-studies/index.html",
    "guides/leak-detection-cost.html",
    "guides/repair-vs-reroute-vs-repipe.html",
    "guides/slab-leak-repair-cost.html",
    "insurance/documentation-checklist.html",
    "insurance/does-insurance-cover-slab-leaks.html",
    "insurance/index.html",
    "insurance/questions-to-ask-your-insurer.html",
    "insurance/what-to-do-after-a-leak.html",
}


def _nodes(node):
    if isinstance(node, list):
        for item in node:
            yield from _nodes(item)
    elif isinstance(node, dict):
        yield node
        for value in node.values():
            yield from _nodes(value)


def _indexable_pages():
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        if rel.startswith(SKIP_DIRS):
            continue
        with open(path, encoding="utf-8", errors="ignore") as fh:
            html = fh.read()
        if NOINDEX_RE.search(html):
            continue
        blocks = []
        for block in LD_RE.findall(html):
            try:
                blocks.append(json.loads(block))
            except ValueError:
                continue  # JSON validity is covered by other checks
        yield rel, blocks


class BusinessEntityCoverageTest(unittest.TestCase):
    def test_every_indexable_page_references_business(self):
        missing = []
        for rel, blocks in _indexable_pages():
            if rel in PENDING_PR_158:
                continue
            ids = {n.get("@id") for n in _nodes(blocks)}
            if BUSINESS_ID not in ids:
                missing.append(rel)
        self.assertEqual(sorted(missing), [], "indexable pages whose JSON-LD never references #business")

    def test_business_node_is_typed_plumber(self):
        wrong = []
        for rel, blocks in _indexable_pages():
            for node in _nodes(blocks):
                if node.get("@id") != BUSINESS_ID or "@type" not in node:
                    continue
                types = node["@type"] if isinstance(node["@type"], list) else [node["@type"]]
                if "Plumber" not in types:
                    wrong.append(f"{rel}: {types}")
        self.assertEqual(wrong, [], "#business nodes not typed Plumber")


if __name__ == "__main__":
    unittest.main()
