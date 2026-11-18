import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts"))
import live_health_check as lhc  # noqa: E402


class RobotsParsing(unittest.TestCase):
    def test_open_robots_passes(self):
        g = lhc.parse_robots("User-agent: *\nAllow: /\nDisallow: /growth-engine/\n")
        self.assertFalse(any(lhc.bot_blocked(g, b) for b in lhc.AI_BOTS))

    def test_specific_bot_blocked(self):
        g = lhc.parse_robots("User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n")
        self.assertTrue(lhc.bot_blocked(g, "GPTBot"))
        self.assertFalse(lhc.bot_blocked(g, "ClaudeBot"))

    def test_grouped_agents_share_rules(self):
        g = lhc.parse_robots("User-agent: ClaudeBot\nUser-agent: PerplexityBot\nDisallow: /\n")
        self.assertTrue(lhc.bot_blocked(g, "ClaudeBot"))
        self.assertTrue(lhc.bot_blocked(g, "PerplexityBot"))

    def test_wildcard_block_applies_without_specific_group(self):
        g = lhc.parse_robots("User-agent: *\nDisallow: /\n\nUser-agent: Bingbot\nAllow: /\n")
        self.assertTrue(lhc.bot_blocked(g, "GPTBot"))
        self.assertFalse(lhc.bot_blocked(g, "Bingbot"))

    def test_partial_disallow_is_not_a_block(self):
        g = lhc.parse_robots("User-agent: GPTBot\nDisallow: /private/\n")
        self.assertFalse(lhc.bot_blocked(g, "GPTBot"))

    def test_live_repo_robots_is_open(self):
        path = os.path.join(os.path.dirname(__file__), "..", "..", "robots.txt")
        with open(path) as f:
            g = lhc.parse_robots(f.read())
        self.assertEqual([b for b in lhc.AI_BOTS if lhc.bot_blocked(g, b)], [])


class SecurityHeaders(unittest.TestCase):
    FULL = {
        "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
        "Content-Security-Policy": "default-src 'self'",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=()",
        "Cross-Origin-Opener-Policy": "same-origin",
    }

    def test_full_set_has_no_gaps(self):
        self.assertEqual(lhc.header_gaps(self.FULL), [])

    def test_github_pages_defaults_report_gaps(self):
        gaps = lhc.header_gaps({"Server": "GitHub.com", "Content-Type": "text/html"})
        self.assertEqual(len(gaps), len(lhc.EXPECTED_HEADERS))

    def test_wrong_value_is_reported(self):
        h = dict(self.FULL, **{"X-Frame-Options": "ALLOWALL"})
        self.assertEqual(lhc.header_gaps(h), ["X-Frame-Options unexpected value"])

    def test_expected_headers_match_repo_headers_file(self):
        path = os.path.join(os.path.dirname(__file__), "..", "..", "_headers")
        with open(path) as f:
            declared = {}
            for line in f:
                if ":" in line and line.startswith("  "):
                    k, v = line.strip().split(":", 1)
                    declared[k.strip()] = v.strip()
        for name in lhc.EXPECTED_HEADERS:
            self.assertIn(name, declared, name + " not in _headers")
        self.assertEqual(lhc.header_gaps(declared), [])


class EdgeEvidence(unittest.TestCase):
    def test_cloudflare_response_is_detected(self):
        cf, detail = lhc.edge_evidence({"Server": "cloudflare", "CF-RAY": "8f00abc-LAX",
                                        "cf-cache-status": "HIT"})
        self.assertTrue(cf)
        self.assertIn("cf-cache-status=HIT", detail)

    def test_github_pages_direct_is_not_cloudflare(self):
        cf, detail = lhc.edge_evidence({"Server": "GitHub.com",
                                        "Access-Control-Allow-Origin": "*"})
        self.assertFalse(cf)
        self.assertIn("access-control-allow-origin=*", detail)

    def test_no_headers(self):
        cf, detail = lhc.edge_evidence({})
        self.assertFalse(cf)
        self.assertIn("server=none", detail)


if __name__ == "__main__":
    unittest.main()
