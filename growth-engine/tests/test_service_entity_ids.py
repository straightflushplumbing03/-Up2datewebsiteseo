"""The six core services must be one entity each, wherever they are named.

City pages, case studies, the homepage and the services hub each list the six
core services in an OfferCatalog / makesOffer. Before 2026-11-13 none of those
Service nodes had an @id, so engines saw ~270 unconnected "Leak Detection",
"PEX Repiping", ... nodes with no link to the page that describes the service.

Each core service now has one @id, `<service hub url>#service`, declared on the
hub page's own Service block and referenced (with the same url) by every
catalog entry that names it. This test keeps it that way:

1. each hub page declares its Service with the shared @id and its canonical url;
2. any Service node whose name is a core-service name carries that @id;
3. every @id ending in "/services/<hub>.html#service" points to a real hub.
"""
import glob
import json
import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BASE = "https://straightflushplumbingoc.com/services/"
HUBS = {
    "leak-detection": {"Leak Detection", "Acoustic & Electronic Leak Detection"},
    "slab-leak-detection": {"Slab Leak Detection"},
    "pex-repiping": {"PEX Repiping", "Whole-House PEX Repiping"},
    "water-heater-services": {"Water Heater Services"},
    "drain-services": {"Drain Services", "Drain Cleaning"},
    "plumbing-repair": {"Plumbing Repair", "General Plumbing Repair"},
}
NAME_TO_HUB = {n: h for h, names in HUBS.items() for n in names}
SKIP_DIRS = ("ai-headquarters-blueprint", "briefs", "growth-engine", "node_modules", "scripts", "geo-lab", "md")
LD_RE = re.compile(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', re.S | re.I)
NOINDEX_RE = re.compile(r'<meta[^>]+name="robots"[^>]+noindex', re.I)


def _nodes(node):
    if isinstance(node, list):
        for item in node:
            yield from _nodes(item)
    elif isinstance(node, dict):
        yield node
        for value in node.values():
            yield from _nodes(value)


def _ld(path):
    with open(path, encoding="utf-8") as fh:
        html = fh.read()
    if NOINDEX_RE.search(html):
        return []
    return [json.loads(m.group(1)) for m in LD_RE.finditer(html)]


def _pages():
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.startswith(SKIP_DIRS):
            continue
        yield rel, path


def _hub_id(hub):
    return f"{BASE}{hub}.html#service"


class ServiceEntityIdTest(unittest.TestCase):
    def test_hub_pages_declare_their_service_id(self):
        for hub in HUBS:
            path = os.path.join(ROOT, "services", f"{hub}.html")
            services = [n for b in _ld(path) for n in _nodes(b) if n.get("@type") == "Service"]
            ids = [n for n in services if n.get("@id") == _hub_id(hub)]
            self.assertTrue(ids, f"services/{hub}.html: no Service with @id {_hub_id(hub)}")
            self.assertEqual(ids[0].get("url"), f"{BASE}{hub}.html", hub)
            self.assertIn("provider", ids[0], f"{hub}: hub Service lost its provider")

    def test_core_service_names_reference_hub_id(self):
        missing = []
        for rel, path in _pages():
            for block in _ld(path):
                for node in _nodes(block):
                    if node.get("@type") != "Service":
                        continue
                    hub = NAME_TO_HUB.get(node.get("name"))
                    if hub and node.get("@id") != _hub_id(hub):
                        missing.append(f"{rel}: {node.get('name')!r} -> {node.get('@id')}")
        self.assertEqual(missing, [], "core Service nodes without the shared @id:\n" + "\n".join(missing))

    def test_service_ids_point_to_real_hubs(self):
        bad = []
        for rel, path in _pages():
            for block in _ld(path):
                for node in _nodes(block):
                    sid = node.get("@id", "")
                    if isinstance(sid, str) and sid.startswith(BASE) and sid.endswith("#service"):
                        hub = sid[len(BASE):-len(".html#service")]
                        if hub not in HUBS:
                            bad.append(f"{rel}: {sid}")
        self.assertEqual(bad, [])


if __name__ == "__main__":
    unittest.main()
