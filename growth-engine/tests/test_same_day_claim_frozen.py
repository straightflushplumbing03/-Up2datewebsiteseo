#!/usr/bin/env python3
"""Guard: stop the unapproved "same-day" response-time claim from spreading.

"Same-day appointments are often available" (and close variants such as
"same-day diagnosis" and "we usually respond same day") is a response-time
claim. growth-engine/APPROVED_CLAIMS.md does not list it, and the crew has
flagged it since 2026-11-13. It still spread as new pages copied the footer
of older ones: 25 pages on 2026-11-13, 32 pages on 2026-11-15.

This test does not remove the existing wording (that is the owner's call).
It freezes the set of pages that already carry it, so a NEW page cannot add
it. When the owner confirms or retires the claim:
  - confirmed: record it in APPROVED_CLAIMS.md and delete this test;
  - retired: remove the wording and shrink KNOWN_PAGES to match.
"""
import glob
import os
import re
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLAIM = re.compile(r"same[- ]day (appointments?|diagnosis|repair|service)|respond same day", re.I)

# Pages that carried the claim on main as of 2026-11-15 (before this guard).
KNOWN_PAGES = {
    "cities/aliso-viejo.html",
    "cities/costa-mesa.html",
    "cities/coto-de-caza.html",
    "cities/dana-point.html",
    "cities/dove-canyon.html",
    "cities/foothill-ranch.html",
    "cities/huntington-beach.html",
    "cities/irvine.html",
    "cities/ladera-ranch.html",
    "cities/laguna-beach.html",
    "cities/laguna-hills.html",
    "cities/laguna-niguel.html",
    "cities/laguna-woods.html",
    "cities/lake-forest.html",
    "cities/mission-viejo.html",
    "cities/newport-beach.html",
    "cities/orange.html",
    "cities/rancho-santa-margarita.html",
    "cities/san-clemente.html",
    "cities/san-juan-capistrano.html",
    "cities/tustin.html",
    "contact.html",
    "index.html",
    "services/leak-detection-laguna-beach.html",
    "services/slab-leak-detection-dana-point.html",
    "services/slab-leak-detection-laguna-niguel.html",
    "services/slab-leak-detection-mission-viejo.html",
    "services/water-heater-repair-dana-point.html",
    "services/water-heater-repair-laguna-niguel.html",
    "services/water-heater-repair-mission-viejo.html",
    "services/water-heater-repair-san-clemente.html",
    "water-heater-services.html",
}


def pages_with_claim():
    found = set()
    for path in glob.glob(os.path.join(REPO_ROOT, "**", "*.html"), recursive=True):
        with open(path, encoding="utf-8", errors="ignore") as fh:
            if CLAIM.search(fh.read()):
                found.add(os.path.relpath(path, REPO_ROOT).replace(os.sep, "/"))
    return found


class TestSameDayClaimFrozen(unittest.TestCase):
    def test_no_new_pages_with_same_day_claim(self):
        new = sorted(pages_with_claim() - KNOWN_PAGES)
        self.assertEqual(
            new, [],
            "Unapproved 'same-day' response-time claim added to new page(s); "
            "it is not in APPROVED_CLAIMS.md:\n" + "\n".join(new),
        )


if __name__ == "__main__":
    unittest.main()
