#!/usr/bin/env python3
"""Guard: a link to cities/<slug>.html must not be labelled with a different city.

Caught 2026-11-15: the new Mission Viejo water heater page's footer linked
cities/san-clemente.html with the text "Mission Viejo" (a find-and-replace
slip), so the footer listed Mission Viejo twice and San Clemente not at all.
"""
import glob
import os
import re
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LINK = re.compile(r'<a href="[^"]*cities/([a-z-]+)\.html">([^<]+)</a>')


def city_slugs():
    return {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(REPO_ROOT, "cities", "*.html"))}


def slugify(text):
    return re.sub(r"[^a-z]+", "-", text.lower()).strip("-")


class TestCityLinkLabels(unittest.TestCase):
    def test_city_named_link_matches_target(self):
        slugs = city_slugs()
        bad = []
        for path in glob.glob(os.path.join(REPO_ROOT, "**", "*.html"), recursive=True):
            with open(path, encoding="utf-8", errors="ignore") as fh:
                html = fh.read()
            for href, text in LINK.findall(html):
                label = slugify(text)
                # Only judge labels that are exactly another city's name.
                if label in slugs and label != href:
                    bad.append(f"{os.path.relpath(path, REPO_ROOT)}: cities/{href}.html labelled '{text}'")
        self.assertEqual(bad, [], "City links labelled with the wrong city:\n" + "\n".join(bad))


if __name__ == "__main__":
    unittest.main()
