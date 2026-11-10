"""Regression: a named recommendation must not be hidden behind `cited`.

On 2026-11-09 Gemini answered "who can locate a hidden water leak in Laguna
Niguel?" by listing Straight Flush FIRST under "Highly Rated Local Leak
Detection Companies" and citing straightflushplumbingoc.com. Both clients
returned `cited` (the citation check short-circuited), so the daily report and
the owner's top-5 said "named in 0 of 30". Fixture below is that answer,
trimmed.
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import ai_agent_client as AC  # noqa: E402
import gemini_search_client as G  # noqa: E402

ANSWER_2026_11_09 = """To locate a hidden water leak without unnecessarily tearing through drywall or concrete, you should call a **licensed plumber or specialized leak detection service**.

---

### Highly Rated Local Leak Detection Companies Serving Laguna Niguel

* **Straight Flush Plumbing & Leak Detection**
  * *Location:* Headquartered directly in Laguna Niguel.
  * *Specialty:* Uses acoustic, thermal, and electronic equipment.
* **Above & Beyond Plumbing**
  * *Location:* Laguna Niguel (Corsair).

---

### What to Ask When You Call

1. **"Do you use non-invasive detection?"**
"""

SF_SRC = [{"url": "https://straightflushplumbingoc.com/services/leak-detection-laguna-niguel.html"}]


class PrecedenceTests(unittest.TestCase):
    def _both(self, answer, sources):
        return {G.classify_visibility(answer, sources, []),
                AC.classify_visibility(answer, sources, [])}

    def test_real_2026_11_09_answer_is_recommended(self):
        self.assertEqual(self._both(ANSWER_2026_11_09, SF_SRC), {"recommended"})

    def test_same_answer_without_citation_is_still_recommended(self):
        self.assertEqual(self._both(ANSWER_2026_11_09, []), {"recommended"})

    def test_list_under_neutral_heading_is_mentioned(self):
        text = "### Plumbers Serving Laguna Niguel\n\n* **Straight Flush Plumbing**\n* **Other Co**\n"
        self.assertEqual(self._both(text, SF_SRC), {"mentioned"})

    def test_later_neutral_heading_resets_context(self):
        text = ("### Top Picks\n\n* **Other Co**\n\n### Also In The Area\n\n"
                "* **Straight Flush Plumbing**\n")
        self.assertEqual(self._both(text, []), {"mentioned"})

    def test_cited_only_when_not_named(self):
        self.assertEqual(self._both("Several companies serve the area.", SF_SRC), {"cited"})

    def test_absent(self):
        self.assertEqual(self._both("### Top Picks\n\n* **Other Co**\n", []), {"absent"})


if __name__ == "__main__":
    unittest.main()
