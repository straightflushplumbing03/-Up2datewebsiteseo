#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regression tests for build_payload.py.

The bug this guards: build_payload.py hardcoded the cron `0 6 * * *`, so
re-running it after the schedule moved to Mon/Wed/Fri would silently recreate
the job on the old daily schedule. The schedule must be read from the prompt
source of truth, not restated in the builder.

No network access required.

Run:  python3 -m unittest discover -s growth-engine/tests -v
"""
import importlib.util
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BP_PATH = os.path.join(ROOT, "ai-headquarters-blueprint", "build_payload.py")
PROMPT_PATH = os.path.join(ROOT, "ai-headquarters-blueprint",
                           "01-MASTER-AGENT-PROMPT.md")

spec = importlib.util.spec_from_file_location("build_payload", BP_PATH)
BP = importlib.util.module_from_spec(spec)
spec.loader.exec_module(BP)


def _prompt_text():
    with open(PROMPT_PATH, encoding="utf-8") as fh:
        return fh.read()


class TestScheduleDerivation(unittest.TestCase):
    def test_real_source_yields_mon_wed_fri(self):
        payload = BP.build_payload(_prompt_text())
        self.assertEqual(payload["trigger"]["schedule"], "0 6 * * 1,3,5")
        self.assertEqual(payload["trigger"]["timezone"], "America/Los_Angeles")

    def test_schedule_is_not_hardcoded(self):
        """A changed schedule line in the source must flow through to the payload."""
        text = _prompt_text().replace(
            "automation's cron, not a file inside the repo: `0 6 * * 1,3,5`",
            "automation's cron, not a file inside the repo: `15 7 * * 2`",
        )
        payload = BP.build_payload(text)
        self.assertEqual(payload["trigger"]["schedule"], "15 7 * * 2")

    def test_missing_schedule_line_raises(self):
        with self.assertRaises(ValueError):
            BP.build_payload("## THE PROMPT\n\nbody\n\n## END OF PROMPT\n")

    def test_timeout_is_capped_value(self):
        payload = BP.build_payload(_prompt_text())
        self.assertEqual(payload["timeout"], 1800)

    def test_both_repos_attached(self):
        payload = BP.build_payload(_prompt_text())
        urls = [r["url"] for r in payload["repos"]]
        self.assertIn("https://github.com/straightflushplumbing03/AI-Headquarters", urls)
        self.assertIn("https://github.com/straightflushplumbing03/-Up2datewebsiteseo", urls)

    def test_prompt_extracted_and_nonempty(self):
        payload = BP.build_payload(_prompt_text())
        self.assertGreater(len(payload["prompt"]), 10000)


if __name__ == "__main__":
    unittest.main()
