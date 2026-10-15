"""Tests for scripts/daily_measure.py.

The runner exists to keep the daily automation inside its ~32-minute platform
ceiling. These tests pin the two properties that make that work: it never raises
on a failing check, and a missing credential is recorded as BLOCKED rather than
as a zero/absent measurement.
"""
import json
import os
import sys
import tempfile
import unittest
from unittest import mock

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO_ROOT, "scripts"))

import daily_measure  # noqa: E402


class TestRunHelper(unittest.TestCase):
    def test_missing_command_is_reported_not_raised(self):
        ok, code, detail = daily_measure._run(["definitely-not-a-real-binary-xyz"])
        self.assertFalse(ok)
        self.assertEqual(code, -2)
        self.assertIn("not found", detail)

    def test_nonzero_exit_is_reported_not_raised(self):
        ok, code, _ = daily_measure._run([sys.executable, "-c", "raise SystemExit(3)"])
        self.assertFalse(ok)
        self.assertEqual(code, 3)

    def test_timeout_is_reported_not_raised(self):
        ok, code, detail = daily_measure._run(
            [sys.executable, "-c", "import time; time.sleep(5)"], timeout=1
        )
        self.assertFalse(ok)
        self.assertEqual(code, -1)
        self.assertIn("timed out", detail)


class TestVisibilityBlocked(unittest.TestCase):
    """A missing key must be BLOCKED, never recorded as zero visibility."""

    def test_no_key_is_blocked_not_zero(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            result = daily_measure.check_visibility(5)
        self.assertTrue(result["blocked"])
        self.assertFalse(result["ok"])
        self.assertNotIn("count", result)
        self.assertIn("never zero", result["note"])

    def test_platform_cased_key_is_accepted(self):
        """OpenHands injects secrets under the case the user typed."""
        with mock.patch.dict(os.environ, {"Tavily_api_key": "x"}, clear=True):
            with mock.patch.object(
                daily_measure, "_run", return_value=(True, 0, "ok")
            ) as m:
                result = daily_measure.check_visibility(5)
        self.assertFalse(result.get("blocked", False))
        self.assertTrue(result["ok"])
        self.assertEqual(m.call_count, 1)


class TestEntityConsistencyExitMeaning(unittest.TestCase):
    def test_exit_1_is_a_failure_and_keeps_its_note(self):
        with mock.patch.object(
            daily_measure, "_run", return_value=(False, 1, "REGRESSION")
        ):
            result = daily_measure.check_entity_consistency()
        self.assertFalse(result["ok"])
        self.assertEqual(result["exit_code"], 1)
        self.assertIn("never edit the external property", result["note"])


class TestSitemapIdempotency(unittest.TestCase):
    def test_clean_tree_after_refresh_is_ok(self):
        def fake_run(cmd, timeout=300):
            if cmd[0] == "git":
                return True, 0, ""
            return True, 0, "lastmod refreshed: 0 (unchanged, history unavailable: 74)"

        with mock.patch.object(daily_measure, "_run", side_effect=fake_run):
            result = daily_measure.check_sitemap_idempotent()
        self.assertTrue(result["ok"])
        self.assertEqual(result["lastmod_refreshed"], 0)
        self.assertFalse(result["sitemap_dirty"])

    def test_dirty_sitemap_is_not_ok(self):
        """A rewritten sitemap means the shallow-clone guard regressed."""

        def fake_run(cmd, timeout=300):
            if cmd[0] == "git":
                return True, 0, " M sitemap.xml"
            return True, 0, "lastmod refreshed: 74"

        with mock.patch.object(daily_measure, "_run", side_effect=fake_run):
            result = daily_measure.check_sitemap_idempotent()
        self.assertFalse(result["ok"])
        self.assertTrue(result["sitemap_dirty"])
        self.assertEqual(result["lastmod_refreshed"], 74)


class TestHistorySummary(unittest.TestCase):
    def test_counts_rows_and_picks_latest_per_platform(self):
        with tempfile.TemporaryDirectory() as tmp:
            data_dir = os.path.join(tmp, "growth-engine", "data")
            os.makedirs(data_dir)
            with open(os.path.join(data_dir, "ai_visibility_history.jsonl"), "w") as fh:
                fh.write(json.dumps({"ts": "2026-01-01T00:00:00Z", "platform": "tavily_search"}) + "\n")
                fh.write(json.dumps({"ts": "2026-01-02T00:00:00Z", "platform": "tavily_search"}) + "\n")
                fh.write(json.dumps({"ts": "2026-01-01T00:00:00Z", "platform": "perplexity"}) + "\n")
            with open(os.path.join(data_dir, "other.jsonl"), "w") as fh:
                fh.write("\n\n")

            with mock.patch.object(daily_measure, "ROOT", tmp):
                counts, latest = daily_measure.summarise_history()

        self.assertEqual(counts["ai_visibility_history.jsonl"], 3)
        self.assertEqual(counts["other.jsonl"], 0)
        self.assertEqual(latest["tavily_search"]["ts"], "2026-01-02T00:00:00Z")
        self.assertEqual(latest["perplexity"]["ts"], "2026-01-01T00:00:00Z")

    def test_missing_data_dir_does_not_raise(self):
        with mock.patch.object(daily_measure, "ROOT", "/nonexistent-xyz"):
            counts, latest = daily_measure.summarise_history()
        self.assertEqual(counts, {})
        self.assertEqual(latest, {})


if __name__ == "__main__":
    unittest.main()
