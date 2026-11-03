"""Every business node in the site's JSON-LD must share one @id.

AI engines and Google merge entity facts (address, hours, sameAs, phone) by
@id. A new page whose Plumber/Organization node lacks the shared id creates a
second, unlinked "Straight Flush" entity. This guards against that regression
(found on services/leak-detection-dana-point.html, 2026-11-03).
"""
import glob
import json
import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BUSINESS_ID = "https://straightflushplumbingoc.com/#business"
BUSINESS_NAME = "Straight Flush Plumbing & Leak Detection"
BUSINESS_TYPES = {"Plumber", "LocalBusiness", "Organization", "HomeAndConstructionBusiness"}
SKIP_DIRS = ("ai-headquarters-blueprint", "briefs", "growth-engine", "node_modules", "scripts")
LD_RE = re.compile(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', re.S | re.I)


def _nodes(node):
    if isinstance(node, list):
        for item in node:
            yield from _nodes(item)
    elif isinstance(node, dict):
        yield node
        for value in node.values():
            yield from _nodes(value)


def _pages():
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.startswith(SKIP_DIRS):
            continue
        yield rel, path


class BusinessEntityIdTest(unittest.TestCase):
    def test_business_nodes_share_one_id(self):
        problems = []
        for rel, path in _pages():
            with open(path, encoding="utf-8", errors="ignore") as fh:
                html = fh.read()
            for block in LD_RE.findall(html):
                try:
                    data = json.loads(block)
                except ValueError:
                    continue  # JSON validity is covered by other checks
                for node in _nodes(data):
                    types = node.get("@type")
                    types = set(types if isinstance(types, list) else [types])
                    is_business = types & BUSINESS_TYPES and node.get("name") == BUSINESS_NAME
                    if is_business and node.get("@id") != BUSINESS_ID:
                        problems.append(f"{rel}: {sorted(t for t in types if t)} @id={node.get('@id')!r}")
                    elif not types - {None} and "@id" in node and "straightflushplumbingoc.com/#" in node["@id"] \
                            and node["@id"] != BUSINESS_ID and node["@id"].endswith(("#organization", "#plumber")):
                        problems.append(f"{rel}: reference to retired id {node['@id']!r}")
        self.assertEqual(problems, [], "business nodes without the shared @id:\n" + "\n".join(problems))


if __name__ == "__main__":
    unittest.main()
