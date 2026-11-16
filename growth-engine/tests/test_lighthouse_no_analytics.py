"""The weekly Lighthouse audit must not send hits to GA4.

Lighthouse loads pages in a real Chrome, so the gtag tag fires unless its
requests are blocked. Before this guard, each Monday run added 12 "direct"
sessions with zero engagement to GA4 (6 URLs x 2 runs), which is a large share
of the site's real traffic and hides genuine visitors and leads.
"""
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]


class LighthouseNoAnalyticsTest(unittest.TestCase):
    def test_workflow_uses_config(self):
        wf = (ROOT / ".github/workflows/site-audits.yml").read_text()
        self.assertIn("treosh/lighthouse-ci-action", wf)
        self.assertIn("configPath: ./lighthouserc.json", wf)

    def test_config_blocks_ga4(self):
        cfg = json.loads((ROOT / "lighthouserc.json").read_text())
        patterns = cfg["ci"]["collect"]["settings"]["blockedUrlPatterns"]
        joined = " ".join(patterns)
        for host in ("googletagmanager.com", "google-analytics.com", "analytics.google.com"):
            self.assertIn(host, joined, f"{host} not blocked in lighthouserc.json")


if __name__ == "__main__":
    unittest.main()
