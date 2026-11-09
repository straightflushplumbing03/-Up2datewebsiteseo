#!/usr/bin/env python3
"""Tests for scripts/gsc_noise_check.py (offline, deterministic)."""
import importlib.util
import json
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
spec = importlib.util.spec_from_file_location("gsc_noise_check", os.path.join(ROOT, "scripts", "gsc_noise_check.py"))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
SNAP = os.path.join(ROOT, "growth-engine", "data", "gsc_aa_noise_check_2026-11-09.json")


class NoiseCheckTest(unittest.TestCase):
    def test_constant_rank_has_zero_noise(self):
        rows = [["2026-10-0%d" % d, "q", 2, 10.0] for d in range(1, 8)]
        snap = {"window": ["2026-10-01", "2026-10-07"], "arms": {"a": {"rows": rows}, "c": {"rows": rows}}}
        r = mod.analyse(snap, window=7, iters=200)
        self.assertEqual(r["arms"]["a"]["null_diff_90pct"], [0.0, 0.0])
        self.assertEqual(r["did"]["p_false_supported"], 0.0)
        self.assertEqual(r["arms"]["a"]["weekly"][0]["wpos"], 10.0)

    def test_weighting_uses_impressions(self):
        rows = [["2026-10-01", "q", 3, 10.0], ["2026-10-02", "q", 1, 50.0]]
        wk = mod.weekly(rows, __import__("datetime").date(2026, 10, 1))
        self.assertEqual(wk[0]["wpos"], 20.0)
        self.assertEqual(wk[0]["share_le_20"], 0.75)

    def test_snapshot_is_deterministic_and_noisy(self):
        with open(SNAP, encoding="utf-8") as fh:
            snap = json.load(fh)
        a = mod.analyse(snap, iters=1000)
        b = mod.analyse(snap, iters=1000)
        self.assertEqual(a, b)
        # The 2026-11-05 Lake Forest read rule (A beats C by >= 5) fires on pure noise.
        self.assertGreater(a["did"]["p_false_supported"], 0.1)


if __name__ == "__main__":
    unittest.main()
