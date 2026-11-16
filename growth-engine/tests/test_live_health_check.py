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


if __name__ == "__main__":
    unittest.main()
