"""robots.txt must keep every internal (non-customer) top-level folder out of crawls.

GitHub Pages serves the whole repository, so any tooling folder added at the repo
root (e.g. geo-lab/, merged in PR #140) is publicly fetchable. robots.txt is the
signal that keeps search and AI crawlers from learning the business from it.
"""
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INTERNAL_DIRS = ("growth-engine", "briefs", "ai-headquarters-blueprint", "geo-lab", "scripts")


class RobotsInternalDirsTest(unittest.TestCase):
    def setUp(self):
        with open(os.path.join(ROOT, "robots.txt"), encoding="utf-8") as fh:
            self.rules = {line.split(":", 1)[1].strip()
                          for line in fh
                          if line.strip().lower().startswith("disallow:")}

    def test_internal_dirs_disallowed(self):
        for d in INTERNAL_DIRS:
            if os.path.isdir(os.path.join(ROOT, d)):
                self.assertIn(f"/{d}/", self.rules, f"robots.txt should Disallow /{d}/")

    def test_customer_content_not_disallowed(self):
        for path in ("/", "/md/", "/llms.txt", "/cities/", "/services/"):
            self.assertNotIn(path, self.rules)


if __name__ == "__main__":
    unittest.main()
