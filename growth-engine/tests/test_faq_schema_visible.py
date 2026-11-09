"""FAQPage JSON-LD must describe questions that are visible on the page.

Google's structured-data guidelines require markup to reflect visible content,
and AI engines that read both the HTML and the JSON-LD see conflicting answers
when they drift apart. On 2026-11-04 three indexable pages carried FAQPage
markup with no visible FAQ at all (south-oc-slab-leak-specialist.html,
academy/acoustic-leak-detection-explained.html,
insurance/dos-and-donts-talking-to-insurance.html). This guards the question
text; answer wording is checked loosely (first words must appear).
"""
import glob
import html
import json
import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SKIP_DIRS = ("ai-headquarters-blueprint", "briefs", "growth-engine", "node_modules", "scripts")
LD_RE = re.compile(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', re.S | re.I)
SCRIPT_RE = re.compile(r'<script.*?</script>', re.S | re.I)


def _norm(text):
    text = html.unescape(re.sub(r'<[^>]+>', ' ', text))
    return re.sub(r'\W+', ' ', text).lower().strip()


def _pages():
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.startswith(SKIP_DIRS):
            continue
        yield rel, open(path, encoding="utf-8").read()


class FaqSchemaVisibleTest(unittest.TestCase):
    def test_faq_questions_are_visible(self):
        problems = []
        for rel, src in _pages():
            if re.search(r'<meta name="robots"[^>]*noindex', src, re.I):
                continue
            body = _norm(SCRIPT_RE.sub(' ', src))
            for match in LD_RE.finditer(src):
                data = json.loads(match.group(1))
                items = data if isinstance(data, list) else data.get("@graph", [data])
                for node in items:
                    if node.get("@type") != "FAQPage":
                        continue
                    for q in node.get("mainEntity", []):
                        if _norm(q["name"]) not in body:
                            problems.append(f"{rel}: question not visible: {q['name']}")
                            continue
                        answer = _norm(q["acceptedAnswer"]["text"])
                        head = " ".join(answer.split()[:8])
                        if head not in body:
                            problems.append(f"{rel}: answer not visible: {q['name']}")
        self.assertEqual(problems, [], "\n".join(problems))


if __name__ == "__main__":
    unittest.main()
