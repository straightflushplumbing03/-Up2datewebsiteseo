"""Every phone number in visible page copy must be a tel: link.

Revenue analyst, 2026-11-15. PR #176 linked 67 plain-text numbers on 2026-11-12,
but nothing kept it that way: by 2026-11-15 eight newer or edited pages (city FAQs,
the FAQ hub, three city-service pages) had 13 plain-text "(949) 374-6524" again.
A plain number cannot be tapped on Android, and an iPhone auto-detected tap
bypasses assets/js/lead-events.js, so the call is never counted as
phone_call_click. This test runs scripts/link_inline_phones.py's own detector
over every public page and fails if any plain-text number is left. Fix with:
    python3 scripts/link_inline_phones.py
"""

import glob
import importlib.util
import os
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SPEC = importlib.util.spec_from_file_location(
    "link_inline_phones", os.path.join(ROOT, "scripts", "link_inline_phones.py")
)
lip = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lip)


def pages_with_plain_numbers():
    bad = []
    for path in sorted(glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        if rel.startswith(lip.EXCLUDE) or rel.startswith("growth-engine/"):
            continue
        with open(path, encoding="utf-8") as fh:
            html = fh.read()
        if 'name="robots" content="noindex' in html:
            continue
        _, n = lip.link_numbers(html)
        if n:
            bad.append(f"{rel}: {n}")
    return bad


class InlinePhonesLinked(unittest.TestCase):
    def test_no_plain_text_phone_numbers(self):
        bad = pages_with_plain_numbers()
        self.assertEqual(
            bad, [],
            "plain-text phone numbers (run python3 scripts/link_inline_phones.py):\n" + "\n".join(bad),
        )

    def test_detector_skips_links_and_schema(self):
        html = ('<head><title>(949) 374-6524</title></head><body>'
                '<script>{"t":"(949) 374-6524"}</script>'
                '<a href="tel:+19493746524">(949) 374-6524</a>'
                '<p>call (949) 374-6524</p></body>')
        out, n = lip.link_numbers(html)
        self.assertEqual(n, 1)
        self.assertIn('call <a href="tel:+19493746524" class="tel-inline">(949) 374-6524</a>', out)


if __name__ == "__main__":
    unittest.main()
