#!/usr/bin/env python3
"""Tests for scripts/claude_naming_paths.py (offline, deterministic)."""
import importlib.util
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
spec = importlib.util.spec_from_file_location("claude_naming_paths", os.path.join(ROOT, "scripts", "claude_naming_paths.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class NamingPathsTest(unittest.TestCase):
    def test_own_site_wins_over_directory(self):
        urls = ["https://www.angi.com/companylist/zoom-drain.htm", "https://www.zoomdrain.com/oc/"]
        self.assertEqual(mod.classify("Zoom Drain", urls), ("own_site", None))

    def test_directory_only(self):
        urls = ["https://homeguide.com/ca/laguna-niguel/plumbers/nick-allen-plumbing-x1"]
        self.assertEqual(mod.classify("Nick Allen Plumbing", urls), ("directory", "homeguide"))

    def test_unmatched(self):
        self.assertEqual(mod.classify("Leak Busters", ["https://example.org/x"]), ("unmatched", None))

    def test_our_domain_counted(self):
        rows = [{"ts": "2026-11-13T00:00:00Z", "sf_status": "cited", "businesses_named": [],
                 "cited_urls": ["https://straightflushplumbingoc.com/services/leak-detection"]}]
        r = mod.analyse(rows)
        self.assertEqual(r["observations_citing_our_domain"], 1)
        self.assertEqual(r["observations_naming_straight_flush"], 1)


if __name__ == "__main__":
    unittest.main()
