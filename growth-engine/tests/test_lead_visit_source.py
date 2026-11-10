"""Guard: form leads carry where the visit began (visit_source, landing_page) into the Formspree email.

The owner reads leads in the Formspree email, not GA4, so this is the only per-lead view of
whether a lead came from ChatGPT, Google or a directory. Only host names and our own paths are sent.
"""
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
JS = (ROOT / "assets" / "js" / "lead-events.js").read_text(encoding="utf-8")


class LeadVisitSourceTest(unittest.TestCase):
    def test_form_is_stamped_before_it_is_sent(self):
        stamp = JS.find("stampForm(f);")
        guard = JS.find("_gotcha.value) return;")
        fetch = JS.find("fetch(f.action")
        self.assertNotEqual(stamp, -1, "submit handler must add visit_source/landing_page to the form")
        self.assertLess(guard, stamp, "honeypot check must still run first")
        self.assertLess(stamp, fetch, "fields must be on the form before FormData is built")

    def test_fields_and_storage_are_safe(self):
        for name in ("'visit_source'", "'landing_page'", "sessionStorage", "utm_source", "document.referrer"):
            self.assertIn(name, JS)
        # storage can throw in private mode; every access must be guarded
        self.assertEqual(JS.count("sessionStorage."), 2)
        self.assertGreaterEqual(JS.count("try {"), 4)
        # referrer is reduced to a host name; full referrer URLs (which can carry search terms) are never sent
        self.assertIn(".hostname", JS)


if __name__ == "__main__":
    unittest.main()
