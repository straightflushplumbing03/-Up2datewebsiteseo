"""Guard: phone_call_click counts only taps on the business number, not agency hotlines."""
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
JS = (ROOT / "assets" / "js" / "lead-events.js").read_text(encoding="utf-8")
BUSINESS = "9493746524"


class LeadEventsPhoneScopeTest(unittest.TestCase):
    def test_business_number_constant(self):
        self.assertIn("var BUSINESS_PHONE = '%s';" % BUSINESS, JS)

    def test_phone_event_is_gated_on_business_number(self):
        gate = JS.find("=== BUSINESS_PHONE")
        event = JS.find("track('phone_call_click'")
        self.assertNotEqual(gate, -1, "phone_call_click must check the number before firing")
        self.assertNotEqual(event, -1)
        self.assertLess(gate, event)

    def test_business_tel_links_normalise_to_gate(self):
        seen = 0
        for f in ROOT.rglob("*.html"):
            if any(p in f.parts for p in ("node_modules", "geo-lab", ".git")):
                continue
            for t in re.findall(r'href="tel:([^"]+)"', f.read_text(encoding="utf-8", errors="replace")):
                if re.sub(r"\D", "", t)[-10:] == BUSINESS:
                    seen += 1
        self.assertGreater(seen, 100, "expected the business number on most pages")


if __name__ == "__main__":
    unittest.main()
