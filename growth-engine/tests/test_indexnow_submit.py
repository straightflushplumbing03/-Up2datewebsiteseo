import json
import os
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import indexnow_submit as ix  # noqa: E402


class IndexNowTests(unittest.TestCase):
    def test_key_file_present_and_valid(self):
        key = ix.find_key()
        self.assertIsNotNone(key, "root <key>.txt missing")
        self.assertRegex(key, r"^[A-Za-z0-9-]{8,128}$")

    def test_arms_are_disjoint_balanced_and_in_sitemap(self):
        with open(ix.ARMS_FILE, encoding="utf-8") as fh:
            arms = json.load(fh)["arms"]
        t, h = set(arms["treatment"]), set(arms["holdout"])
        self.assertFalse(t & h)
        self.assertEqual(len(t), len(h))
        sm = ix.sitemap_urls()
        for p in t | h:
            self.assertIn(ix.DOMAIN + "/" + p, sm)

    def test_payload_rejects_foreign_host(self):
        with self.assertRaises(ValueError):
            ix.build_payload(["https://example.com/x"], "abcdef12")

    def test_payload_shape(self):
        p = ix.build_payload([ix.DOMAIN + "/cities/irvine.html"], "abcdef12")
        self.assertEqual(p["keyLocation"], ix.DOMAIN + "/abcdef12.txt")
        self.assertEqual(p["host"], ix.HOST)

    def test_sitemap_has_no_duplicate_locs(self):
        import re
        with open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8") as fh:
            locs = re.findall(r"<loc>([^<]+)</loc>", fh.read())
        self.assertEqual(len(locs), len(set(locs)))


if __name__ == "__main__":
    unittest.main()
