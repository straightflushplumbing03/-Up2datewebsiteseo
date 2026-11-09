"""A link whose label says "Call" or shows the phone number must dial.

Until 2026-11-05 the closing "Call (949) 374-6524" button on every city page
and case study pointed at contact.html. On a phone, tapping it opened the
contact page instead of dialing, and GA4 never recorded a phone_call_click
(lead-events.js only listens to tel: links). This test fails if any public
page reintroduces a call-labelled link that does not use tel:.
"""

import glob
import os
import re
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SKIP = ("ai-headquarters-blueprint", "briefs", "md", "growth-engine", "scripts")
LINK = re.compile(r'<a\s[^>]*?href="([^"]+)"[^>]*>(.*?)</a>', re.S)
CALL_LABEL = re.compile(r"\(949\)\s*374-6524|^\s*Call\b|\bCall (Now|Us|Lance|For)\b", re.I)


def call_links_not_dialing():
    bad = []
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.split(os.sep)[0] in SKIP:
            continue
        with open(path, encoding="utf-8") as fh:
            html = fh.read()
        for href, inner in LINK.findall(html):
            label = re.sub(r"<[^>]+>", "", inner).strip()
            if CALL_LABEL.search(label) and not href.startswith("tel:"):
                bad.append(f"{rel}: {label!r} -> {href}")
    return bad


class CallButtonsDial(unittest.TestCase):
    def test_call_labelled_links_use_tel(self):
        bad = call_links_not_dialing()
        self.assertEqual(bad, [], "call-labelled links that do not dial:\n" + "\n".join(bad))


if __name__ == "__main__":
    unittest.main()
