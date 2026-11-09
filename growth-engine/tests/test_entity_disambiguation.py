"""Owner and service-area nodes must be unambiguous for AI engines.

- Every Person node named "Lance" shares one @id, so the owner is one entity
  across the homepage founder, article authors and the about page.
- Every multi-city areaServed list names cities with their state ("Orange, CA"),
  because a bare "Orange" or "Irvine" matches places in other states/countries.
(Added 2026-11-05 by the entity-schema shift.)
"""
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from test_business_entity_id import LD_RE, _nodes, _pages  # noqa: E402

LANCE_ID = "https://straightflushplumbingoc.com/#lance"


def _all_nodes():
    for rel, path in _pages():
        with open(path, encoding="utf-8") as fh:
            html = fh.read()
        for match in LD_RE.finditer(html):
            for node in _nodes(json.loads(match.group(1))):
                yield rel, node


class EntityDisambiguationTest(unittest.TestCase):
    def test_lance_person_nodes_share_id(self):
        bad = [rel for rel, n in _all_nodes()
               if n.get("@type") == "Person" and n.get("name") == "Lance"
               and n.get("@id") != LANCE_ID]
        self.assertEqual(bad, [], "Person 'Lance' nodes missing %s" % LANCE_ID)

    def test_about_page_declares_owner(self):
        ids = {n.get("@id") for rel, n in _all_nodes() if rel == "about.html"}
        self.assertIn(LANCE_ID, ids)

    def test_city_lists_include_state(self):
        bad = []
        for rel, n in _all_nodes():
            area = n.get("areaServed")
            if not isinstance(area, list) or len(area) < 2:
                continue
            for item in area:
                name = item.get("name") if isinstance(item, dict) else item
                if isinstance(name, str) and not name.endswith(", CA"):
                    bad.append((rel, name))
        self.assertEqual(bad, [], "areaServed cities without state")


if __name__ == "__main__":
    unittest.main()
