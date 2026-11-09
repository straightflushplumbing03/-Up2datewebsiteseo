"""Guard: bot submissions caught by the Formspree honeypot must not count as GA4 leads."""
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
JS = (ROOT / "assets" / "js" / "lead-events.js").read_text(encoding="utf-8")


class LeadEventsHoneypotTest(unittest.TestCase):
    def test_honeypot_check_runs_before_generate_lead(self):
        guard = JS.find("_gotcha.value) return;")
        lead = JS.find("track('generate_lead'")
        self.assertNotEqual(guard, -1, "lead-events.js must skip submissions with a filled _gotcha field")
        self.assertNotEqual(lead, -1)
        self.assertLess(guard, lead, "honeypot check must come before the generate_lead event")

    def test_forms_still_have_honeypot(self):
        for page in ("contact.html", "index.html"):
            html = (ROOT / page).read_text(encoding="utf-8")
            self.assertRegex(html, r'name="_gotcha"', f"{page} lost its honeypot field")


if __name__ == "__main__":
    unittest.main()
