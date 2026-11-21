"""Owner and service-area nodes must be unambiguous for AI engines.

- Every Person node named "Lance" shares one @id, so the owner is one entity
  across the homepage founder, article authors and the about page.
- Every multi-city areaServed list names cities with their state ("Orange, CA"),
  because a bare "Orange" or "Irvine" matches places in other states/countries.
(Added 2026-11-05 by the entity-schema shift.)
- Every named #business node says where the business is (Laguna Niguel, CA)
  and carries its phone. Other California companies share the name
  "Straight Flush Plumbing" (Eureka, Pleasant Hill), and search tools return
  them for our own domain. An engine reading one page on its own must not be
  able to confuse us with them. (Added 2026-11-16.)
"""
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from test_business_entity_id import LD_RE, _nodes, _pages  # noqa: E402

LANCE_ID = "https://straightflushplumbingoc.com/#lance"
BUSINESS_ID = "https://straightflushplumbingoc.com/#business"
PHONE_DIGITS = "19493746524"


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

    def test_business_nodes_carry_locality_and_phone(self):
        bad = []
        for rel, n in _all_nodes():
            if n.get("@id") != BUSINESS_ID or "name" not in n:
                continue
            addr = n.get("address") or {}
            phone = "".join(ch for ch in str(n.get("telephone", "")) if ch.isdigit())
            if (addr.get("addressLocality") != "Laguna Niguel"
                    or addr.get("addressRegion") != "CA"
                    or phone != PHONE_DIGITS):
                bad.append(rel)
        self.assertEqual(sorted(set(bad)), [],
                         "#business nodes without Laguna Niguel, CA + phone")

    def test_homepage_declares_disambiguating_description(self):
        nodes = [n for rel, n in _all_nodes()
                 if rel == "index.html" and n.get("@id") == BUSINESS_ID
                 and n.get("disambiguatingDescription")]
        self.assertTrue(nodes, "homepage #business needs disambiguatingDescription")
        text = nodes[0]["disambiguatingDescription"]
        for needed in ("Laguna Niguel", "(949) 374-6524"):
            self.assertIn(needed, text)


if __name__ == "__main__":
    unittest.main()
