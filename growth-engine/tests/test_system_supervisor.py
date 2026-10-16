#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tests for scripts/system_supervisor.py.

Only the pure, deterministic helpers are tested — the HTTP checks are exercised
by running the script. No network, no API keys.

Run:  python3 -m unittest discover -s growth-engine/tests -v
"""
import importlib.util
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SS_PATH = os.path.join(ROOT, "scripts", "system_supervisor.py")

spec = importlib.util.spec_from_file_location("system_supervisor", SS_PATH)
SS = importlib.util.module_from_spec(spec)
sys.modules["system_supervisor"] = SS
spec.loader.exec_module(SS)


class TestParseNumstat(unittest.TestCase):
    def test_counts_files_and_html_additions(self):
        text = "\n".join([
            "abcdef0123456789abcdef0123456789abcdef01",
            "10\t2\tindex.html",
            "5\t0\tgrowth-engine/KNOWN_ISSUES.md",
            "0\t0\treports/daily/2026-10-16.md",
        ])
        files, pages = SS._parse_numstat(text)
        self.assertEqual(files, 3)
        self.assertEqual(pages, 1)  # only index.html is HTML with additions

    def test_binary_files_are_counted_but_not_additions(self):
        text = "hash\n-\t-\tassets/img/photo.jpg\n3\t0\tservices/leak-detection.html"
        files, pages = SS._parse_numstat(text)
        self.assertEqual(files, 2)
        self.assertEqual(pages, 1)

    def test_empty_input(self):
        self.assertEqual(SS._parse_numstat(""), (0, 0))

    def test_html_with_zero_added_lines_is_not_a_new_page(self):
        text = "hash\n0\t0\tindex.html"
        _, pages = SS._parse_numstat(text)
        self.assertEqual(pages, 0)


class TestUnexpectedBranches(unittest.TestCase):
    def test_known_prefixes_are_allowed(self):
        branches = ["main", "intelligence-hq/daily-2026-10-16",
                    "technical-seo/2026-10-15-audit-fixes", "tests/seo-audit-parser-coverage",
                    "fix/automation-deploy-contract"]
        self.assertEqual(SS._unexpected_from(branches), [])

    def test_unknown_branch_is_flagged(self):
        branches = ["main", "some-random-agent-branch"]
        self.assertEqual(SS._unexpected_from(branches), ["some-random-agent-branch"])

    def test_main_is_never_unexpected(self):
        self.assertEqual(SS._unexpected_from(["main"]), [])


class TestBudgetConstants(unittest.TestCase):
    def test_thresholds_are_positive(self):
        self.assertGreater(SS.MAX_OPEN_PRS, 0)
        self.assertGreater(SS.MAX_CHANGED_FILES, 0)
        self.assertGreater(SS.MAX_PAGES_ADDED, 0)

    def test_expected_schedule_is_mon_wed_fri(self):
        self.assertEqual(SS.EXPECTED_SCHEDULE, "0 6 * * 1,3,5")

    def test_daily_automation_id_is_the_live_one(self):
        self.assertEqual(SS.DAILY_AUTOMATION, "1485d659-8663-4776-a507-db0fefed8483")


if __name__ == "__main__":
    unittest.main()
