"""Every areaServed place is one named, linked entity sitewide.

Before 2026-11-17 the site declared ~135 areaServed places as anonymous
City/Place nodes or bare strings, with Ladera Ranch typed City on some pages
and Place on others and Orange County named two different ways. Engines merge
by @id, so each place now has one id under service-areas.html, one name, one
type and (where Wikipedia has an article) a sameAs that pins it to the right
place -- "Orange, CA" is otherwise easy to confuse with Orange County or other
Oranges. (Added 2026-11-17 by the entity-schema shift.)
"""
import json
import os
import sys
import unittest
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from test_business_entity_id import LD_RE, _nodes, _pages  # noqa: E402

PREFIX = "https://straightflushplumbingoc.com/service-areas.html#"


def _areas():
    for rel, path in _pages():
        with open(path, encoding="utf-8") as fh:
            html = fh.read()
        for match in LD_RE.finditer(html):
            for node in _nodes(json.loads(match.group(1))):
                area = node.get("areaServed")
                # ContactPoint.areaServed ("US") is a phone-coverage hint, not a place we serve.
                if area is None or node.get("@type") == "ContactPoint":
                    continue
                for item in area if isinstance(area, list) else [area]:
                    yield rel, item


class PlaceEntityTest(unittest.TestCase):
    def test_every_area_has_place_id(self):
        bad = [(rel, item) for rel, item in _areas()
               if not isinstance(item, dict)
               or not str(item.get("@id", "")).startswith(PREFIX)]
        self.assertEqual(bad, [], "areaServed entries without a service-areas.html#<place> @id")

    def test_one_name_type_sameas_per_id(self):
        seen = defaultdict(set)
        for rel, item in _areas():
            if isinstance(item, dict) and item.get("@id"):
                seen[item["@id"]].add((item.get("@type"), item.get("name"), item.get("sameAs")))
        bad = {k: sorted(map(str, v)) for k, v in seen.items() if len(v) > 1}
        self.assertEqual(bad, {}, "same place id declared with different name/type/sameAs")


if __name__ == "__main__":
    unittest.main()
